import type { MagnetLink } from '@/types/magnet';
import LinkRow from './LinkRow';

interface LinkListProps {
  links: MagnetLink[];
  selectedIds: Set<string>;
  hiddenIds: Set<string>;
  onCopy: (magnet: string) => void;
  onDelete: (id: string) => void;
  onToggleSelect: (id: string) => void;
}

export default function LinkList({ links, selectedIds, hiddenIds, onCopy, onDelete, onToggleSelect }: LinkListProps) {
  if (!links.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <span className="text-4xl mb-3">🦋</span>
        <p className="text-sm">No magnet links in the vault yet.</p>
        <p className="text-xs mt-1 opacity-60">Add some below!</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {links.map((l) => (
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
  );
}
