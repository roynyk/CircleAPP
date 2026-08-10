import z from "zod";

export const loginSchemaForm = z.object({
  validation: z.string().min(5, "email/username gaboleh kosong"),
  password: z.string().min(6, "password gaboleh kosong"),
});

export const registerSchemaForm = z.object({
  username: z.string().min(5, "Username harus lebih dari 5 karakter"),
  fullName: z.string().min(5, "Fullname harus lebih dari 5 karakter"),
  email: z.string().min(11, "Email harus lebih dari 11 karakter"),
  password: z.string().min(6, "password harus lebih dari 6 karakter"),
});

export type LoginForm = z.infer<typeof loginSchemaForm>;
export type RegisterForm = z.infer<typeof registerSchemaForm>;
