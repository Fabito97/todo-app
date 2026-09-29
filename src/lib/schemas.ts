import { z } from "zod";

export const TodoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  completed: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Todo = z.infer<typeof TodoSchema>;

// Used to validate a patch body (both client and server)
export const TodoPatchSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    completed: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field required",
  });

// Used to validate a create body (both client and server)
export const CreateTodoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
});
