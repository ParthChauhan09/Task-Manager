import { Router } from "express";
import { AdminController } from "../controllers/AdminController";

const router = Router();

router.get("/overview", AdminController.overview);
router.get("/users", AdminController.users);

export default router;
