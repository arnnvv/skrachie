import { Pool } from "pg";
import { dbConfig } from "../config";

export const db = new Pool({
  connectionString: dbConfig.connectionString,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: true }
      : false,
  ...dbConfig.pool,
});
