import User from "../modals/User.js";
import bcrypt from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";

// Login for employee and admin
// POST /api/auth/login

export const login = async (req, res) => {
  try {
    const { email, password, role_type } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (role_type === "admin" && user.role !== "ADMIN") {
      return res.status(401).json({ message: "Unauthorized: Not an admin" });
    }
    if (role_type === "employee" && user.role !== "EMPLOYEE") {
      return res.status(401).json({ message: "Unauthorized: Not an employee" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({ user: payload, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get session for employee and admin
// GET /api/auth/session
export const getSession = async (req, res) => {
  const session = req.session;
  return res.json({ User: session });
  try {
  } catch (error) {}
};

// change password for employee and admin
// POST /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const session = req.session;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both passwords are required" });
    }
    const user = await User.findById(session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.findByIdAndUpdate(session.userId, { password: hashedPassword });
    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
