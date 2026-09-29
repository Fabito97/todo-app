import { LocalTodoService } from "./local-todo-service";
import type { TodoService } from "./todo-service";

export const todoService: TodoService = new LocalTodoService();
export { LocalTodoService };
export type { TodoService, TodoFilter } from "./todo-service";
