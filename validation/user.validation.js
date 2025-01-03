import z from "zod";

const registerUserSchema = z
  .object({
    username: z.string().min(3, "Username must be atleast 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password should atleast be 6 characters"),
  })
  .passthrough();

const loginUserSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password should atleast be 6 characters"),
  })
  .passthrough();

const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(6, "Old password should atleast be 6 characters"),
    newPassword: z
      .string()
      .min(6, "New Password should atleast be 6 characters"),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New Password should not be the same as old password",
    path: ["newPassword"],
  });

export { registerUserSchema, loginUserSchema, changePasswordSchema };
