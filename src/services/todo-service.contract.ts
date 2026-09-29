import { describe, it, expect } from "vitest";
import type { TodoService } from "./todo-service";
import { NotFoundError } from "@/lib/errors";
import { ZodError } from "zod";

export function runContractTests(createService: () => TodoService | Promise<TodoService>) {
  describe("TodoService Contract", () => {
    it("returns promises for all methods", async () => {
      const service = await createService();
      const listPromise = service.list();
      expect(listPromise).toBeInstanceOf(Promise);
      await listPromise;

      const createPromise = service.create({ title: "Check promise" });
      expect(createPromise).toBeInstanceOf(Promise);
      const created = await createPromise;

      const updatePromise = service.update(created.id, { completed: true });
      expect(updatePromise).toBeInstanceOf(Promise);
      await updatePromise;

      const removePromise = service.remove(created.id);
      expect(removePromise).toBeInstanceOf(Promise);
      await removePromise;
    });

    describe("create", () => {
      it("creates a todo with valid defaults, uuid, timestamps, and completed: false", async () => {
        const service = await createService();
        const before = new Date().toISOString();
        const todo = await service.create({ title: "  Trim this title  " });
        const after = new Date().toISOString();

        expect(todo.title).toBe("Trim this title");
        expect(todo.completed).toBe(false);
        expect(typeof todo.id).toBe("string");
        expect(todo.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        expect(todo.createdAt >= before && todo.createdAt <= after).toBe(true);
        expect(todo.updatedAt).toBe(todo.createdAt);
      });

      it("rejects empty or whitespace-only title with ZodError", async () => {
        const service = await createService();
        await expect(service.create({ title: "" })).rejects.toThrow(ZodError);
        await expect(service.create({ title: "   " })).rejects.toThrow(ZodError);
      });

      it("rejects title longer than 200 characters with ZodError", async () => {
        const service = await createService();
        const longTitle = "a".repeat(201);
        await expect(service.create({ title: longTitle })).rejects.toThrow(ZodError);
      });
    });

    describe("list", () => {
      it("returns todos sorted by createdAt descending (newest first)", async () => {
        const service = await createService();
        const first = await service.create({ title: "First" });
        // small delay or distinct timestamps
        await new Promise((resolve) => setTimeout(resolve, 10));
        const second = await service.create({ title: "Second" });

        const todos = await service.list();
        expect(todos).toHaveLength(2);
        expect(todos[0].id).toBe(second.id);
        expect(todos[1].id).toBe(first.id);
      });

      it("filters by active, completed, and all correctly", async () => {
        const service = await createService();
        const t1 = await service.create({ title: "Active 1" });
        const t2 = await service.create({ title: "Completed 1" });
        await service.update(t2.id, { completed: true });

        const all = await service.list("all");
        expect(all).toHaveLength(2);

        const active = await service.list("active");
        expect(active).toHaveLength(1);
        expect(active[0].id).toBe(t1.id);

        const completed = await service.list("completed");
        expect(completed).toHaveLength(1);
        expect(completed[0].id).toBe(t2.id);
      });
    });

    describe("update", () => {
      it("updates only matching todo and updates updatedAt", async () => {
        const service = await createService();
        const todo = await service.create({ title: "Original" });
        await new Promise((resolve) => setTimeout(resolve, 10));

        const updated = await service.update(todo.id, { title: "Updated", completed: true });
        expect(updated.id).toBe(todo.id);
        expect(updated.title).toBe("Updated");
        expect(updated.completed).toBe(true);
        expect(updated.updatedAt > todo.createdAt).toBe(true);

        const list = await service.list();
        expect(list[0].title).toBe("Updated");
        expect(list[0].completed).toBe(true);
      });

      it("throws NotFoundError when updating non-existent id", async () => {
        const service = await createService();
        await expect(
          service.update("00000000-0000-0000-0000-000000000000", { completed: true })
        ).rejects.toThrow(NotFoundError);
      });
    });

    describe("remove", () => {
      it("removes the matching todo", async () => {
        const service = await createService();
        const todo = await service.create({ title: "To Delete" });
        expect(await service.list()).toHaveLength(1);

        await service.remove(todo.id);
        expect(await service.list()).toHaveLength(0);
      });

      it("throws NotFoundError when removing non-existent id", async () => {
        const service = await createService();
        await expect(
          service.remove("00000000-0000-0000-0000-000000000000")
        ).rejects.toThrow(NotFoundError);
      });
    });
  });
}
