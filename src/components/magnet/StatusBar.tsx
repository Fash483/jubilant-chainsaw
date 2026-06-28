import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface StatusBarProps {
  connected: boolean;
  syncing: boolean;
  filteredCount: number;
  totalCount: number;
}

export default function StatusBar({ connected, syncing, filteredCount, totalCount }: StatusBarProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-t border-border text-xs shrink-0 bg-card">
      <div className="flex items-center gap-1.5">
        {syncing ? (
          <>
            <Loader2 className="w-3 h-3 text-primary mv-spin" />
            <span className="text-muted-foreground">Syncing…</span>
          </>
        ) : connected ? (
          <>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'hsl(140 70% 55%)' }} />
            <span className="text-muted-foreground">Vault Synced</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(0 70% 55%)' }} />
            <span className="text-muted-foreground">Disconnected</span>
          </>
        )}
      </div>
      <div className="w-px h-3 bg-border" />
      <span className="text-muted-foreground">
        <span className="text-foreground font-medium">{filteredCount}</span>
        {' / '}
        <span>{totalCount}</span>
        {' shown'}
      </span>
    </div>
  );
}
