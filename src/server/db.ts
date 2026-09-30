import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type AppDatabase = NeonHttpDatabase<typeof schema>;

function createDatabase(): AppDatabase {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://placeholder:placeholder@ep-placeholder.us-east-2.aws.neon.tech/neondb?sslmode=require";
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

export const db: AppDatabase = createDatabase();
