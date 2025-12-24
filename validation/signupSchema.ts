import * as z from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase() // Automatically sanitizes input
    .trim(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long")
    // Use regex to enforce security standards
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character"
    ),
});

// Infer the TypeScript type from the schema
export type SignupData = z.infer<typeof signupSchema>;
