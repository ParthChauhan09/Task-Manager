import { Types } from "mongoose";

/**
 * Checks if a string is a valid MongoDB ObjectId.
 */
export function isValidObjectId(id: any): boolean {
  if (!id || typeof id !== "string") return false;
  return Types.ObjectId.isValid(id);
}

/**
 * Checks if a string matches a basic email address format.
 */
export function isValidEmail(email: any): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
