import type { TodoService, ListOptions, TodoFilter } from "@/services/todo-service";
import {
  type Todo,
  type CreateTodoInput,
  type TodoPatchInput,
  CreateTodoSchema,
  TodoPatchSchema,
} from "@/lib/schemas";
import { NotFoundError } from "@/lib/errors";
import { todos, type TodoRow } from "./schema";
import { db as defaultDb, type AppDatabase } from "./db";
import { eq, and, sql, desc, asc } from "drizzle-orm";

function toTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    description: row.description ?? "",
    priority: row.priority as Todo["priority"],
    dueDate: row.dueDate ?? null,
    startTime: row.startTime ?? null,
    endTime: row.endTime ?? null,
    category: row.category ?? null,
    createdAt: typeof row.createdAt === "string" ? row.createdAt : new Date(row.createdAt).toISOString(),
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : new Date(row.updatedAt).toISOString(),
  };
}

export class TodoRepository implements TodoService {
  constructor(private db: AppDatabase = defaultDb) {}

  async list(options?: ListOptions | TodoFilter): Promise<Todo[]> {
    let filter: TodoFilter = "all";
    let priority: string = "all";
    let category: string = "all";
    let sortBy: string = "newest";

    if (typeof options === "string") {
      filter = options;
    } else if (options) {
      if (options.filter) filter = options.filter;
      if (options.priority) priority = options.priority;
      if (options.category) category = options.category;
      if (options.sortBy) sortBy = options.sortBy;
    }

    const conditions = [];

    if (filter === "active") {
      conditions.push(eq(todos.completed, false));
    } else if (filter === "completed") {
      conditions.push(eq(todos.completed, true));
    }

    if (priority !== "all") {
      conditions.push(eq(todos.priority, priority));
    }

    if (category !== "all") {
      conditions.push(eq(todos.category, category));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const query = this.db.select().from(todos).where(whereClause);

    let rows: TodoRow[];
    if (sortBy === "dueDate") {
      rows = await query.orderBy(
        sql`${todos.dueDate} IS NULL ASC`,
        asc(todos.dueDate),
        sql`${todos.startTime} IS NULL ASC`,
        asc(todos.startTime),
        desc(todos.createdAt)
      );
    } else if (sortBy === "priority") {
      rows = await query.orderBy(
        sql`CASE WHEN ${todos.priority} = 'high' THEN 1 WHEN ${todos.priority} = 'medium' THEN 2 ELSE 3 END ASC`,
        desc(todos.createdAt)
      );
    } else {
      // Default: newest first
      rows = await query.orderBy(desc(todos.createdAt));
    }

    return rows.map(toTodo);
  }

  async create(data: CreateTodoInput | { title: string }): Promise<Todo> {
    const validated = CreateTodoSchema.parse(data);
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const newRow = {
      id,
      title: validated.title,
      completed: false,
      description: validated.description ?? "",
      priority: validated.priority ?? "medium",
      dueDate: validated.dueDate ?? null,
      startTime: validated.startTime ?? null,
      endTime: validated.endTime ?? null,
      category: validated.category ?? null,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(todos).values(newRow);
    return toTodo(newRow as TodoRow);
  }

  async update(id: string, patch: TodoPatchInput): Promise<Todo> {
    const validated = TodoPatchSchema.parse(patch);

    const existingRows = await this.db.select().from(todos).where(eq(todos.id, id)).limit(1);
    if (!existingRows || existingRows.length === 0) {
      throw new NotFoundError(`Todo with id ${id} not found`);
    }

    const current = existingRows[0];
    const mergedStartTime = validated.startTime !== undefined ? validated.startTime : current.startTime;
    const mergedEndTime = validated.endTime !== undefined ? validated.endTime : current.endTime;

    if (mergedStartTime && mergedEndTime && mergedEndTime <= mergedStartTime) {
      throw new Error("End time must be after start time");
    }

    const now = new Date().toISOString();
    const updateData: Partial<typeof todos.$inferInsert> = {
      updatedAt: now,
    };

    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.completed !== undefined) updateData.completed = validated.completed;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.priority !== undefined) updateData.priority = validated.priority;
    if (validated.dueDate !== undefined) updateData.dueDate = validated.dueDate;
    if (validated.startTime !== undefined) updateData.startTime = validated.startTime;
    if (validated.endTime !== undefined) updateData.endTime = validated.endTime;
    if (validated.category !== undefined) updateData.category = validated.category;

    await this.db.update(todos).set(updateData).where(eq(todos.id, id));

    const updatedRows = await this.db.select().from(todos).where(eq(todos.id, id)).limit(1);
    return toTodo(updatedRows[0]);
  }

  async remove(id: string): Promise<void> {
    const existingRows = await this.db.select().from(todos).where(eq(todos.id, id)).limit(1);
    if (!existingRows || existingRows.length === 0) {
      throw new NotFoundError(`Todo with id ${id} not found`);
    }

    await this.db.delete(todos).where(eq(todos.id, id));
  }
}

export const todoRepository = new TodoRepository();
