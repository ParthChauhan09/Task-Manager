import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Organization } from "../models/Organization";

export class OrgController {
  private static isAdmin(req: AuthRequest) {
    return req.userRole === "admin";
  }

  // GET /api/organizations
  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const orgs = await (OrgController.isAdmin(req)
        ? Organization.find().populate("owner", "name email role")
        : Organization.find({ owner: req.userId }));
      res.json(orgs);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  }

  // POST /api/organizations
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name } = req.body;
      if (!name) {
        res.status(400).json({ message: "name is required" });
        return;
      }

      const org = await Organization.create({ name, owner: req.userId, tasks: [] });
      res.status(201).json(org);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  }

  // PATCH /api/organizations/:orgId
  static async rename(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name } = req.body;
      if (!name) {
        res.status(400).json({ message: "name is required" });
        return;
      }

      const query = OrgController.isAdmin(req)
        ? { _id: req.params.orgId }
        : { _id: req.params.orgId, owner: req.userId };

      const org = await Organization.findOneAndUpdate(query, { name }, { new: true });

      if (!org) {
        res.status(404).json({ message: "Organization not found" });
        return;
      }

      res.json(org);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  }

  // DELETE /api/organizations/:orgId
  static async remove(req: AuthRequest, res: Response): Promise<void> {
    try {
      const query = OrgController.isAdmin(req)
        ? { _id: req.params.orgId }
        : { _id: req.params.orgId, owner: req.userId };

      const org = await Organization.findOneAndDelete(query);

      if (!org) {
        res.status(404).json({ message: "Organization not found" });
        return;
      }

      res.json({ message: "Organization deleted" });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  }
}
