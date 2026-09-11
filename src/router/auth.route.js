import { Router } from "express";
import { login } from "../controllers/auth.controller.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/login", authLimiter, login);

export default router;