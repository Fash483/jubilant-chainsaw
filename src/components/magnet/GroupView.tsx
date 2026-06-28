import type { MagnetLink } from '@/types/magnet';
import LinkRow from './LinkRow';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GroupViewProps {
  groups: MagnetLink[][];
  selectedIds: Set<string>;
  hiddenIds: Set<string>;
  onCopy: (magnet: string) => void;
  onDelete: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onCopyGroup: (group: MagnetLink[], idx: number) => void;
}

export default function GroupView({ groups, selectedIds, hiddenIds, onCopy, onDelete, onToggleSelect, onCopyGroup }: GroupViewProps) {
  if (groups.every((g) => g.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <span className="text-4xl mb-3">🦋</span>
        <p className="text-sm">No magnet links match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3">
      {groups.map((group, idx) => (
        <div key={idx} className="rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted">
            <div className="flex items-center gap-2">
              <span className="text-sm">🦋</span>
              <span className="text-sm font-semibold text-foreground">Group {idx + 1}</span>
              <span className="text-xs text-muted-foreground">of {groups.length}</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded font-medium bg-primary/15 text-primary">
                {group.length} link{group.length !== 1 ? 's' : ''}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
              onClick={() => onCopyGroup(group, idx + 1)}
            >
              <Copy className="w-3 h-3" />
              Copy Group
            </Button>
          </div>
          {group.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No links in this group.</p>
          ) : (
            <ul>
              {group.map((l) => (
                <LinkRow
                  key={l.id}
                  link={l}
                  isSelected={selectedIds.has(l.id)}
                  isHidden={hiddenIds.has(l.id)}
                  onCopy={onCopy}
                  onDelete={onDelete}
                  onToggleSelect={() => onToggleSelect(l.id)}
                />
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
