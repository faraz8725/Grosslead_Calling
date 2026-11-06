
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const ensureAdmin = async () => {
  try {
    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD;

    if (!name || !email || !password) {
      throw new Error("Admin environment variables are missing");
    }

    if (password.length < 12) {
      throw new Error("Admin password must be at least 12 characters");
    }

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists:", email);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      isActive: true
    });

    console.log("Admin account created successfully");
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    throw error;
  }
};

module.exports = ensureAdmin;
