import { Router } from "express";
import {
  changePassword,
  getSession,
  login,
} from "../controllers/authController.js";
import { protect, protectAdmin } from "../middleware/auth.js";

const authRoutes = Router();

authRoutes.post("/login", login);
authRoutes.get("/session", protect, getSession);
authRoutes.post("/change-password", protect, changePassword);

export default authRoutes;
