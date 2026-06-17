import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db";
import authRoutes from "./routes/auth";
import orgRoutes from "./routes/organizations";
import taskRoutes from "./routes/tasks";
import { protect } from "./middleware/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── Public ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "Task Manager API is running" });
});

// ── Protected — valid JWT required for everything below ───────────────────
app.use(protect);

app.use("/api/organizations", orgRoutes);

// Tasks and subtasks are nested under an org
app.use("/api/organizations/:orgId/tasks", taskRoutes);

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
