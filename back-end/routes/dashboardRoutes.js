import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getDashboard } from "../controllers/DashboardController.js";

const dashboardRouter = Router();

dashboardRouter.get("/", protect, getDashboard);

export default dashboardRouter;
