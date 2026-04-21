import { Router } from "express";
import {
  createPaySlip,
  getPaySlipById,
  getPaySlips,
} from "../controllers/paySlipController.js";
import { protect, protectAdmin } from "../middleware/auth.js";

const payslipsRouter = Router();

payslipsRouter.post("/", protect, protectAdmin, createPaySlip);
payslipsRouter.get("/", protect, getPaySlips);
payslipsRouter.get("/:id", protect, getPaySlipById);

export default payslipsRouter;
