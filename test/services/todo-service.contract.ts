import { describe, it, expect } from "vitest";
import type { TodoService } from "@/services/todo-service";
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

      it("supports filtering by priority and category", async () => {
        const service = await createService();
        await service.create({ title: "Work High", priority: "high", category: "work" });
        await service.create({ title: "Personal Low", priority: "low", category: "personal" });

        const highOnly = await service.list({ priority: "high" });
        expect(highOnly).toHaveLength(1);
        expect(highOnly[0].title).toBe("Work High");

        const workOnly = await service.list({ category: "work" });
        expect(workOnly).toHaveLength(1);
        expect(workOnly[0].title).toBe("Work High");
      });

      it("sorts by dueDate (earliest first with nulls last) and priority (high to low)", async () => {
        const service = await createService();
        await service.create({ title: "Medium Later", priority: "medium", dueDate: "2026-10-15" });
        await service.create({ title: "High Sooner", priority: "high", dueDate: "2026-10-01" });
        await service.create({ title: "Low No Date", priority: "low" });

        const byDue = await service.list({ sortBy: "dueDate" });
        expect(byDue[0].title).toBe("High Sooner");
        expect(byDue[1].title).toBe("Medium Later");
        expect(byDue[2].title).toBe("Low No Date");

        const byPriority = await service.list({ sortBy: "priority" });
        expect(byPriority[0].priority).toBe("high");
        expect(byPriority[1].priority).toBe("medium");
        expect(byPriority[2].priority).toBe("low");
      });
    });

    describe("create with V1.1 metadata", () => {
      it("creates a todo with description, priority, dueDate, and category", async () => {
        const service = await createService();
        const todo = await service.create({
          title: "Rich Todo",
          description: "Detailed notes about this task",
          priority: "high",
          dueDate: "2026-12-31",
          category: "Work",
        });

        expect(todo.description).toBe("Detailed notes about this task");
        expect(todo.priority).toBe("high");
        expect(todo.dueDate).toBe("2026-12-31");
        expect(todo.category).toBe("Work");
      });

      it("defaults priority to 'medium' and description to empty string if omitted", async () => {
        const service = await createService();
        const todo = await service.create({ title: "Default Meta" });
        expect(todo.priority).toBe("medium");
        expect(todo.description).toBe("");
      });

      it("rejects description longer than 1000 characters", async () => {
        const service = await createService();
        await expect(
          service.create({ title: "Too long note", description: "a".repeat(1001) })
        ).rejects.toThrow(ZodError);
      });

      it("rejects category longer than 50 characters", async () => {
        const service = await createService();
        await expect(
          service.create({ title: "Too long cat", category: "c".repeat(51) })
        ).rejects.toThrow(ZodError);
      });
    });

    describe("update with V1.1 metadata", () => {
      it("updates description, priority, dueDate, and category", async () => {
        const service = await createService();
        const todo = await service.create({ title: "Original" });
        const updated = await service.update(todo.id, {
          priority: "high",
          dueDate: "2026-11-20",
          category: "Urgent",
          description: "Updated description",
        });

        expect(updated.priority).toBe("high");
        expect(updated.dueDate).toBe("2026-11-20");
        expect(updated.category).toBe("Urgent");
        expect(updated.description).toBe("Updated description");
      });
    });

    describe("V1.3 time-blocking (startTime and endTime)", () => {
      it("defaults startTime and endTime to null when omitted", async () => {
        const service = await createService();
        const todo = await service.create({ title: "Unscheduled task" });
        expect(todo.startTime).toBeNull();
        expect(todo.endTime).toBeNull();
      });

      it("creates and updates a todo with valid startTime and endTime", async () => {
        const service = await createService();
        const todo = await service.create({
          title: "Morning deep work",
          dueDate: "2026-09-30",
          startTime: "09:00",
          endTime: "10:30",
        });

        expect(todo.startTime).toBe("09:00");
        expect(todo.endTime).toBe("10:30");

        const updated = await service.update(todo.id, {
          startTime: "11:00",
          endTime: "12:15",
        });
        expect(updated.startTime).toBe("11:00");
        expect(updated.endTime).toBe("12:15");
      });

      it("rejects create or update when endTime is not after startTime", async () => {
        const service = await createService();
        await expect(
          service.create({
            title: "Invalid block",
            startTime: "14:00",
            endTime: "13:00",
          })
        ).rejects.toThrow(/End time must be after start time/);

        await expect(
          service.create({
            title: "Zero duration block",
            startTime: "14:00",
            endTime: "14:00",
          })
        ).rejects.toThrow(/End time must be after start time/);

        const valid = await service.create({
          title: "Valid block",
          startTime: "10:00",
          endTime: "11:00",
        });

        await expect(
          service.update(valid.id, { endTime: "09:30" })
        ).rejects.toThrow(/End time must be after start time/);
      });

      it("sorts items sharing the same dueDate chronologically by startTime (unscheduled last)", async () => {
        const service = await createService();
        await service.create({
          title: "Afternoon sync",
          dueDate: "2026-09-30",
          startTime: "14:00",
          endTime: "15:00",
        });
        await service.create({
          title: "All-day task",
          dueDate: "2026-09-30",
        });
        await service.create({
          title: "Morning standup",
          dueDate: "2026-09-30",
          startTime: "09:00",
          endTime: "09:30",
        });

        const sorted = await service.list({ sortBy: "dueDate" });
        expect(sorted.map((t) => t.title)).toEqual([
          "Morning standup",
          "Afternoon sync",
          "All-day task",
        ]);
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
