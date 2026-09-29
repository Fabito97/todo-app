import type { Todo } from "@/lib/schemas";
import {
  TodoSchema,
  CreateTodoSchema,
  TodoPatchSchema,
} from "@/lib/schemas";
import { NotFoundError } from "@/lib/errors";
import type { TodoFilter, TodoService } from "./todo-service";

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

  async list(filter?: TodoFilter): Promise<Todo[]> {
    const todos = this.readStorage();
    const sorted = [...todos].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (filter === "active") {
      return sorted.filter((t) => !t.completed);
    }
    if (filter === "completed") {
      return sorted.filter((t) => t.completed);
    }
    return sorted;
  }

  async create(data: { title: string }): Promise<Todo> {
    const validated = CreateTodoSchema.parse(data);
    const now = new Date().toISOString();

    const newTodo: Todo = TodoSchema.parse({
      id: crypto.randomUUID(),
      title: validated.title,
      completed: false,
      createdAt: now,
      updatedAt: now,
    });

    const current = this.readStorage();
    const updated = [newTodo, ...current];
    this.writeStorage(updated);

    return newTodo;
  }

  async update(
    id: string,
    patch: { title?: string; completed?: boolean }
  ): Promise<Todo> {
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
