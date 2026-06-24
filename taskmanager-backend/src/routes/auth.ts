import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/google", AuthController.google);
router.get("/me", protect as any, AuthController.me);

export default router;
