import { drizzle } from "drizzle-orm/netlify-db";
import * as schema from "./schema";

const create = () => drizzle({ schema });
type DB = ReturnType<typeof create>;
let instance: DB | undefined;

/** Lazily create the client so builds don't need a database connection. */
export function getDb(): DB {
  if (!instance) instance = create();
  return instance;
}
