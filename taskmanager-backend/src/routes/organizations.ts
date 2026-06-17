import { Router } from "express";
import { OrgController } from "../controllers/OrgController";

const router = Router();

router.get("/", OrgController.getAll);
router.post("/", OrgController.create);
router.patch("/:orgId", OrgController.rename);
router.delete("/:orgId", OrgController.remove);

export default router;
