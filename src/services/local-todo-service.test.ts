import { describe, it, expect, beforeEach, vi } from "vitest";
import { runContractTests } from "./todo-service.contract";
import { LocalTodoService } from "./local-todo-service";

describe("LocalTodoService", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // Run the full shared contract suite
  runContractTests(() => new LocalTodoService());

  describe("localStorage resilience and persistence", () => {
    it("persists data across multiple instances via todos:v1", async () => {
      const service1 = new LocalTodoService();
      const created = await service1.create({ title: "Persistent Todo" });

      const raw = localStorage.getItem("todos:v1");
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!)[0].id).toBe(created.id);

      const service2 = new LocalTodoService();
      const list = await service2.list();
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe(created.id);
      expect(list[0].title).toBe("Persistent Todo");
    });

    it("yields empty list without throwing when localStorage has corrupt JSON", async () => {
      localStorage.setItem("todos:v1", "INVALID_JSON{{{");
      const service = new LocalTodoService();
      const list = await service.list();
      expect(list).toEqual([]);
    });

    it("yields empty list without throwing when stored data has invalid schema shape", async () => {
      localStorage.setItem(
        "todos:v1",
        JSON.stringify([{ invalid: "data", notATodo: true }])
      );
      const service = new LocalTodoService();
      const list = await service.list();
      expect(list).toEqual([]);
    });

    it("handles localStorage.getItem throwing without crashing", async () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("QuotaExceeded or AccessDenied");
      });
      const service = new LocalTodoService();
      const list = await service.list();
      expect(list).toEqual([]);
    });

    it("handles localStorage.setItem throwing without crashing", async () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceeded or AccessDenied");
      });
      const service = new LocalTodoService();
      // Should create in memory / return created item even if disk save throws
      const todo = await service.create({ title: "Memory fallback" });
      expect(todo.title).toBe("Memory fallback");
    });

    it("parses legacy V1 items without loss, assigning default priority 'medium'", async () => {
      // Stored data without description, priority, dueDate, or category (pure V1 shape)
      const legacyV1Todos = [
        {
          id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          title: "Legacy Todo Item",
          completed: false,
          createdAt: "2026-09-29T10:00:00.000Z",
          updatedAt: "2026-09-29T10:00:00.000Z",
        },
      ];
      localStorage.setItem("todos:v1", JSON.stringify(legacyV1Todos));

      const service = new LocalTodoService();
      const list = await service.list();
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe("3fa85f64-5717-4562-b3fc-2c963f66afa6");
      expect(list[0].title).toBe("Legacy Todo Item");
      expect(list[0].priority).toBe("medium");
      expect(list[0].completed).toBe(false);
      expect(list[0].description).toBe("");
    });
  });
});
