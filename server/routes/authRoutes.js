
const express = require("express");

const router = express.Router();

const {
  login,
  getProfile,
  logout
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

router.post("/login", login);
router.get("/profile", protect, getProfile);
router.post("/logout", protect, logout);

module.exports = router;
