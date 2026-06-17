import { Router } from "express";
import { TaskController } from "../controllers/TaskController";

const router = Router({ mergeParams: true }); // inherits :orgId from parent router

// Tasks
router.get("/", TaskController.getTasks);
router.post("/", TaskController.createTask);
router.patch("/:taskId", TaskController.updateTask);
router.delete("/:taskId", TaskController.deleteTask);

// Subtasks
router.post("/:taskId/subtasks", TaskController.createSubtask);
router.patch("/:taskId/subtasks/:subtaskId", TaskController.updateSubtask);
router.delete("/:taskId/subtasks/:subtaskId", TaskController.deleteSubtask);

export default router;
