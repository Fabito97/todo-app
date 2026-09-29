import {
  LocalTodoService,
  subscribeStorageNotice,
  setStorageNotice,
} from "./local-todo-service";
import type { TodoService } from "./todo-service";

export const todoService: TodoService = new LocalTodoService();
export { LocalTodoService, subscribeStorageNotice, setStorageNotice };
export type { TodoService, TodoFilter } from "./todo-service";
