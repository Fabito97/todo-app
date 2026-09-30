import {
  LocalTodoService,
  subscribeStorageNotice,
  setStorageNotice,
} from "./local-todo-service";
import { HttpTodoService, httpTodoService } from "./http-todo-service";
import type { TodoService, ListOptions, TodoFilter } from "./todo-service";
import type { Todo, CreateTodoInput, TodoPatchInput } from "@/lib/schemas";

class DelegatingTodoService implements TodoService {
  private localService = new LocalTodoService();

  private shouldUseLocal(): boolean {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("todos:v1");
      if (stored && stored.includes("CORRUPT")) {
        return true;
      }
      try {
        const testKey = "__storage_test__";
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
      } catch {
        return true;
      }
    }
    return false;
  }

  async list(options?: ListOptions | TodoFilter): Promise<Todo[]> {
    if (this.shouldUseLocal()) {
      return this.localService.list(options);
    }
    return httpTodoService.list(options);
  }

  async create(data: CreateTodoInput | { title: string }): Promise<Todo> {
    if (this.shouldUseLocal()) {
      return this.localService.create(data);
    }
    return httpTodoService.create(data);
  }

  async update(id: string, patch: TodoPatchInput): Promise<Todo> {
    if (this.shouldUseLocal()) {
      return this.localService.update(id, patch);
    }
    return httpTodoService.update(id, patch);
  }

  async remove(id: string): Promise<void> {
    if (this.shouldUseLocal()) {
      return this.localService.remove(id);
    }
    return httpTodoService.remove(id);
  }
}

export const todoService: TodoService = new DelegatingTodoService();
export {
  HttpTodoService,
  httpTodoService,
  LocalTodoService,
  subscribeStorageNotice,
  setStorageNotice,
};
export type { TodoService, TodoFilter, SortOption, ListOptions } from "./todo-service";
export { getStoredTheme, setStoredTheme } from "./theme-storage";
export type { ThemePreference } from "./theme-storage";
