import type { TodoService, ListOptions, TodoFilter } from "./todo-service";
import {
  type Todo,
  type CreateTodoInput,
  type TodoPatchInput,
  CreateTodoSchema,
  TodoPatchSchema,
} from "@/lib/schemas";
import { NotFoundError } from "@/lib/errors";

function toFullUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return new URL(path, window.location.origin).toString();
  }
  return `http://localhost:3000${path.startsWith("/") ? "" : "/"}${path}`;
}

export class HttpTodoService implements TodoService {
  constructor(private baseUrl: string = "/api/todos") {}

  async list(options?: ListOptions | TodoFilter): Promise<Todo[]> {
    const params = new URLSearchParams();

    if (typeof options === "string") {
      params.set("filter", options);
    } else if (options) {
      if (options.filter) params.set("filter", options.filter);
      if (options.priority) params.set("priority", options.priority);
      if (options.category) params.set("category", options.category);
      if (options.sortBy) params.set("sortBy", options.sortBy);
    }

    const queryString = params.toString();
    const relativeUrl = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    const url = toFullUrl(relativeUrl);

    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}: Failed to fetch todos`);
    }

    return res.json();
  }

  async create(data: CreateTodoInput | { title: string }): Promise<Todo> {
    const validated = CreateTodoSchema.parse(data);
    const url = toFullUrl(this.baseUrl);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validated),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}: Failed to create todo`);
    }

    return res.json();
  }

  async update(id: string, patch: TodoPatchInput): Promise<Todo> {
    const validated = TodoPatchSchema.parse(patch);
    const url = toFullUrl(`${this.baseUrl}/${encodeURIComponent(id)}`);

    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validated),
    });

    if (res.status === 404) {
      throw new NotFoundError(`Todo with id ${id} not found`);
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}: Failed to update todo`);
    }

    return res.json();
  }

  async remove(id: string): Promise<void> {
    const url = toFullUrl(`${this.baseUrl}/${encodeURIComponent(id)}`);

    const res = await fetch(url, {
      method: "DELETE",
    });

    if (res.status === 404) {
      throw new NotFoundError(`Todo with id ${id} not found`);
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}: Failed to delete todo`);
    }
  }
}

export const httpTodoService = new HttpTodoService();
