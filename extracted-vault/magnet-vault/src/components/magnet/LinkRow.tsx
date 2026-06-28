import { useState } from 'react';
import { Copy, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { MagnetLink } from '@/types/magnet';
import { parseSeasonEpisode, parseMagnetTitle } from '@/lib/magnetUtils';

interface LinkRowProps {
  link: MagnetLink;
  isSelected: boolean;
  isHidden: boolean;
  onCopy: (magnet: string) => void;
  onDelete: (id: string) => void;
  onToggleSelect: () => void;
}

export default function LinkRow({ link, isSelected, isHidden, onCopy, onDelete, onToggleSelect }: LinkRowProps) {
  const [expanded, setExpanded] = useState(false);
  const se = parseSeasonEpisode(link.title);
  const dn = parseMagnetTitle(link.magnet);
  const date = link.created_date ? new Date(link.created_date).toLocaleString() : '';

  return (
    <li
      className={`group flex items-start gap-3 p-3 border-b border-border cursor-pointer select-none transition-colors ${
        isSelected ? 'bg-primary/10' : 'hover:bg-muted/60'
      } ${isHidden ? 'opacity-40' : ''}`}
      onClick={onToggleSelect}
    >
      {/* Checkbox visual */}
      <div className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
        isSelected ? 'bg-primary border-primary' : 'border-border'
      }`}>
        {isSelected && (
          <svg className="w-2.5 h-2.5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Title row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-medium break-words ${isHidden ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {link.title || '(untitled)'}
          </span>
          {se && (
            <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold"
              style={{ background: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))', border: '1px solid hsl(var(--primary) / 0.4)' }}>
              S{String(se.season).padStart(2, '0')}E{String(se.episode).padStart(2, '0')}
            </span>
          )}
          {isHidden && (
            <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>
              hidden
            </span>
          )}
        </div>

        {/* Display name (if differs from title) */}
        {dn && dn !== link.title && (
          <p className="text-xs text-muted-foreground break-words">{dn}</p>
        )}

        {/* Magnet URL — full, break-all, with expand toggle */}
        <div className="space-y-0.5" onClick={(e) => e.stopPropagation()}>
          <p className={`text-[11px] font-mono break-all ${expanded ? '' : 'line-clamp-2'}`}
            style={{ color: 'hsl(var(--primary))' }}>
            {link.magnet}
          </p>
          <button
            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          >
            {expanded ? (
              <><ChevronUp className="w-3 h-3" /> collapse</>
            ) : (
              <><ChevronDown className="w-3 h-3" /> show full link</>
            )}
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground/50">{date}</p>
      </div>

      {/* Actions — always visible on mobile, hover-reveal on desktop */}
      <div className="shrink-0 flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <button
          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          onClick={() => onCopy(link.magnet)}
          title="Copy magnet link"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={() => onDelete(link.id)}
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </li>
  );
}
