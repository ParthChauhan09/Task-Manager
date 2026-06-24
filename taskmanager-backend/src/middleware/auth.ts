import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { isValidObjectId } from "../utils/validation";

export interface AuthRequest extends Request {
    userId?: string;
    userRole?: "user" | "admin";
    userEmail?: string;
}

export function protect(req: AuthRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Not authorized, no token" });
        return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Not authorized, token missing" });
        return;
    }

    try {
        const secret = process.env.JWT_SECRET as string;
        const decoded = jwt.verify(token, secret) as { id: string };

        if (!decoded || !decoded.id || !isValidObjectId(decoded.id)) {
            res.status(401).json({ message: "Not authorized, invalid token payload" });
            return;
        }

        User.findById(decoded.id)
            .select("email role")
            .then((user) => {
                if (!user) {
                    res.status(401).json({ message: "Not authorized, user not found" });
                    return;
                }

                req.userId = user.id;
                req.userEmail = user.email;
                req.userRole = user.role as "user" | "admin";
                next();
            })
            .catch(() => {
                res.status(401).json({ message: "Not authorized, token invalid or expired" });
            });
    } catch {
        res.status(401).json({ message: "Not authorized, token invalid or expired" });
    }
}
