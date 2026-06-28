import { RefreshCw, Settings, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  syncing: boolean;
  onSync: () => void;
  onSettings: () => void;
}

export default function MagnetHeader({ syncing, onSync, onSettings }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 h-14 border-b border-border shrink-0 bg-background/95 backdrop-blur-sm">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xl">🦋</span>
        <h1 className="text-lg font-bold gradient-text truncate">Magnet Vault</h1>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSync}
          disabled={syncing}
          className="text-muted-foreground hover:text-foreground"
          title="Sync from database"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'mv-spin' : ''}`} />
          <span className="sr-only md:not-sr-only ml-1 text-xs">{syncing ? 'Syncing…' : 'Sync'}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettings}
          className="text-muted-foreground hover:text-foreground"
          title="Connection settings"
        >
          <Database className="w-4 h-4" />
          <span className="sr-only md:not-sr-only ml-1 text-xs">Connection</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettings}
          className="text-muted-foreground hover:text-primary md:hidden"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
