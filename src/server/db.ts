import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type AppDatabase = NeonHttpDatabase<typeof schema>;

interface MemoryItem {
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

const memoryStore = new Map<string, MemoryItem>();

function toRowArray(item: MemoryItem) {
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

const memoryQuery = async (sqlText: string, params: unknown[] = []) => {
  const sql = sqlText.trim();
  const lower = sql.toLowerCase();

  if (lower.startsWith("insert")) {
    const item: MemoryItem = {
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
    memoryStore.set(item.id, item);
    return { rows: [toRowArray(item)] };
  }

  if (lower.startsWith("update")) {
    const id = params[params.length - 1] as string;
    const existing = memoryStore.get(id);
    if (existing) {
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

  if (lower.startsWith("delete")) {
    const id = params[0] as string;
    memoryStore.delete(id);
    return { rows: [] };
  }

  if (lower.startsWith("select")) {
    let items = Array.from(memoryStore.values());

    if (lower.includes("where")) {
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

    if (lower.includes("order by")) {
      if (lower.includes("due_date") && lower.includes("is null")) {
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
        const weight: Record<string, number> = { high: 1, medium: 2, low: 3 };
        items.sort((a, b) => {
          const diff = (weight[a.priority] || 2) - (weight[b.priority] || 2);
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

export function clearMemoryDatabase() {
  memoryStore.clear();
}

function createDatabase(): AppDatabase {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("placeholder")) {
    const sql = neon(process.env.DATABASE_URL);
    return drizzle(sql, { schema });
  }
  return drizzle(memoryQuery as unknown as ReturnType<typeof neon>, { schema });
}

export const db: AppDatabase = createDatabase();
