// lib/zod.ts
import { z } from 'zod';

// Schema for user signup
export const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

// Schema for user login
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }), // Can be less strict than signup if desired
});

// Schema for sending a chat message
export const chatMessageSchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty" }).trim(), // Trim whitespace
  chatId: z.string().cuid({ message: "Invalid Chat ID format" }).optional(), // Optional: CUID format if provided
});

// Schema for chat history request (query parameter)
// Note: Query params are always strings, so we refine after parsing.
export const chatHistorySchema = z.object({
    // We expect chatId as a string from query params
    chatId: z.string({ required_error: "Chat ID is required" })
             .cuid({ message: "Invalid Chat ID format" }), // Validate it's a CUID
});

// Define TypeScript types inferred from Zod schemas for better type safety
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
// For chat history, the input comes from URLSearchParams, which are strings.
// The schema validates the structure after parsing.
export type ChatHistoryQueryInput = z.infer<typeof chatHistorySchema>;
