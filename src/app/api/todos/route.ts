import { todoRepository } from "@/server/todo-repository";
import { CreateTodoSchema, type Priority } from "@/lib/schemas";
import type { TodoFilter, SortOption } from "@/services/todo-service";
import { ZodError } from "zod";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = (searchParams.get("filter") as TodoFilter) || undefined;
    const priority = (searchParams.get("priority") as Priority | "all") || undefined;
    const category = searchParams.get("category") || undefined;
    const sortBy = (searchParams.get("sortBy") as SortOption) || undefined;

    const todos = await todoRepository.list({
      filter,
      priority,
      category,
      sortBy,
    });

    return Response.json(todos, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch todos";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    const parseResult = CreateTodoSchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json(
        {
          error: parseResult.error.errors[0]?.message || "Validation failed",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const created = await todoRepository.create(parseResult.data);
    return Response.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: error.errors[0]?.message || "Validation failed",
          details: error.flatten(),
        },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message.includes("End time must be after start time")) {
      return Response.json({ error: message }, { status: 400 });
    }
    return Response.json({ error: message }, { status: 500 });
  }
}
