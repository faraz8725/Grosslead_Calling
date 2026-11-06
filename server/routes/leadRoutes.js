
const express = require("express");
const multer = require("multer");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  deleteLead,
  getTeamMembers,
  assignLead
} = require("../controllers/leadController");

const {
  importLeads
} = require("../controllers/leadImportController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      ".xlsx",
      ".xls",
      ".csv"
    ];

    const extension = require("path")
      .extname(file.originalname)
      .toLowerCase();

    if (allowed.includes(extension)) {
      cb(null, true);
    } else {
      cb(new Error("Only XLSX, XLS and CSV files are allowed"));
    }
  }
});

router.use(protect);

router.get("/", getLeads);
router.post("/", createLead);

router.get("/team", getTeamMembers);
router.post("/import", upload.single("file"), importLeads);

router.get("/:id", getLeadById);
router.put("/:id", updateLead);
router.delete("/:id", deleteLead);
router.patch("/:id/assign", assignLead);

module.exports = router;
