import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "../models/User";

export class AuthController {
    private static userPayload(user: { id: string; name: string; email: string; role: "user" | "admin" }) {
        return { id: user.id, name: user.name, email: user.email, role: user.role };
    }

    private static signToken(id: string): string {
        const options: SignOptions = {
            expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
        };
        return jwt.sign({ id }, process.env.JWT_SECRET as string, options);
    }

    private static async fetchGoogleProfile(credential: string) {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
            throw new Error("GOOGLE_CLIENT_ID is not configured");
        }

        const url = new URL("https://oauth2.googleapis.com/tokeninfo");
        url.searchParams.set("id_token", credential);

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error("Invalid Google credential");
        }

        const profile = (await response.json()) as {
            aud?: string;
            email?: string;
            email_verified?: string;
            name?: string;
            picture?: string;
            sub?: string;
        };

        if (profile.aud !== clientId) {
            throw new Error("Google credential was issued for a different client");
        }

        if (profile.email_verified !== "true") {
            throw new Error("Google email is not verified");
        }

        if (!profile.email || !profile.sub) {
            throw new Error("Google profile is incomplete");
        }

        return profile;
    }

    private static async issueSession(user: { id: string; name: string; email: string; role: "user" | "admin" }) {
        return {
            token: AuthController.signToken(user.id),
            user: AuthController.userPayload(user),
        };
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

            const user = await User.create({ name, email, password, authProvider: "local" });
            res.status(201).json(await AuthController.issueSession(user));
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

            res.json(await AuthController.issueSession(user));
        } catch {
            res.status(500).json({ message: "Server error" });
        }
    }

    // POST /api/auth/google
    static async google(req: Request, res: Response): Promise<void> {
        try {
            const { credential } = req.body;

            if (!credential) {
                res.status(400).json({ message: "credential is required" });
                return;
            }

            const profile = await AuthController.fetchGoogleProfile(credential);
            const googleId = profile.sub;
            const email = profile.email;
            if (!email) {
                res.status(401).json({ message: "Google profile is incomplete" });
                return;
            }

            const normalizedEmail = email.toLowerCase();
            const name = (profile.name || email.split("@")[0]).trim();

            let user = await User.findOne({ $or: [{ googleId }, { email: normalizedEmail }] });

            if (user) {
                const needsLinking = !user.googleId || user.googleId !== googleId;
                if (needsLinking) {
                    user.googleId = googleId;
                    user.authProvider = "google";
                    if (!user.name && name) {
                        user.name = name;
                    }
                    await user.save();
                }
            } else {
                user = await User.create({
                    name,
                    email: normalizedEmail,
                    googleId,
                    authProvider: "google",
                });
            }

            res.json(await AuthController.issueSession(user));
        } catch (error) {
            const message = error instanceof Error ? error.message : "Server error";
            res.status(401).json({ message });
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
            const user = await User.findById(decoded.id).select("name email role");

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            res.json({ user: { id: user.id, name: user.name, email: user.email, role: (user as any).role ?? "user" } });
        } catch {
            res.status(401).json({ message: "Not authorized, token invalid or expired" });
        }
    }
}
