import "@testing-library/jest-dom";
import { GET, POST } from "@/app/api/todos/route";
import { PATCH, DELETE } from "@/app/api/todos/[id]/route";
import { clearMemoryDatabase } from "@/server/db";
import { beforeEach } from "vitest";

const originalFetch = global.fetch;

beforeEach(() => {
  clearMemoryDatabase();
});

global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const urlStr =
    typeof input === "string"
      ? input
      : input instanceof URL
      ? input.toString()
      : input.url;

  if (urlStr.includes("/api/todos")) {
    const method =
      init?.method?.toUpperCase() ||
      (typeof input === "object" && "method" in input && input.method
        ? input.method.toUpperCase()
        : "GET");
    const request = input instanceof Request ? input : new Request(urlStr, init);
    const parsedUrl = new URL(urlStr, "http://localhost:3000");

    const pathMatch = parsedUrl.pathname.match(/^\/api\/todos\/(.+)$/);
    if (pathMatch) {
      const id = decodeURIComponent(pathMatch[1]);
      if (method === "PATCH") {
        return PATCH(request, { params: Promise.resolve({ id }) });
      }
      if (method === "DELETE") {
        return DELETE(request, { params: Promise.resolve({ id }) });
      }
    }

    if (parsedUrl.pathname === "/api/todos") {
      if (method === "GET") {
        return GET(request);
      }
      if (method === "POST") {
        return POST(request);
      }
    }
  }

  if (originalFetch) {
    return originalFetch(input, init);
  }

  throw new Error(`Unhandled fetch: ${urlStr}`);
};
