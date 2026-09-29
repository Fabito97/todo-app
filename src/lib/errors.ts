export class NotFoundError extends Error {
  constructor(id: string) {
    super(`Todo "${id}" not found`);
    this.name = "NotFoundError";
  }
}
