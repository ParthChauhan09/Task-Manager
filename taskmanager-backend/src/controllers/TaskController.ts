import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Organization } from "../models/Organization";
import { isValidObjectId } from "../utils/validation";

// Fetch org and verify ownership in one shot — shared by all methods
async function getAccessibleOrg(orgId: string, userId: string, isAdmin: boolean) {
    if (!isValidObjectId(orgId)) return null;
    return isAdmin ? Organization.findById(orgId) : Organization.findOne({ _id: orgId, owner: userId });
}

export class TaskController {
    // ── Tasks ────────────────────────────────────────────────────────────────

    // GET /api/organizations/:orgId/tasks
    static async getTasks(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!isValidObjectId(req.params.orgId)) {
                res.status(400).json({ message: "Invalid organization ID" });
                return;
            }

            const org = await getAccessibleOrg(req.params.orgId, req.userId!, req.userRole === "admin");
            if (!org) { res.status(404).json({ message: "Organization not found" }); return; }

            res.json(org.tasks);
        } catch {
            res.status(500).json({ message: "Server error" });
        }
    }

    // POST /api/organizations/:orgId/tasks
    static async createTask(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { title, description, date, priority } = req.body;
            if (!title || !date) {
                res.status(400).json({ message: "title and date are required" });
                return;
            }

            if (!isValidObjectId(req.params.orgId)) {
                res.status(400).json({ message: "Invalid organization ID" });
                return;
            }

            const org = await getAccessibleOrg(req.params.orgId, req.userId!, req.userRole === "admin");
            if (!org) { res.status(404).json({ message: "Organization not found" }); return; }

            org.tasks.push({
                title,
                description,
                date,
                priority: priority ?? "medium",
                completed: false,
                createdAt: new Date(),
                subtasks: [],
            });

            await org.save();
            const newTask = org.tasks[org.tasks.length - 1];
            res.status(201).json(newTask);
        } catch {
            res.status(500).json({ message: "Server error" });
        }
    }

    // PATCH /api/organizations/:orgId/tasks/:taskId
    static async updateTask(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!isValidObjectId(req.params.orgId) || !isValidObjectId(req.params.taskId)) {
                res.status(400).json({ message: "Invalid organization ID or task ID" });
                return;
            }

            const org = await getAccessibleOrg(req.params.orgId, req.userId!, req.userRole === "admin");
            if (!org) { res.status(404).json({ message: "Organization not found" }); return; }

            const task = org.tasks.id(req.params.taskId);
            if (!task) { res.status(404).json({ message: "Task not found" }); return; }

            const { title, description, date, priority, completed } = req.body;
            if (title !== undefined) task.title = title;
            if (description !== undefined) task.description = description;
            if (date !== undefined) task.date = date;
            if (priority !== undefined) task.priority = priority;
            if (completed !== undefined) {
                task.completed = completed;
                // Mirror frontend — completing the task completes all its subtasks too
                if (completed === true) {
                    task.subtasks.forEach((s) => { s.completed = true; });
                }
            }

            await org.save();
            res.json(task);
        } catch {
            res.status(500).json({ message: "Server error" });
        }
    }

    // DELETE /api/organizations/:orgId/tasks/:taskId
    static async deleteTask(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!isValidObjectId(req.params.orgId) || !isValidObjectId(req.params.taskId)) {
                res.status(400).json({ message: "Invalid organization ID or task ID" });
                return;
            }

            const org = await getAccessibleOrg(req.params.orgId, req.userId!, req.userRole === "admin");
            if (!org) { res.status(404).json({ message: "Organization not found" }); return; }

            const task = org.tasks.id(req.params.taskId);
            if (!task) { res.status(404).json({ message: "Task not found" }); return; }

            task.deleteOne();
            await org.save();
            res.json({ message: "Task deleted" });
        } catch {
            res.status(500).json({ message: "Server error" });
        }
    }

    // ── Subtasks ─────────────────────────────────────────────────────────────

    // POST /api/organizations/:orgId/tasks/:taskId/subtasks
    static async createSubtask(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { title } = req.body;
            if (!title) { res.status(400).json({ message: "title is required" }); return; }

            if (!isValidObjectId(req.params.orgId) || !isValidObjectId(req.params.taskId)) {
                res.status(400).json({ message: "Invalid organization ID or task ID" });
                return;
            }

            const org = await getAccessibleOrg(req.params.orgId, req.userId!, req.userRole === "admin");
            if (!org) { res.status(404).json({ message: "Organization not found" }); return; }

            const task = org.tasks.id(req.params.taskId);
            if (!task) { res.status(404).json({ message: "Task not found" }); return; }

            task.subtasks.push({ title, completed: false });
            // Mirror frontend — adding a subtask reopens the parent task
            task.completed = false;

            await org.save();
            const newSub = task.subtasks[task.subtasks.length - 1];
            res.status(201).json(newSub);
        } catch {
            res.status(500).json({ message: "Server error" });
        }
    }

    // PATCH /api/organizations/:orgId/tasks/:taskId/subtasks/:subtaskId
    static async updateSubtask(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!isValidObjectId(req.params.orgId) || !isValidObjectId(req.params.taskId) || !isValidObjectId(req.params.subtaskId)) {
                res.status(400).json({ message: "Invalid organization ID, task ID, or subtask ID" });
                return;
            }

            const org = await getAccessibleOrg(req.params.orgId, req.userId!, req.userRole === "admin");
            if (!org) { res.status(404).json({ message: "Organization not found" }); return; }

            const task = org.tasks.id(req.params.taskId);
            if (!task) { res.status(404).json({ message: "Task not found" }); return; }

            const sub = task.subtasks.id(req.params.subtaskId);
            if (!sub) { res.status(404).json({ message: "Subtask not found" }); return; }

            const { title, completed } = req.body;
            if (title !== undefined) sub.title = title;
            if (completed !== undefined) sub.completed = completed;

            // Mirror frontend — if all subtasks are done, auto-complete the parent task
            const allDone = task.subtasks.length > 0 && task.subtasks.every((s) => s.completed);
            if (allDone) task.completed = true;

            await org.save();
            res.json(sub);
        } catch {
            res.status(500).json({ message: "Server error" });
        }
    }

    // DELETE /api/organizations/:orgId/tasks/:taskId/subtasks/:subtaskId
    static async deleteSubtask(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!isValidObjectId(req.params.orgId) || !isValidObjectId(req.params.taskId) || !isValidObjectId(req.params.subtaskId)) {
                res.status(400).json({ message: "Invalid organization ID, task ID, or subtask ID" });
                return;
            }

            const org = await getAccessibleOrg(req.params.orgId, req.userId!, req.userRole === "admin");
            if (!org) { res.status(404).json({ message: "Organization not found" }); return; }

            const task = org.tasks.id(req.params.taskId);
            if (!task) { res.status(404).json({ message: "Task not found" }); return; }

            const sub = task.subtasks.id(req.params.subtaskId);
            if (!sub) { res.status(404).json({ message: "Subtask not found" }); return; }

            sub.deleteOne();
            await org.save();
            res.json({ message: "Subtask deleted" });
        } catch {
            res.status(500).json({ message: "Server error" });
        }
    }
}
