const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  startLeadCall,
  getCalls,
  getCallById,
  deleteCall
} = require("../controllers/callController");

const router = express.Router();
router.use(protect);

router.post("/lead/:leadId", startLeadCall);
router.get("/", getCalls);
router.get("/:id", getCallById);
router.delete("/:id", deleteCall);

module.exports = router;
