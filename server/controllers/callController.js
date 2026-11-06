const mongoose = require("mongoose");
const Call = require("../models/Call");
const Lead = require("../models/Lead");
const { placeOutboundCall, getPublicBaseUrl } = require("../services/vobizService");

const canAccessLead = (lead, user) => (
  user.role === "admin" ||
  lead.createdBy?.toString() === user._id.toString() ||
  lead.assignedTo?.toString() === user._id.toString()
);

exports.startLeadCall = async (req, res) => {
  let call;
  try {
    const { leadId } = req.params;
    if (!mongoose.isValidObjectId(leadId)) {
      return res.status(400).json({ success: false, message: "Invalid lead ID." });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found." });
    if (!canAccessLead(lead, req.user)) {
      return res.status(403).json({ success: false, message: "You cannot call this lead." });
    }

    call = await Call.create({
      lead: lead._id,
      createdBy: req.user._id,
      customerName: lead.name,
      phone: lead.phone,
      status: "queued"
    });

    const result = await placeOutboundCall({ call, lead });
    if (result.callUuid) call.callUuid = result.callUuid;
    await call.save();

    lead.status = "calling";
    lead.lastCalledAt = new Date();
    await lead.save();

    return res.status(201).json({
      success: true,
      message: `AI call started for ${lead.name}.`,
      call: {
        _id: call._id,
        callUuid: call.callUuid,
        phone: call.phone,
        status: call.status
      }
    });
  } catch (error) {
    if (call) {
      call.status = "failed";
      call.outcome = error.response?.data?.message || error.message;
      await call.save().catch(() => {});
    }
    const status = error.statusCode || error.response?.status || 500;
    return res.status(status).json({
      success: false,
      message: error.response?.data?.message || error.message || "Unable to start AI call."
    });
  }
};

exports.getCalls = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };
    const calls = await Call.find(filter)
      .populate("lead", "name phone")
      .sort({ createdAt: -1 })
      .limit(250);
    res.json({ success: true, calls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCallById = async (req, res) => {
  try {
    const call = await Call.findById(req.params.id).populate("lead", "name phone email");
    if (!call) return res.status(404).json({ success: false, message: "Call not found." });
    if (req.user.role !== "admin" && call.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }
    res.json({ success: true, call });
  } catch {
    res.status(400).json({ success: false, message: "Invalid call ID." });
  }
};

exports.deleteCall = async (req, res) => {
  try {
    const call = await Call.findById(req.params.id);
    if (!call) return res.status(404).json({ success: false, message: "Call not found." });
    if (req.user.role !== "admin" && call.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }
    await call.deleteOne();
    res.json({ success: true, message: "Call record deleted." });
  } catch {
    res.status(400).json({ success: false, message: "Invalid call ID." });
  }
};

// Public webhook called by Vobiz after the outbound call is answered.
exports.vobizAnswer = async (req, res) => {
  try {
    const callId = req.query.callId;
    const callUuid = req.body.CallUUID || req.body.call_uuid || "";
    if (callId && mongoose.isValidObjectId(callId)) {
      await Call.findByIdAndUpdate(callId, {
        ...(callUuid ? { callUuid } : {}),
        status: "in-progress",
        startedAt: new Date()
      });
    } else if (callUuid) {
      await Call.findOneAndUpdate({ callUuid }, { status: "in-progress", startedAt: new Date() });
    }

    const publicBaseUrl = getPublicBaseUrl();
    const wsUrl = publicBaseUrl.replace(/^https:/i, "wss:").replace(/^http:/i, "ws:") + "/ws";
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Stream bidirectional="true" keepCallAlive="true" contentType="audio/x-mulaw;rate=8000" statusCallbackUrl="${publicBaseUrl}/webhooks/vobiz/stream-status" statusCallbackMethod="POST">${wsUrl}</Stream>
</Response>`;
    res.status(200).type("application/xml").send(xml);
  } catch (error) {
    console.error("Vobiz answer webhook error:", error.message);
    res.status(200).type("application/xml").send("<Response><Speak>Sorry, this call cannot be connected right now.</Speak><Hangup/></Response>");
  }
};

exports.vobizHangup = async (req, res) => {
  try {
    const callId = req.query.callId;
    const callUuid = req.body.CallUUID || req.body.call_uuid || "";
    const duration = Math.max(0, Number(req.body.Duration || req.body.BillDuration || 0));
    const cause = String(req.body.HangupCause || req.body.hangup_cause || "");
    const lowerCause = cause.toLowerCase();
    let status = "completed";
    if (lowerCause.includes("busy")) status = "busy";
    else if (lowerCause.includes("no answer") || lowerCause.includes("no-answer")) status = "no-answer";
    else if (lowerCause.includes("fail") || lowerCause.includes("reject")) status = "failed";

    const filter = callId && mongoose.isValidObjectId(callId)
      ? { _id: callId }
      : { callUuid };
    const updatedCall = await Call.findOneAndUpdate(filter, {
      status,
      duration,
      hangupCause: cause,
      endedAt: new Date()
    }, { new: true });
    if (updatedCall?.lead) {
      await Lead.findByIdAndUpdate(updatedCall.lead, {
        status: status === "completed" ? "completed" : "pending"
      }).catch(() => {});
    }
    res.status(200).send("OK");
  } catch (error) {
    console.error("Vobiz hangup webhook error:", error.message);
    res.status(200).send("OK");
  }
};

exports.vobizStreamStatus = async (req, res) => {
  res.status(200).send("OK");
};
