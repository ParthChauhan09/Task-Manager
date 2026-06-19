import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    authProvider: "local" | "google";
    comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: { type: String, required: false, minlength: 6 },
        googleId: { type: String, unique: true, sparse: true, trim: true },
        authProvider: {
            type: String,
            enum: ["local", "google"],
            required: true,
            default: "local",
        },
    },
    { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function () {
    if (!this.password || !this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Instance method to compare passwords
UserSchema.methods.comparePassword = function (candidate: string) {
    if (!this.password) return false;
    return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser>("User", UserSchema);
