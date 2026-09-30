import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/todos/route";
import { PATCH, DELETE } from "@/app/api/todos/[id]/route";
import { todoRepository } from "@/server/todo-repository";
import { NotFoundError } from "@/lib/errors";

describe("API Route Handlers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/todos", () => {
    it("returns todos list with 200 OK", async () => {
      const mockTodos = [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          title: "Test Todo",
          completed: false,
          description: "",
          priority: "medium" as const,
          dueDate: null,
          startTime: null,
          endTime: null,
          category: null,
          createdAt: "2026-09-30T10:00:00Z",
          updatedAt: "2026-09-30T10:00:00Z",
        },
      ];
      vi.spyOn(todoRepository, "list").mockResolvedValue(mockTodos);

      const req = new Request("http://localhost/api/todos?filter=active&priority=medium&category=work&sortBy=dueDate");
      const res = await GET(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockTodos);
      expect(todoRepository.list).toHaveBeenCalledWith({
        filter: "active",
        priority: "medium",
        category: "work",
        sortBy: "dueDate",
      });
    });

    it("returns 500 when repository throws unexpected error", async () => {
      vi.spyOn(todoRepository, "list").mockRejectedValue(new Error("Database disconnected"));

      const req = new Request("http://localhost/api/todos");
      const res = await GET(req);

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toHaveProperty("error");
    });
  });

  describe("POST /api/todos", () => {
    it("creates a todo and returns 201 Created", async () => {
      const created = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        title: "New Todo",
        completed: false,
        description: "Notes",
        priority: "high" as const,
        dueDate: "2026-10-01",
        startTime: "09:00",
        endTime: "10:00",
        category: "Work",
        createdAt: "2026-09-30T10:00:00Z",
        updatedAt: "2026-09-30T10:00:00Z",
      };
      vi.spyOn(todoRepository, "create").mockResolvedValue(created);

      const req = new Request("http://localhost/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Todo",
          description: "Notes",
          priority: "high",
          dueDate: "2026-10-01",
          startTime: "09:00",
          endTime: "10:00",
          category: "Work",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toEqual(created);
    });

    it("returns 400 when body fails Zod validation", async () => {
      const req = new Request("http://localhost/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "   ",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty("error");
      expect(data).toHaveProperty("details");
    });

    it("returns 400 when endTime <= startTime", async () => {
      const req = new Request("http://localhost/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Invalid schedule",
          startTime: "12:00",
          endTime: "11:00",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty("error");
    });

    it("returns 400 when request body is malformed JSON", async () => {
      const req = new Request("http://localhost/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid-json",
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/Invalid JSON/i);
    });
  });

  describe("PATCH /api/todos/[id]", () => {
    it("updates a todo and returns 200 OK", async () => {
      const updated = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        title: "Updated Title",
        completed: true,
        description: "",
        priority: "medium" as const,
        dueDate: null,
        startTime: null,
        endTime: null,
        category: null,
        createdAt: "2026-09-30T10:00:00Z",
        updatedAt: "2026-09-30T10:05:00Z",
      };
      vi.spyOn(todoRepository, "update").mockResolvedValue(updated);

      const req = new Request("http://localhost/api/todos/123e4567-e89b-12d3-a456-426614174000", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true, title: "Updated Title" }),
      });

      const res = await PATCH(req, {
        params: Promise.resolve({ id: "123e4567-e89b-12d3-a456-426614174000" }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(updated);
    });

    it("returns 404 when updating non-existent id", async () => {
      vi.spyOn(todoRepository, "update").mockRejectedValue(new NotFoundError("Todo not found"));

      const req = new Request("http://localhost/api/todos/non-existent", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });

      const res = await PATCH(req, {
        params: Promise.resolve({ id: "non-existent" }),
      });

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toMatch(/not found/i);
    });

    it("returns 400 on empty patch body", async () => {
      const req = new Request("http://localhost/api/todos/123", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const res = await PATCH(req, {
        params: Promise.resolve({ id: "123" }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/todos/[id]", () => {
    it("deletes a todo and returns 200 OK with success indicator", async () => {
      vi.spyOn(todoRepository, "remove").mockResolvedValue(undefined);

      const req = new Request("http://localhost/api/todos/123e4567-e89b-12d3-a456-426614174000", {
        method: "DELETE",
      });

      const res = await DELETE(req, {
        params: Promise.resolve({ id: "123e4567-e89b-12d3-a456-426614174000" }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ success: true });
    });

    it("returns 404 when deleting non-existent id", async () => {
      vi.spyOn(todoRepository, "remove").mockRejectedValue(new NotFoundError("Todo not found"));

      const req = new Request("http://localhost/api/todos/non-existent", {
        method: "DELETE",
      });

      const res = await DELETE(req, {
        params: Promise.resolve({ id: "non-existent" }),
      });

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toMatch(/not found/i);
    });
  });
});
