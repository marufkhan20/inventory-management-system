import * as z from "zod";

export const signinSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase() // Automatically sanitizes input
    .trim(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

// Infer the TypeScript type from the schema
export type SigninData = z.infer<typeof signinSchema>;
