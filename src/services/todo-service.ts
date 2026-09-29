import type {
  Todo,
  Priority,
  CreateTodoInput,
  TodoPatchInput,
} from "@/lib/schemas";

export type TodoFilter = "all" | "active" | "completed";
export type SortOption = "newest" | "dueDate" | "priority";

export interface ListOptions {
  filter?: TodoFilter;
  priority?: Priority | "all";
  category?: string | "all";
  sortBy?: SortOption;
}

export interface TodoService {
  /** Returns todos sorted and filtered according to options or filter string. */
  list(options?: ListOptions | TodoFilter): Promise<Todo[]>;

  /** Creates a todo validating against CreateTodoSchema. */
  create(data: CreateTodoInput | { title: string }): Promise<Todo>;

  /**
   * Applies the patch to the matching todo and updates updatedAt.
   * Throws NotFoundError if the id does not exist.
   */
  update(id: string, patch: TodoPatchInput): Promise<Todo>;

  /**
   * Removes the matching todo.
   * Throws NotFoundError if the id does not exist.
   */
  remove(id: string): Promise<void>;
}
