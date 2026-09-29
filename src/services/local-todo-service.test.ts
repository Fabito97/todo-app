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
  });
});
