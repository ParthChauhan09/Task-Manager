import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import { connectDB } from "./db";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import orgRoutes from "./routes/organizations";
import taskRoutes from "./routes/tasks";
import { protect } from "./middleware/auth";

dotenv.config();

// ── Startup Validation ─────────────────────────────────────────────────────
const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((env) => !process.env[env]);
if (missingEnv.length > 0) {
  console.error(`FATAL: Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// ── Basic Security Headers ─────────────────────────────────────────────────
app.use(helmet());

// ── NoSQL Query Injection Sanitization ─────────────────────────────────────
app.use(mongoSanitize());

// ── CORS Configuration ─────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:5173"]; // Fallback to React development ports

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ── Rate Limiting ──────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: { message: "Too many requests from this IP, please try again after 15 minutes." },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 authentication/login requests per window
  message: { message: "Too many auth attempts from this IP, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limits
app.use("/api/", generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ── Public Routes ──────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Task Manager API is running securely" });
});

// ── Protected — valid JWT required for everything below ───────────────────
app.use(protect as any);

app.use("/api/organizations", orgRoutes);
app.use("/api/admin", adminRoutes);

// Tasks and subtasks are nested under an org
app.use("/api/organizations/:orgId/tasks", taskRoutes);

// ── 404 Route handler ──────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "API Route not found" });
});

// ── Global Error Handling Middleware ───────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled Application Error:", err);
  
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(status).json({
    message: process.env.NODE_ENV === "production" ? "An internal server error occurred" : message,
  });
});

// ── Start ─────────────────────────────────────────────────────────────────
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
