import { Pool } from "pg";

/**
 * Optional Postgres (docker compose up -d).
 * When DATABASE_URL is missing every helper returns empty results, and the
 * apps keep working from data/sakhi-store.json - no keys, no Docker required.
 */
const connectionString = (process.env.DATABASE_URL ?? "").trim();

let pool: Pool | null = null;

export function isDatabaseConfigured(): boolean {
  return connectionString.length > 0;
}

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString, max: 5, idleTimeoutMillis: 30_000 });
    pool.on("error", (error) => {
      console.error("[sakhi] postgres pool error:", error.message);
    });
  }
  return pool;
}

export async function queryRows<T extends object>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    const result = await getPool().query(sql, params);
    return result.rows as T[];
  } catch (error) {
    console.error("[sakhi] postgres query failed:", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function queryOne<T extends object>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await queryRows<T>(sql, params);
  return rows[0] ?? null;
}
