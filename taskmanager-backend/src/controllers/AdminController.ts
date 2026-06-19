import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { Organization } from "../models/Organization";

function requireAdmin(req: AuthRequest, res: Response): boolean {
  if (req.userRole !== "admin") {
    res.status(403).json({ message: "Admin access required" });
    return false;
  }
  return true;
}

export class AdminController {
  static async overview(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!requireAdmin(req, res)) return;

      const [users, organizations] = await Promise.all([
        User.find().select("name email role authProvider createdAt").sort({ createdAt: -1 }),
        Organization.find()
          .populate("owner", "name email role")
          .sort({ createdAt: -1 }),
      ]);

      res.json({ users, organizations });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  }

  static async users(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!requireAdmin(req, res)) return;

      const users = await User.find()
        .select("name email role authProvider createdAt")
        .sort({ createdAt: -1 });

      res.json(users);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  }
}
