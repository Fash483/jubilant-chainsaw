import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import ConnectionSetup from '@/components/magnet/ConnectionSetup';
import MagnetHeader from '@/components/magnet/MagnetHeader';
import AddPanel from '@/components/magnet/AddPanel';
import FilterSection from '@/components/magnet/FilterSection';
import ActionBar from '@/components/magnet/ActionBar';
import LinkList from '@/components/magnet/LinkList';
import GroupView from '@/components/magnet/GroupView';
import PriorityPanel from '@/components/magnet/PriorityPanel';
import BookmarkletPanel from '@/components/magnet/BookmarkletPanel';
import MobileBottomBar from '@/components/magnet/MobileBottomBar';
import StatusBar from '@/components/magnet/StatusBar';
import GlitterDots from '@/components/magnet/GlitterDots';
import FloatingButterflies from '@/components/magnet/FloatingButterflies';
import { fetchLinks, insertLink, insertManyLinks, deleteLinks, deleteAllLinks } from '@/lib/magnetApi';
import { getConnectionString } from '@/lib/neon';
import {
  applyFilters, sortByEpisode, dedupeByEpisode, exactDedupe,
  splitIntoGroups, applyHide, parseMagnetTitle, isValidMagnet,
} from '@/lib/magnetUtils';
import type { MagnetLink, Filters, DedupeSettings } from '@/types/magnet';
import { DEFAULT_FILTERS, DEFAULT_DEDUPE, DEFAULT_PRIORITY_WORDS } from '@/types/magnet';

// ---------- confirm helper ----------
function useConfirm() {
  return (msg: string) => window.confirm(msg);
}

export default function Home() {
  const [connectionString, setConnectionString] = useState<string | null>(getConnectionString);
  const [showSettings, setShowSettings] = useState(false);

  const [links, setLinks] = useState<MagnetLink[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [priorityWords, setPriorityWords] = useState<string[]>(DEFAULT_PRIORITY_WORDS);
  const [dedupeSettings, setDedupeSettings] = useState<DedupeSettings>(DEFAULT_DEDUPE);

  const confirm = useConfirm();

  // ---------- load from URL import params ----------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const imports = params.getAll('import');
    if (imports.length && connectionString) {
      const magnets = imports.filter(isValidMagnet);
      if (magnets.length) {
        const items = magnets.map((m) => ({ title: parseMagnetTitle(m) || '(imported)', magnet: m }));
        insertManyLinks(connectionString, items)
          .then((added) => {
            setLinks((prev) => [...added, ...prev]);
            toast.success(`Imported ${added.length} magnet link${added.length !== 1 ? 's' : ''}`);
          })
          .catch(() => toast.error('Failed to import magnet links'));
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [connectionString]);

  // ---------- fetch ----------
  const sync = useCallback(async () => {
    if (!connectionString) return;
    setSyncing(true);
    setError('');
    try {
      const data = await fetchLinks(connectionString);
      setLinks(data);
      setConnected(true);
    } catch (e) {
      setConnected(false);
      setError(e instanceof Error ? e.message : 'Sync failed');
      toast.error('Failed to sync from database');
    } finally {
      setSyncing(false);
    }
  }, [connectionString]);

  useEffect(() => {
    if (connectionString) sync();
  }, [connectionString, sync]);

  // ---------- filtered + derived ----------
  const filtered = useMemo(() => applyFilters(links, filters), [links, filters]);

  const isFilterActive = useMemo(() =>
    Object.values({ ...filters, hideCount: '', hidePosition: 'top', splitCount: '', perGroup: '' })
      .some((v) => String(v).trim()),
    [filters]);

  const hiddenIds = useMemo(() => {
    const hc = parseInt(filters.hideCount, 10);
    return applyHide(filtered, isNaN(hc) ? 0 : hc, filters.hidePosition);
  }, [filtered, filters.hideCount, filters.hidePosition]);

  const splitN = parseInt(filters.splitCount, 10);
  const perGroup = parseInt(filters.perGroup, 10);
  const groups = useMemo(() =>
    splitN >= 2 ? splitIntoGroups(filtered, splitN, perGroup >= 1 ? perGroup : undefined) : null,
    [filtered, splitN, perGroup]);

  // ---------- actions ----------
  async function handleAdd(title: string, magnet: string) {
    if (!connectionString) return;
    setSyncing(true);
    try {
      const link = await insertLink(connectionString, title, magnet);
      setLinks((prev) => [link, ...prev]);
      toast.success('Magnet link added!');
    } catch {
      toast.error('Failed to add link');
    } finally {
      setSyncing(false);
    }
  }

  async function handlePasteAdd(raw: string) {
    if (!connectionString) return;
    const magnets = (raw.match(/magnet:\?[^\s"'<>]*/gi) ?? [])
      .filter(isValidMagnet)
      .filter((m, i, arr) => arr.indexOf(m) === i);
    if (!magnets.length) { toast.error('No valid magnet links found in pasted text'); return; }
    setSyncing(true);
    try {
      const items = magnets.map((m) => ({ title: parseMagnetTitle(m) || '(untitled)', magnet: m }));
      const added = await insertManyLinks(connectionString, items);
      setLinks((prev) => [...added, ...prev]);
      toast.success(`Added ${added.length} magnet link${added.length !== 1 ? 's' : ''}`);
    } catch {
      toast.error('Failed to add links');
    } finally {
      setSyncing(false);
    }
  }

  async function handleDelete(id: string) {
    if (!connectionString) return;
    try {
      await deleteLinks(connectionString, [id]);
      setLinks((prev) => prev.filter((l) => l.id !== id));
      setSelectedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete link');
    }
  }

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  }

  function handleCopyAll() {
    const copyable = filtered.filter((l) => !hiddenIds.has(l.id));
    const target = selectedIds.size > 0
      ? copyable.filter((l) => selectedIds.has(l.id))
      : copyable;
    if (!target.length) { toast.error('No links to copy'); return; }
    navigator.clipboard.writeText(target.map((l) => l.magnet).join('\n'));
    toast.success(`Copied ${target.length} magnet link${target.length !== 1 ? 's' : ''}`);
  }

  function handleCopyGroup(group: MagnetLink[], idx: number) {
    const copyable = group.filter((l) => !hiddenIds.has(l.id));
    if (!copyable.length) { toast.error('No copyable links in this group'); return; }
    navigator.clipboard.writeText(copyable.map((l) => l.magnet).join('\n'));
    toast.success(`Copied Group ${idx} (${copyable.length} links)`);
  }

  function handleCopyLink(magnet: string) {
    navigator.clipboard.writeText(magnet);
    toast.success('Copied!');
  }

  function handleSort() {
    setLinks((prev) => sortByEpisode(prev));
    toast.success('Sorted by episode');
  }

  function handleDedupe() {
    const source = isFilterActive ? filtered : links;
    const deduped = dedupeByEpisode(source, priorityWords, dedupeSettings);
    const removed = source.filter((l) => !deduped.find((d) => d.id === l.id));
    if (!removed.length) { toast.info('No duplicates found'); return; }
    if (!confirm(`Remove ${removed.length} duplicate${removed.length !== 1 ? 's' : ''}?`)) return;
    if (connectionString) {
      deleteLinks(connectionString, removed.map((l) => l.id)).catch(() => toast.error('DB delete failed'));
    }
    const removedIds = new Set(removed.map((l) => l.id));
    setLinks((prev) => prev.filter((l) => !removedIds.has(l.id)));
    toast.success(`Removed ${removed.length} duplicate${removed.length !== 1 ? 's' : ''}`);
  }

  function handleExactDedupe() {
    const source = isFilterActive ? filtered : links;
    const deduped = exactDedupe(source);
    const removed = source.filter((l) => !deduped.find((d) => d.id === l.id));
    if (!removed.length) { toast.info('No exact duplicates found'); return; }
    if (!confirm(`Remove ${removed.length} exact duplicate${removed.length !== 1 ? 's' : ''}?`)) return;
    if (connectionString) {
      deleteLinks(connectionString, removed.map((l) => l.id)).catch(() => toast.error('DB delete failed'));
    }
    const removedIds = new Set(removed.map((l) => l.id));
    setLinks((prev) => prev.filter((l) => !removedIds.has(l.id)));
    toast.success(`Removed ${removed.length} exact duplicate${removed.length !== 1 ? 's' : ''}`);
  }

  async function handlePurgeFiltered() {
    if (!connectionString || !filtered.length) { toast.error('No filtered links to purge'); return; }
    if (!confirm(`Permanently delete ${filtered.length} filtered link${filtered.length !== 1 ? 's' : ''} from database?`)) return;
    setSyncing(true);
    try {
      await deleteLinks(connectionString, filtered.map((l) => l.id));
      const filteredIds = new Set(filtered.map((l) => l.id));
      setLinks((prev) => prev.filter((l) => !filteredIds.has(l.id)));
      setSelectedIds(new Set());
      toast.success(`Purged ${filtered.length} links`);
    } catch {
      toast.error('Failed to purge links');
    } finally {
      setSyncing(false);
    }
  }

  async function handlePurge() {
    if (!connectionString) return;
    if (!confirm(`Permanently delete ALL ${links.length} links from the vault? This cannot be undone.`)) return;
    setSyncing(true);
    try {
      await deleteAllLinks(connectionString);
      setLinks([]);
      setSelectedIds(new Set());
      toast.success('Vault purged!');
    } catch {
      toast.error('Failed to purge vault');
    } finally {
      setSyncing(false);
    }
  }

  // ---------- priority words ----------
  function moveWord(idx: number, dir: -1 | 1) {
    const arr = [...priorityWords];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setPriorityWords(arr);
  }
  function removeWord(idx: number) { setPriorityWords((p) => p.filter((_, i) => i !== idx)); }
  function addWord(word: string) { setPriorityWords((p) => [...p, word]); }

  // ---------- render ----------
  if (!connectionString || showSettings) {
    return (
      <ConnectionSetup
        onConnected={(cs) => { setConnectionString(cs); setShowSettings(false); }}
        isSettings={showSettings}
        onCancel={showSettings ? () => setShowSettings(false) : undefined}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <GlitterDots />
      <FloatingButterflies />

      <MagnetHeader syncing={syncing} onSync={sync} onSettings={() => setShowSettings(true)} />

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-border overflow-y-auto bg-sidebar">
          <div className="p-3 space-y-1">
            <AddPanel syncing={syncing} onAdd={handleAdd} onPasteAdd={handlePasteAdd} />
            <div className="my-2 h-px bg-border" />
            <FilterSection filters={filters} onFilterChange={setFilters} />
            <div className="my-2 h-px bg-border" />
            <PriorityPanel
              words={priorityWords}
              settings={dedupeSettings}
              onMove={moveWord}
              onRemove={removeWord}
              onAdd={addWord}
              onSettingsChange={(p) => setDedupeSettings((s) => ({ ...s, ...p }))}
            />
            <div className="my-2 h-px bg-border" />
            <BookmarkletPanel connectionString={connectionString} />
          </div>
        </aside>

        {/* Mobile panels — replaced by MobileBottomBar sheet */}

        {/* Main content */}
        <div className="flex flex-1 flex-col min-w-0">
          <ActionBar
            selectedCount={selectedIds.size}
            syncing={syncing}
            isFilterActive={isFilterActive}
            onCopyAll={handleCopyAll}
            onSort={handleSort}
            onDedupe={handleDedupe}
            onExactDedupe={handleExactDedupe}
            onSync={sync}
            onPurgeFiltered={handlePurgeFiltered}
            onPurge={handlePurge}
          />

          {error && (
            <div className="px-4 py-2 text-xs text-destructive border-b"
              style={{ background: 'hsl(0 70% 10%)', borderColor: 'hsl(0 70% 25%)' }}>
              {error}
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto pb-16 md:pb-0">
            {groups ? (
              <GroupView
                groups={groups}
                selectedIds={selectedIds}
                hiddenIds={hiddenIds}
                onCopy={handleCopyLink}
                onDelete={handleDelete}
                onToggleSelect={handleToggleSelect}
                onCopyGroup={handleCopyGroup}
              />
            ) : (
              <LinkList
                links={filtered}
                selectedIds={selectedIds}
                hiddenIds={hiddenIds}
                onCopy={handleCopyLink}
                onDelete={handleDelete}
                onToggleSelect={handleToggleSelect}
              />
            )}
          </div>

          <StatusBar
            connected={connected}
            syncing={syncing}
            filteredCount={filtered.length}
            totalCount={links.length}
          />
        </div>
      </div>

      {/* Mobile bottom navigation + sheet panels */}
      <MobileBottomBar
        syncing={syncing}
        filters={filters}
        priorityWords={priorityWords}
        dedupeSettings={dedupeSettings}
        connectionString={connectionString}
        onAdd={handleAdd}
        onPasteAdd={handlePasteAdd}
        onFilterChange={setFilters}
        onMoveWord={moveWord}
        onRemoveWord={removeWord}
        onAddWord={addWord}
        onSettingsChange={(p) => setDedupeSettings((s) => ({ ...s, ...p }))}
      />
    </div>
  );
}
