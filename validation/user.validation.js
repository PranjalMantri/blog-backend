import z from "zod";

const userSchema = z.object({
  username: z.string().min(3, "Username must be atleast 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password should atleast be 6 characters"),
});

export { userSchema };
