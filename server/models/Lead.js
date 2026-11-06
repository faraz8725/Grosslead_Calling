
const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true
    },

    company: {
      type: String,
      default: "",
      trim: true
    },

    source: {
      type: String,
      enum: ["manual", "excel", "website", "other"],
      default: "manual"
    },

    status: {
      type: String,
      enum: [
        "new",
        "pending",
        "calling",
        "connected",
        "follow-up",
        "completed",
        "failed"
      ],
      default: "new"
    },

    interest: {
      type: String,
      enum: ["positive", "negative", "medium", "unknown"],
      default: "unknown"
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    notes: {
      type: String,
      default: ""
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    lastCalledAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate phone numbers in the database.
leadSchema.index(
  { phone: 1 },
  { unique: true }
);

module.exports = mongoose.model("Lead", leadSchema);
