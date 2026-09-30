import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpTodoService } from "@/services/http-todo-service";
import { NotFoundError } from "@/lib/errors";
import { ZodError } from "zod";

describe("HttpTodoService", () => {
  let service: HttpTodoService;

  beforeEach(() => {
    vi.restoreAllMocks();
    service = new HttpTodoService("/api/todos");
  });

  describe("list", () => {
    it("fetches /api/todos and returns parsed todos", async () => {
      const mockTodos = [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          title: "Test",
          completed: false,
          description: "",
          priority: "medium",
          dueDate: null,
          startTime: null,
          endTime: null,
          category: null,
          createdAt: "2026-09-30T10:00:00Z",
          updatedAt: "2026-09-30T10:00:00Z",
        },
      ];

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockTodos,
      });
      global.fetch = fetchMock;

      const result = await service.list({
        filter: "active",
        priority: "high",
        category: "Work",
        sortBy: "dueDate",
      });

      expect(result).toEqual(mockTodos);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/todos?filter=active&priority=high&category=Work&sortBy=dueDate"),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("handles string filter parameter", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [],
      });
      global.fetch = fetchMock;

      await service.list("completed");
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/todos?filter=completed"),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("throws error when server responds with 500", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: "Internal server error" }),
      });

      await expect(service.list()).rejects.toThrow("Internal server error");
    });
  });

  describe("create", () => {
    it("validates data client-side and posts to /api/todos", async () => {
      const created = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        title: "New Todo",
        completed: false,
        description: "Notes",
        priority: "high",
        dueDate: "2026-10-01",
        startTime: "09:00",
        endTime: "10:00",
        category: "Work",
        createdAt: "2026-09-30T10:00:00Z",
        updatedAt: "2026-09-30T10:00:00Z",
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => created,
      });
      global.fetch = fetchMock;

      const result = await service.create({
        title: "New Todo",
        description: "Notes",
        priority: "high",
        dueDate: "2026-10-01",
        startTime: "09:00",
        endTime: "10:00",
        category: "Work",
      });

      expect(result).toEqual(created);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/todos"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            title: "New Todo",
            description: "Notes",
            priority: "high",
            dueDate: "2026-10-01",
            startTime: "09:00",
            endTime: "10:00",
            category: "Work",
          }),
        })
      );
    });

    it("rejects empty title with ZodError before sending request", async () => {
      const fetchMock = vi.fn();
      global.fetch = fetchMock;

      await expect(service.create({ title: "   " })).rejects.toThrow(ZodError);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("rejects invalid time range before sending request", async () => {
      const fetchMock = vi.fn();
      global.fetch = fetchMock;

      await expect(
        service.create({ title: "Bad block", startTime: "12:00", endTime: "11:00" })
      ).rejects.toThrow(/End time must be after start time/);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("patches /api/todos/[id] and returns updated todo", async () => {
      const updated = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        title: "Updated",
        completed: true,
        description: "",
        priority: "medium",
        dueDate: null,
        startTime: null,
        endTime: null,
        category: null,
        createdAt: "2026-09-30T10:00:00Z",
        updatedAt: "2026-09-30T10:05:00Z",
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => updated,
      });
      global.fetch = fetchMock;

      const result = await service.update(updated.id, { completed: true });
      expect(result).toEqual(updated);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining(`/api/todos/${updated.id}`),
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
          body: JSON.stringify({ completed: true }),
        })
      );
    });

    it("throws NotFoundError when server responds with 404", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: "Todo not found" }),
      });

      await expect(service.update("missing-id", { completed: true })).rejects.toThrow(NotFoundError);
    });
  });

  describe("remove", () => {
    it("deletes /api/todos/[id]", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });
      global.fetch = fetchMock;

      await service.remove("123e4567-e89b-12d3-a456-426614174000");
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/todos/123e4567-e89b-12d3-a456-426614174000"),
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("throws NotFoundError when server responds with 404", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: "Todo not found" }),
      });

      await expect(service.remove("missing-id")).rejects.toThrow(NotFoundError);
    });
  });
});
