import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/server/schema";
import type { AppDatabase } from "@/server/db";

export interface MockStoreItem {
  id: string;
  title: string;
  completed: boolean;
  description: string;
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  startTime: string | null;
  endTime: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

export function createMockDatabase(): { db: AppDatabase; clear: () => void } {
  const store = new Map<string, MockStoreItem>();

  function toRowArray(item: MockStoreItem) {
    return [
      item.id,
      item.title,
      item.completed,
      item.description,
      item.priority,
      item.dueDate,
      item.startTime,
      item.endTime,
      item.category,
      item.createdAt,
      item.updatedAt,
    ];
  }

  const mockQuery = async (sqlText: string, params: unknown[] = []) => {
    const sql = sqlText.trim();
    const lower = sql.toLowerCase();

    // INSERT
    if (lower.startsWith("insert")) {
      const item: MockStoreItem = {
        id: params[0] as string,
        title: params[1] as string,
        completed: (params[2] as boolean) ?? false,
        description: (params[3] as string) ?? "",
        priority: (params[4] as "low" | "medium" | "high") ?? "medium",
        dueDate: (params[5] as string) ?? null,
        startTime: (params[6] as string) ?? null,
        endTime: (params[7] as string) ?? null,
        category: (params[8] as string) ?? null,
        createdAt: params[9] as string,
        updatedAt: params[10] as string,
      };
      store.set(item.id, item);
      return { rows: [toRowArray(item)] };
    }

    // UPDATE
    if (lower.startsWith("update")) {
      // The WHERE clause in update is where "todos"."id" = $last_param
      const id = params[params.length - 1] as string;
      const existing = store.get(id);
      if (existing) {
        // Parse set clauses: e.g. "title" = $1, "completed" = $2
        const setMatch = sql.match(/set\s+(.*?)\s+where/i);
        if (setMatch) {
          const assignments = setMatch[1].split(",");
          assignments.forEach((assign, index) => {
            const fieldMatch = assign.match(/"([^"]+)"/);
            if (fieldMatch) {
              const fieldName = fieldMatch[1];
              const val = params[index];
              if (fieldName === "title") existing.title = val as string;
              if (fieldName === "completed") existing.completed = val as boolean;
              if (fieldName === "description") existing.description = val as string;
              if (fieldName === "priority") existing.priority = val as "low" | "medium" | "high";
              if (fieldName === "due_date") existing.dueDate = val as string | null;
              if (fieldName === "start_time") existing.startTime = val as string | null;
              if (fieldName === "end_time") existing.endTime = val as string | null;
              if (fieldName === "category") existing.category = val as string | null;
              if (fieldName === "updated_at") existing.updatedAt = val as string;
            }
          });
        }
      }
      return { rows: [] };
    }

    // DELETE
    if (lower.startsWith("delete")) {
      const id = params[0] as string;
      store.delete(id);
      return { rows: [] };
    }

    // SELECT
    if (lower.startsWith("select")) {
      let items = Array.from(store.values());

      // Check WHERE conditions
      if (lower.includes("where")) {
        // Check for "todos"."id" = $1
        if (sql.includes('"todos"."id" = $')) {
          const id = params[0] as string;
          items = items.filter((item) => item.id === id);
        } else {
          let paramIdx = 0;
          if (sql.includes('"todos"."completed" = $')) {
            const completedVal = params[paramIdx++] as boolean;
            items = items.filter((item) => item.completed === completedVal);
          }
          if (sql.includes('"todos"."priority" = $')) {
            const priorityVal = params[paramIdx++] as string;
            items = items.filter((item) => item.priority === priorityVal);
          }
          if (sql.includes('"todos"."category" = $')) {
            const categoryVal = params[paramIdx++] as string;
            items = items.filter((item) => item.category === categoryVal);
          }
        }
      }

      // Check ORDER BY
      if (lower.includes("order by")) {
        if (lower.includes("due_date") && lower.includes("is null")) {
          // Sort by dueDate (nulls last), then startTime (nulls last), then createdAt desc
          items.sort((a, b) => {
            if (!a.dueDate && b.dueDate) return 1;
            if (a.dueDate && !b.dueDate) return -1;
            if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) {
              return a.dueDate.localeCompare(b.dueDate);
            }
            if (!a.startTime && b.startTime) return 1;
            if (a.startTime && !b.startTime) return -1;
            if (a.startTime && b.startTime && a.startTime !== b.startTime) {
              return a.startTime.localeCompare(b.startTime);
            }
            return b.createdAt.localeCompare(a.createdAt);
          });
        } else if (lower.includes("priority") && lower.includes("case")) {
          const weight = { high: 1, medium: 2, low: 3 };
          items.sort((a, b) => {
            const diff = weight[a.priority] - weight[b.priority];
            if (diff !== 0) return diff;
            return b.createdAt.localeCompare(a.createdAt);
          });
        } else if (lower.includes("created_at") && lower.includes("desc")) {
          items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        }
      }

      return { rows: items.map(toRowArray) };
    }

    return { rows: [] };
  };

  const db = drizzle(mockQuery as any, { schema }) as AppDatabase;

  return {
    db,
    clear: () => store.clear(),
  };
}
