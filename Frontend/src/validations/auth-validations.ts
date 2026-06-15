import z from "zod";

export const loginSchemaForm = z.object({
  validation: z.string().min(1, "Email or Username is required"),
  password: z.string().min(6, "Password is required"),
});

export const registerSchemaForm = z.object({
  username: z.string().min(5, "Username is required"),
  fullName: z.string().min(5, "FullName is required"),
  email: z.string().min(1, "Email is required"),
  password: z.string().min(6, "Password is required"),
});

export type LoginForm = z.infer<typeof loginSchemaForm>;
export type RegisterForm = z.infer<typeof registerSchemaForm>;
