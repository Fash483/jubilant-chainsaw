import type { MagnetLink, Filters, DedupeSettings } from '@/types/magnet';

/** Extract display name from magnet URI dn= param */
export function parseMagnetTitle(magnet: string): string {
  if (!magnet) return '';
  const m = magnet.match(/[?&]dn=([^&]+)/i);
  if (m) {
    let raw = m[1].replace(/\+/g, ' ');
    try { raw = decodeURIComponent(raw); } catch { /* ignore */ }
    return raw.replace(/[._]+/g, ' ').trim();
  }
  return '';
}

export function isValidMagnet(v: string): boolean {
  const s = (v || '').trim();
  return /^magnet:\?/i.test(s) && /xt=urn:btih:[a-z0-9]+/i.test(s);
}

export interface SeasonEpisode { season: number; episode: number }

export function parseSeasonEpisode(title: string): SeasonEpisode | null {
  if (!title) return null;
  let m = title.match(/s(\d{1,2})[\s._-]*e(\d{1,3})/i);
  if (m) return { season: parseInt(m[1], 10), episode: parseInt(m[2], 10) };
  m = title.match(/\b(\d{1,2})x(\d{1,3})\b/i);
  if (m) return { season: parseInt(m[1], 10), episode: parseInt(m[2], 10) };
  return null;
}

export function sortByEpisode(links: MagnetLink[]): MagnetLink[] {
  return [...links].sort((a, b) => {
    const seA = parseSeasonEpisode(a.title);
    const seB = parseSeasonEpisode(b.title);
    if (!seA && !seB) return 0;
    if (!seA) return 1;
    if (!seB) return -1;
    if (seA.season !== seB.season) return seA.season - seB.season;
    return seA.episode - seB.episode;
  });
}

export function applyFilters(links: MagnetLink[], filters: Filters): MagnetLink[] {
  let result = [...links];

  if (filters.show.trim()) {
    const show = filters.show.trim().toLowerCase();
    result = result.filter((l) =>
      l.title.toLowerCase().includes(show) ||
      parseMagnetTitle(l.magnet).toLowerCase().includes(show),
    );
  }

  if (filters.term.trim()) {
    const terms = filters.term.trim().toLowerCase().split(/\s+/).filter(Boolean);
    result = result.filter((l) => {
      const hay = `${l.title} ${parseMagnetTitle(l.magnet)}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }

  if (filters.or.trim()) {
    const orTerms = filters.or.trim().toLowerCase().split(/\s+/).filter(Boolean);
    result = result.filter((l) => {
      const hay = `${l.title} ${parseMagnetTitle(l.magnet)}`.toLowerCase();
      return orTerms.some((t) => hay.includes(t));
    });
  }

  if (filters.only.trim()) {
    const only = filters.only.trim().toLowerCase();
    result = result.filter((l) =>
      `${l.title} ${parseMagnetTitle(l.magnet)}`.toLowerCase().includes(only),
    );
  }

  if (filters.except.trim()) {
    const except = filters.except.trim().toLowerCase();
    result = result.filter((l) =>
      !`${l.title} ${parseMagnetTitle(l.magnet)}`.toLowerCase().includes(except),
    );
  }

  return result;
}

export function dedupeByEpisode(
  links: MagnetLink[],
  priorityWords: string[],
  settings: DedupeSettings,
): MagnetLink[] {
  const groups = new Map<string, MagnetLink[]>();
  const noEpisode: MagnetLink[] = [];

  for (const link of links) {
    const se = parseSeasonEpisode(link.title);
    if (!se) { noEpisode.push(link); continue; }
    const key = `s${se.season}e${se.episode}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(link);
  }

  const kept: MagnetLink[] = [];
  for (const group of groups.values()) {
    if (group.length === 1) { kept.push(group[0]); continue; }
    let winner: MagnetLink;
    if (settings.mode === 'keep-first') {
      winner = group[0];
    } else if (settings.mode === 'keep-second') {
      winner = group[1] ?? group[0];
    } else {
      // priority word scoring — lower index = higher priority; -1 means not found → 9999
      const rp = settings.removePhrase ? settings.removePhrase.toLowerCase() : '';
      winner = group.reduce((best, link) => {
        let hay = `${link.title} ${link.magnet}`.toLowerCase();
        let bestHay = `${best.title} ${best.magnet}`.toLowerCase();
        if (rp) {
          hay = hay.split(rp).join('');
          bestHay = bestHay.split(rp).join('');
        }
        const score = priorityWords.findIndex((w) => hay.includes(w.toLowerCase()));
        const bestScore = priorityWords.findIndex((w) => bestHay.includes(w.toLowerCase()));
        const s = score === -1 ? 9999 : score;
        const bs = bestScore === -1 ? 9999 : bestScore;
        return s < bs ? link : best;
      });
    }
    kept.push(winner);
  }

  return [...kept, ...noEpisode];
}

export function exactDedupe(links: MagnetLink[]): MagnetLink[] {
  const seen = new Set<string>();
  return links.filter((l) => {
    if (seen.has(l.magnet)) return false;
    seen.add(l.magnet);
    return true;
  });
}

export function splitIntoGroups(links: MagnetLink[], n: number, perGroup?: number): MagnetLink[][] {
  if (n < 2) return [links];
  if (perGroup && perGroup > 0) {
    const groups: MagnetLink[][] = [];
    for (let i = 0; i < n; i++) {
      groups.push(links.slice(i * perGroup, (i + 1) * perGroup));
    }
    return groups;
  }
  const size = Math.ceil(links.length / n);
  const groups: MagnetLink[][] = [];
  for (let i = 0; i < n; i++) {
    groups.push(links.slice(i * size, (i + 1) * size));
  }
  return groups;
}

export function applyHide(links: MagnetLink[], hideCount: number, hidePosition: 'top' | 'bottom'): Set<string> {
  const hidden = new Set<string>();
  if (!hideCount || hideCount <= 0) return hidden;
  const count = Math.min(hideCount, links.length);
  const slice = hidePosition === 'top' ? links.slice(0, count) : links.slice(-count);
  for (const l of slice) hidden.add(l.id);
  return hidden;
}
