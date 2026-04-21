import "dotenv/config";
import connectDB from "./config/db.js";
import User from "./modals/User.js";
import bcrypt from "bcrypt";

const TempPassword = "admin123";

async function registerAdmin() {
  try {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    if (!ADMIN_EMAIL) {
      console.error("Missing ADMIN_EMAIL in environment variables");
      process.exit(1);
    }
    await connectDB();

    const existingAdmin = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });
    if (existingAdmin) {
      console.log("User already exists as role", existingAdmin.role);
      process.exit(0);
    }
    const hashedPassword = await bcrypt.hash(TempPassword, 10);
    const admin = await User.create({
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: "ADMIN",
    });
    console.log("Admin user created");
    console.log("\nemail:", admin.email);
    console.log("password:", TempPassword);
    console.log("\nchange the password after login.");

    process.exit(0);
  } catch (error) {
    console.error("Error occurred while registering admin:", error);
  }
}

registerAdmin();
