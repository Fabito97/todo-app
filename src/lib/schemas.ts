import { z } from "zod";

export const PrioritySchema = z.enum(["low", "medium", "high"]);
export type Priority = z.infer<typeof PrioritySchema>;

export const TodoSchema = z.object({
  id: z.string().uuid(),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
  completed: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be 1000 characters or fewer")
    .optional()
    .default(""),
  priority: PrioritySchema.default("medium"),
  dueDate: z.string().nullable().optional(),
  category: z
    .string()
    .trim()
    .max(50, "Category must be 50 characters or fewer")
    .nullable()
    .optional(),
});

export type Todo = z.infer<typeof TodoSchema>;

// Used to validate a create body
export const CreateTodoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be 1000 characters or fewer")
    .optional(),
  priority: PrioritySchema.optional().default("medium"),
  dueDate: z.string().nullable().optional(),
  category: z
    .string()
    .trim()
    .max(50, "Category must be 50 characters or fewer")
    .nullable()
    .optional(),
});

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;

// Used to validate a patch body
export const TodoPatchSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(200, "Title must be 200 characters or fewer")
      .optional(),
    completed: z.boolean().optional(),
    description: z
      .string()
      .trim()
      .max(1000, "Description must be 1000 characters or fewer")
      .optional(),
    priority: PrioritySchema.optional(),
    dueDate: z.string().nullable().optional(),
    category: z
      .string()
      .trim()
      .max(50, "Category must be 50 characters or fewer")
      .nullable()
      .optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field required",
  });

export type TodoPatchInput = z.infer<typeof TodoPatchSchema>;
