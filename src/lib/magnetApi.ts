import type { MagnetLink } from '@/types/magnet';
import { createSql } from '@/lib/neon';

export async function fetchLinks(connectionString: string): Promise<MagnetLink[]> {
  const sql = createSql(connectionString);
  const rows = await sql`
    SELECT id, title, magnet, created_date, updated_date
    FROM magnet_links
    ORDER BY created_date DESC
    LIMIT 10000
  `;
  return rows.map((r) => ({
    id: String(r.id),
    title: String(r.title),
    magnet: String(r.magnet),
    created_date: String(r.created_date),
    updated_date: String(r.updated_date),
  }));
}

export async function insertLink(
  connectionString: string,
  title: string,
  magnet: string,
): Promise<MagnetLink> {
  const sql = createSql(connectionString);
  const [r] = await sql`
    INSERT INTO magnet_links (title, magnet)
    VALUES (${title}, ${magnet})
    RETURNING id, title, magnet, created_date, updated_date
  `;
  return {
    id: String(r.id),
    title: String(r.title),
    magnet: String(r.magnet),
    created_date: String(r.created_date),
    updated_date: String(r.updated_date),
  };
}

export async function insertManyLinks(
  connectionString: string,
  items: Array<{ title: string; magnet: string }>,
): Promise<MagnetLink[]> {
  if (!items.length) return [];
  const sql = createSql(connectionString);
  const results: MagnetLink[] = [];
  for (const item of items) {
    const [r] = await sql`
      INSERT INTO magnet_links (title, magnet)
      VALUES (${item.title}, ${item.magnet})
      RETURNING id, title, magnet, created_date, updated_date
    `;
    results.push({
      id: String(r.id),
      title: String(r.title),
      magnet: String(r.magnet),
      created_date: String(r.created_date),
      updated_date: String(r.updated_date),
    });
  }
  return results;
}

export async function deleteLinks(
  connectionString: string,
  ids: string[],
): Promise<void> {
  if (!ids.length) return;
  const sql = createSql(connectionString);
  const numIds = ids.map(Number);
  await sql`DELETE FROM magnet_links WHERE id = ANY(${numIds})`;
}

export async function deleteAllLinks(connectionString: string): Promise<void> {
  const sql = createSql(connectionString);
  await sql`DELETE FROM magnet_links`;
}
