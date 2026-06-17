import { Schema, model, Document, Types } from "mongoose";

// ── Subtask ───────────────────────────────────────────────────────────────────
// Extend Types.Subdocument so Mongoose's .id() helper works on the array
export interface ISubtask extends Types.Subdocument {
  title: string;
  completed: boolean;
}

const SubtaskSchema = new Schema<ISubtask>(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

// ── Task ──────────────────────────────────────────────────────────────────────
export interface ITask extends Types.Subdocument {
  title: string;
  description?: string;
  date: string;                          // YYYY-MM-DD
  priority: "low" | "medium" | "high";
  completed: boolean;
  createdAt: Date;
  subtasks: Types.DocumentArray<ISubtask>;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    date: { type: String, required: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    completed: { type: Boolean, default: false },
    subtasks: { type: [SubtaskSchema], default: [] },
  },
  {
    _id: true,
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ── Organization ──────────────────────────────────────────────────────────────
export interface IOrganization extends Document {
  name: string;
  owner: Types.ObjectId;
  tasks: Types.DocumentArray<ITask>;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tasks: { type: [TaskSchema], default: [] },
  },
  { timestamps: true }
);

export const Organization = model<IOrganization>("Organization", OrganizationSchema);
