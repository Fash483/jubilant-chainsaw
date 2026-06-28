import { neon } from '@neondatabase/serverless';

const STORAGE_KEY = 'neon_connection_string';

export function getConnectionString(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function saveConnectionString(cs: string): void {
  localStorage.setItem(STORAGE_KEY, cs);
}

export function clearConnectionString(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function createSql(connectionString: string) {
  return neon(connectionString);
}

/** Auto-create the magnet_links table if it doesn't exist */
export async function ensureTable(connectionString: string): Promise<void> {
  const sql = createSql(connectionString);
  await sql`
    CREATE TABLE IF NOT EXISTS magnet_links (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      magnet TEXT NOT NULL,
      created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}
