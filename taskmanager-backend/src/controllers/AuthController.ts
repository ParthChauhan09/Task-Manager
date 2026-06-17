import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "../models/User";

export class AuthController {
    private static signToken(id: string): string {
        const options: SignOptions = {
            expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
        };
        return jwt.sign({ id }, process.env.JWT_SECRET as string, options);
    }

    // POST /api/auth/register
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                res.status(400).json({ message: "name, email and password are required" });
                return;
            }

            const existing = await User.findOne({ email });
            if (existing) {
                res.status(409).json({ message: "Email already registered" });
                return;
            }

            const user = await User.create({ name, email, password });
            const token = AuthController.signToken(user.id);

            res.status(201).json({
                token,
                user: { id: user.id, name: user.name, email: user.email },
            });
        } catch {
            res.status(500).json({ message: "Server error" });
        }
    }

    // POST /api/auth/login
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ message: "email and password are required" });
                return;
            }

            const user = await User.findOne({ email });
            if (!user || !(await user.comparePassword(password))) {
                res.status(401).json({ message: "Invalid email or password" });
                return;
            }

            const token = AuthController.signToken(user.id);

            res.json({
                token,
                user: { id: user.id, name: user.name, email: user.email },
            });
        } catch {
            res.status(500).json({ message: "Server error" });
        }
    }

    // GET /api/auth/me
    static async me(req: Request, res: Response): Promise<void> {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                res.status(401).json({ message: "Not authorized" });
                return;
            }

            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
            const user = await User.findById(decoded.id).select("-password");

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            res.json({ user: { id: user.id, name: user.name, email: user.email } });
        } catch {
            res.status(401).json({ message: "Not authorized, token invalid or expired" });
        }
    }
}
