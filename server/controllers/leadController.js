
const Lead = require("../models/Lead");
const User = require("../models/User");
const normalizePhone = require("../utils/normalizePhone");

const canAccessLead = (lead, user) => {
  if (user.role === "admin") return true;

  return (
    lead.createdBy.toString() === user._id.toString() ||
    lead.assignedTo?.toString() === user._id.toString()
  );
};

// GET ALL LEADS
exports.getLeads = async (req, res) => {
  try {
    const {
      search = "",
      status,
      interest,
      page = 1,
      limit = 20
    } = req.query;

    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));

    const filter = {};

    if (req.user.role !== "admin") {
      filter.$or = [
        { createdBy: req.user._id },
        { assignedTo: req.user._id }
      ];
    }

    if (search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$and = [
        {
          $or: [
            { name: { $regex: escaped, $options: "i" } },
            { phone: { $regex: escaped, $options: "i" } },
            { email: { $regex: escaped, $options: "i" } },
            { company: { $regex: escaped, $options: "i" } }
          ]
        }
      ];
    }

    if (status) filter.status = status;
    if (interest) filter.interest = interest;

    const total = await Lead.countDocuments(filter);

    const leads = await Lead.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize);

    res.json({
      success: true,
      total,
      page: currentPage,
      pages: Math.ceil(total / pageSize),
      leads
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ADD LEAD
exports.createLead = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      company,
      notes
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required"
      });
    }

    const normalizedPhone = normalizePhone(phone);

    const existing = await Lead.findOne({
      phone: normalizedPhone
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This phone number already exists"
      });
    }

    const lead = await Lead.create({
      name,
      phone: normalizedPhone,
      email,
      company,
      notes,
      source: "manual",
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      lead
    });

  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      success: false,
      message: error.code === 11000
        ? "Phone number already exists"
        : error.message
    });
  }
};

// GET SINGLE LEAD
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name");

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }

    if (!canAccessLead(lead, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    res.json({
      success: true,
      lead
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid lead ID"
    });
  }
};

// UPDATE LEAD
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }

    if (!canAccessLead(lead, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const allowedFields = [
      "name",
      "email",
      "company",
      "notes"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        lead[field] = req.body[field];
      }
    });

    if (req.body.phone !== undefined) {
      const normalizedPhone = normalizePhone(req.body.phone);

      const duplicate = await Lead.findOne({
        phone: normalizedPhone,
        _id: { $ne: lead._id }
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Phone number already exists"
        });
      }

      lead.phone = normalizedPhone;
    }

    await lead.save();

    res.json({
      success: true,
      message: "Lead updated successfully",
      lead
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.code === 11000
        ? "Phone number already exists"
        : error.message
    });
  }
};

// DELETE LEAD
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete leads"
      });
    }

    await lead.deleteOne();

    res.json({
      success: true,
      message: "Lead deleted successfully"
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// GET TEAM MEMBERS
exports.getTeamMembers = async (req, res) => {
  try {
    const users = await User.find({
      isActive: true
    }).select("name email role");

    res.json({
      success: true,
      users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ASSIGN LEAD
exports.assignLead = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can assign leads"
      });
    }

    const { assignedTo } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }

    if (assignedTo) {
      const member = await User.findOne({
        _id: assignedTo,
        isActive: true
      });

      if (!member) {
        return res.status(404).json({
          success: false,
          message: "Active team member not found"
        });
      }

      lead.assignedTo = member._id;
    } else {
      lead.assignedTo = null;
    }

    await lead.save();

    res.json({
      success: true,
      message: "Lead assignment updated",
      lead
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
