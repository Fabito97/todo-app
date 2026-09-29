import type {
  Todo,
  CreateTodoInput,
  TodoPatchInput,
} from "@/lib/schemas";
import {
  TodoSchema,
  CreateTodoSchema,
  TodoPatchSchema,
} from "@/lib/schemas";
import { NotFoundError } from "@/lib/errors";
import type {
  ListOptions,
  TodoFilter,
  TodoService,
} from "./todo-service";

const STORAGE_KEY = "todos:v1";

type NoticeListener = (notice: string | null) => void;
const noticeListeners = new Set<NoticeListener>();
let currentNotice: string | null = null;

export function setStorageNotice(notice: string | null) {
  currentNotice = notice;
  noticeListeners.forEach((listener) => listener(notice));
}

export function subscribeStorageNotice(listener: NoticeListener): () => void {
  noticeListeners.add(listener);
  listener(currentNotice);
  return () => {
    noticeListeners.delete(listener);
  };
}

const PRIORITY_WEIGHT = {
  high: 3,
  medium: 2,
  low: 1,
} as const;

export class LocalTodoService implements TodoService {
  private inMemoryFallback: Todo[] = [];

  private readStorage(): Todo[] {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return this.inMemoryFallback;
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return this.inMemoryFallback.length > 0 ? this.inMemoryFallback : [];
      }
      try {
        const parsed = JSON.parse(raw);
        const result = TodoSchema.array().safeParse(parsed);
        if (!result.success) {
          setStorageNotice("Stored data was corrupt or invalid and could not be loaded.");
          return [];
        }
        return result.data;
      } catch {
        setStorageNotice("Stored data was corrupt or invalid and could not be loaded.");
        return [];
      }
    } catch {
      return this.inMemoryFallback;
    }
  }

  private writeStorage(todos: Todo[]): void {
    this.inMemoryFallback = todos;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      }
    } catch (err) {
      setStorageNotice("Storage write failed. Changes will only persist in memory for this session.");
      console.warn("Failed to persist todos to localStorage:", err);
    }
  }

  async list(options?: ListOptions | TodoFilter): Promise<Todo[]> {
    const todos = this.readStorage();
    let filter: TodoFilter | undefined;
    let priorityFilter: string | undefined;
    let categoryFilter: string | undefined;
    let sortBy: "newest" | "dueDate" | "priority" = "newest";

    if (typeof options === "string") {
      filter = options;
    } else if (options) {
      filter = options.filter;
      priorityFilter = options.priority;
      categoryFilter = options.category;
      if (options.sortBy) {
        sortBy = options.sortBy;
      }
    }

    let filtered = [...todos];

    if (filter === "active") {
      filtered = filtered.filter((t) => !t.completed);
    } else if (filter === "completed") {
      filtered = filtered.filter((t) => t.completed);
    }

    if (priorityFilter && priorityFilter !== "all") {
      filtered = filtered.filter((t) => t.priority === priorityFilter);
    }

    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter(
        (t) => t.category?.toLowerCase() === categoryFilter?.toLowerCase()
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      if (sortBy === "priority") {
        const weightA = PRIORITY_WEIGHT[a.priority ?? "medium"];
        const weightB = PRIORITY_WEIGHT[b.priority ?? "medium"];
        return weightB - weightA;
      }

      // Default: newest first by createdAt
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return filtered;
  }

  async create(data: CreateTodoInput | { title: string }): Promise<Todo> {
    const validated = CreateTodoSchema.parse(data);
    const now = new Date().toISOString();

    const newTodo: Todo = TodoSchema.parse({
      id: crypto.randomUUID(),
      title: validated.title,
      completed: false,
      createdAt: now,
      updatedAt: now,
      description: validated.description ?? "",
      priority: validated.priority ?? "medium",
      dueDate: validated.dueDate ?? null,
      category: validated.category ?? null,
    });

    const current = this.readStorage();
    const updated = [newTodo, ...current];
    this.writeStorage(updated);

    return newTodo;
  }

  async update(id: string, patch: TodoPatchInput): Promise<Todo> {
    const validatedPatch = TodoPatchSchema.parse(patch);
    const current = this.readStorage();
    const index = current.findIndex((t) => t.id === id);

    if (index === -1) {
      throw new NotFoundError(id);
    }

    const existing = current[index];
    const now = new Date().toISOString();

    const updatedTodo: Todo = TodoSchema.parse({
      ...existing,
      ...(validatedPatch.title !== undefined ? { title: validatedPatch.title } : {}),
      ...(validatedPatch.completed !== undefined
        ? { completed: validatedPatch.completed }
        : {}),
      ...(validatedPatch.description !== undefined
        ? { description: validatedPatch.description }
        : {}),
      ...(validatedPatch.priority !== undefined
        ? { priority: validatedPatch.priority }
        : {}),
      ...(validatedPatch.dueDate !== undefined
        ? { dueDate: validatedPatch.dueDate }
        : {}),
      ...(validatedPatch.category !== undefined
        ? { category: validatedPatch.category }
        : {}),
      updatedAt: now,
    });

    const updatedList = [...current];
    updatedList[index] = updatedTodo;
    this.writeStorage(updatedList);

    return updatedTodo;
  }

  async remove(id: string): Promise<void> {
    const current = this.readStorage();
    const index = current.findIndex((t) => t.id === id);

    if (index === -1) {
      throw new NotFoundError(id);
    }

    const updatedList = current.filter((t) => t.id !== id);
    this.writeStorage(updatedList);
  }
}
