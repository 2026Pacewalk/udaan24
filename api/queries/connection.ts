import { drizzle } from "drizzle-orm/mysql2";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    instance = drizzle(env.databaseUrl, {
      // "default" works with a standard local MySQL 8.x server. (The original
      // cloud DB was TiDB serverless, which used "planetscale" mode.)
      mode: "default",
      schema: fullSchema,
    });
  }
  return instance;
}
