import { z } from "zod";

export const PrioritySchema = z.enum(["low", "medium", "high"]);
export type Priority = z.infer<typeof PrioritySchema>;

export const TASK_CATEGORIES = [
  "Work",
  "Personal",
  "Errands",
  "Health",
  "Finance",
  "Study",
] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const TimeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:MM (24-hour) format");

const hasValidTimeRange = (data: {
  startTime?: string | null;
  endTime?: string | null;
}) => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime;
  }
  return true;
};

export const TodoSchema = z
  .object({
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
    startTime: TimeStringSchema.nullable().optional().default(null),
    endTime: TimeStringSchema.nullable().optional().default(null),
    category: z
      .string()
      .trim()
      .max(50, "Category must be 50 characters or fewer")
      .nullable()
      .optional(),
  })
  .refine(hasValidTimeRange, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export type Todo = Omit<z.infer<typeof TodoSchema>, "startTime" | "endTime"> & {
  startTime?: string | null;
  endTime?: string | null;
};

// Used to validate a create body
export const CreateTodoSchema = z
  .object({
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
    startTime: TimeStringSchema.nullable().optional(),
    endTime: TimeStringSchema.nullable().optional(),
    category: z
      .string()
      .trim()
      .max(50, "Category must be 50 characters or fewer")
      .nullable()
      .optional(),
  })
  .refine(hasValidTimeRange, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export type CreateTodoInput = z.input<typeof CreateTodoSchema>;

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
    startTime: TimeStringSchema.nullable().optional(),
    endTime: TimeStringSchema.nullable().optional(),
    category: z
      .string()
      .trim()
      .max(50, "Category must be 50 characters or fewer")
      .nullable()
      .optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field required",
  })
  .refine(hasValidTimeRange, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export type TodoPatchInput = z.infer<typeof TodoPatchSchema>;
