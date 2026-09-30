import { todoRepository } from "@/server/todo-repository";
import { TodoPatchSchema } from "@/lib/schemas";
import { NotFoundError } from "@/lib/errors";
import { ZodError } from "zod";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

async function getId(context: RouteContext): Promise<string> {
  const resolved = await context.params;
  return resolved.id;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const id = await getId(context);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    const parseResult = TodoPatchSchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json(
        {
          error: parseResult.error.errors[0]?.message || "Validation failed",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const updated = await todoRepository.update(id, parseResult.data);
    return Response.json(updated, { status: 200 });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
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

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const id = await getId(context);
    await todoRepository.remove(id);
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
