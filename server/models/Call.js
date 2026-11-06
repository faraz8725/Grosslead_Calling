const mongoose = require("mongoose");

const transcriptSchema = new mongoose.Schema({
  speaker: { type: String, enum: ["customer", "assistant", "system"], default: "customer" },
  text: { type: String, required: true, trim: true },
  language: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now }
}, { _id: true });

const callSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerName: { type: String, default: "" },
  phone: { type: String, required: true },
  direction: { type: String, enum: ["outbound"], default: "outbound" },
  provider: { type: String, default: "vobiz" },
  callUuid: { type: String, default: "", index: true },
  status: {
    type: String,
    enum: ["queued", "ringing", "in-progress", "completed", "failed", "busy", "no-answer"],
    default: "queued",
    index: true
  },
  duration: { type: Number, default: 0 },
  interest: { type: String, enum: ["positive", "negative", "medium", "unknown"], default: "unknown" },
  outcome: { type: String, default: "" },
  summary: { type: String, default: "" },
  transcript: { type: [transcriptSchema], default: [] },
  recordingUrl: { type: String, default: "" },
  hangupCause: { type: String, default: "" },
  startedAt: { type: Date, default: null },
  endedAt: { type: Date, default: null },
  handoffRequired: { type: Boolean, default: false },
  resolved: { type: Boolean, default: false }
}, { timestamps: true });

callSchema.index({ createdBy: 1, createdAt: -1 });
module.exports = mongoose.model("Call", callSchema);
