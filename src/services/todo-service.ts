import type { Todo } from "@/lib/schemas";

export type TodoFilter = "all" | "active" | "completed";

export interface TodoService {
  /** Returns todos sorted by createdAt descending. */
  list(filter?: TodoFilter): Promise<Todo[]>;

  /** Trims the title; rejects blank or >200-char titles (throws ZodError). */
  create(data: { title: string }): Promise<Todo>;

  /**
   * Applies the patch to the matching todo and updates updatedAt.
   * Throws NotFoundError if the id does not exist.
   */
  update(
    id: string,
    patch: { title?: string; completed?: boolean }
  ): Promise<Todo>;

  /**
   * Removes the matching todo.
   * Throws NotFoundError if the id does not exist.
   */
  remove(id: string): Promise<void>;
}
