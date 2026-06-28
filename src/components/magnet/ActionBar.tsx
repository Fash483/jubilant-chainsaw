import { Copy, ArrowUpDown, Layers, ClipboardList, Trash2, Flame, RefreshCw, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ActionBarProps {
  selectedCount: number;
  syncing: boolean;
  isFilterActive: boolean;
  onCopyAll: () => void;
  onSort: () => void;
  onDedupe: () => void;
  onExactDedupe: () => void;
  onSync: () => void;
  onPurgeFiltered: () => void;
  onPurge: () => void;
}

export default function ActionBar({
  selectedCount, syncing, isFilterActive,
  onCopyAll, onSort, onDedupe, onExactDedupe, onSync, onPurgeFiltered, onPurge,
}: ActionBarProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0 overflow-x-auto bg-card">

      {/* Copy — always visible */}
      <Button
        size="sm"
        className="h-8 text-xs gap-1.5 shrink-0"
        onClick={onCopyAll}
        disabled={syncing}
        style={selectedCount > 0 ? { background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' } : undefined}
        variant={selectedCount > 0 ? 'default' : 'secondary'}
      >
        <Copy className="w-3 h-3" />
        <span className="hidden sm:inline">{selectedCount > 0 ? `Copy (${selectedCount})` : 'Copy All'}</span>
        <span className="sm:hidden">{selectedCount > 0 ? `(${selectedCount})` : 'Copy'}</span>
      </Button>

      {/* Sync — always visible */}
      <Button size="sm" variant="secondary" className="h-8 text-xs gap-1.5 shrink-0" onClick={onSync} disabled={syncing}>
        <RefreshCw className={`w-3 h-3 ${syncing ? 'mv-spin' : ''}`} />
        <span className="hidden sm:inline">Sync</span>
      </Button>

      {/* Sort — visible on sm+ */}
      <Button size="sm" variant="secondary" className="h-8 text-xs gap-1.5 shrink-0 hidden sm:flex" onClick={onSort} disabled={syncing}>
        <ArrowUpDown className="w-3 h-3" />
        Sort
      </Button>

      {/* Dedupe — visible on sm+ */}
      <Button size="sm" variant="secondary" className="h-8 text-xs gap-1.5 shrink-0 hidden sm:flex" onClick={onDedupe} disabled={syncing}>
        <Layers className="w-3 h-3" />
        {isFilterActive ? 'Dedupe↓' : 'Dedupe'}
      </Button>

      {/* More — mobile dropdown for secondary actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="secondary" className="h-8 text-xs gap-1.5 shrink-0 ml-auto" disabled={syncing}>
            <MoreHorizontal className="w-3 h-3" />
            <span className="hidden sm:inline">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          {/* On mobile, Sort and Dedupe move here */}
          <DropdownMenuItem className="sm:hidden gap-2 text-xs" onClick={onSort}>
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort by Episode
          </DropdownMenuItem>
          <DropdownMenuItem className="sm:hidden gap-2 text-xs" onClick={onDedupe}>
            <Layers className="w-3.5 h-3.5" /> {isFilterActive ? 'Dedupe (filtered)' : 'Dedupe'}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="sm:hidden" />
          <DropdownMenuItem className="gap-2 text-xs" onClick={onExactDedupe}>
            <ClipboardList className="w-3.5 h-3.5" /> {isFilterActive ? 'Exact Dedupe (filtered)' : 'Exact Dedupe'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
            onClick={onPurgeFiltered}
          >
            <Trash2 className="w-3.5 h-3.5" /> Purge Filtered
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2 text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
            onClick={onPurge}
          >
            <Flame className="w-3.5 h-3.5" /> Purge Vault
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
