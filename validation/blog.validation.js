import z from "zod";

const createBlogSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is  required")
      .max(100, "Title cannot exceed 100 characters"),
    content: z.string().min(1, "Blog content is required"),
    tags: z.array(z.string()).optional(),
    published: z.boolean().optional(),
  })
  .passthrough();

export { createBlogSchema };
