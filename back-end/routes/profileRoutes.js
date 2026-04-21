import {Router} from "express";
import {protect} from "../middleware/auth.js";
import {getProfile, updateProfile} from "../controllers/profileController.js";

const profileRouter = Router();
profileRouter.post("/", protect,getProfile)
profileRouter.post("/", protect, updateProfile)

export default profileRouter;