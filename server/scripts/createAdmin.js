/*
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } =
      process.env;

    if (
      !ADMIN_NAME ||
      !ADMIN_EMAIL ||
      !ADMIN_PASSWORD ||
      ADMIN_PASSWORD.length < 12
    ) {
      throw new Error(
        "Set valid admin details in .env. Password must be at least 12 characters."
      );
    }

    const existingUser = await User.findOne({
      email: ADMIN_EMAIL.toLowerCase().trim()
    });

    if (existingUser) {
      console.log("Admin account already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      ADMIN_PASSWORD,
      12
    );

    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin"
    });

    console.log("Admin created successfully!");

  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
*/


require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI } =
      process.env;

    if (!MONGO_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("Missing required environment variables");
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error("Password must be at least 12 characters");
    }

    await mongoose.connect(MONGO_URI);

    const email = ADMIN_EMAIL.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const admin = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name: ADMIN_NAME,
          email,
          password: hashedPassword,
          role: "admin",
          isActive: true
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    console.log("Admin saved successfully!");
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);
    console.log("Active:", admin.isActive);

  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
    }
  }
};

createAdmin();
