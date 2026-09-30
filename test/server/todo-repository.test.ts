import { describe, beforeEach } from "vitest";
import { runContractTests } from "../services/todo-service.contract";
import { TodoRepository } from "@/server/todo-repository";
import { createMockDatabase } from "./mock-db";

describe("TodoRepository Server Contract", () => {
  let repository: TodoRepository;
  const mockDb = createMockDatabase();

  beforeEach(() => {
    mockDb.clear();
    repository = new TodoRepository(mockDb.db);
  });

  runContractTests(() => repository);
});
