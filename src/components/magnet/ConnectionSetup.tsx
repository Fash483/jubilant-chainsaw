import { useState } from 'react';
import { Database, Eye, EyeOff, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ensureTable, saveConnectionString, clearConnectionString, getConnectionString } from '@/lib/neon';

interface ConnectionSetupProps {
  onConnected: (cs: string) => void;
  isSettings?: boolean;
  onCancel?: () => void;
}

export default function ConnectionSetup({ onConnected, isSettings, onCancel }: ConnectionSetupProps) {
  const [connectionString, setConnectionString] = useState(getConnectionString() ?? '');
  const [showCs, setShowCs] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');

  async function handleConnect() {
    const cs = connectionString.trim();
    if (!cs.startsWith('postgresql://') && !cs.startsWith('postgres://')) {
      setError('Connection string must start with postgresql:// or postgres://');
      return;
    }
    setError('');
    setTesting(true);
    try {
      await ensureTable(cs);
      saveConnectionString(cs);
      onConnected(cs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed. Check your connection string.');
    } finally {
      setTesting(false);
    }
  }

  function handleClear() {
    clearConnectionString();
    setConnectionString('');
    setError('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl bg-primary" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl bg-accent" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-muted border border-border">
            <span className="text-3xl">🦋</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Magnet Vault</h1>
          <p className="text-muted-foreground text-sm">
            {isSettings ? 'Update your NeonDB connection' : 'Connect your NeonDB database to get started'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 border border-border bg-card">
          {isSettings && onCancel && (
            <div className="flex justify-end mb-4">
              <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                NeonDB Connection String
              </Label>
              <div className="relative">
                <Input
                  type={showCs ? 'text' : 'password'}
                  placeholder="postgresql://user:password@host/dbname"
                  value={connectionString}
                  onChange={(e) => { setConnectionString(e.target.value); setError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                  className="pr-10 bg-muted border-border text-foreground placeholder:text-muted-foreground font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCs((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCs ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get your connection string from{' '}
                <a href="https://console.neon.tech" target="_blank" rel="noreferrer"
                  className="underline hover:text-primary transition-colors">
                  console.neon.tech
                </a>. Stored locally in your browser.
              </p>
            </div>

            {error && (
              <div className="rounded-lg p-3 text-sm bg-destructive/10 border border-destructive/40 text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={handleConnect}
                disabled={testing || !connectionString.trim()}
              >
                {testing ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 mv-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    {isSettings ? 'Update Connection' : 'Connect & Enter Vault'}
                  </>
                )}
              </Button>
              {getConnectionString() && (
                <Button variant="outline" onClick={handleClear} className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 rounded-xl p-4 border border-border bg-muted text-sm">
          <p className="text-muted-foreground text-xs leading-relaxed">
            🔒 Your connection string is stored only in <strong className="text-foreground">your browser's localStorage</strong> and never sent to any third-party server. The app connects directly to NeonDB using the serverless HTTP driver.
          </p>
        </div>
      </div>
    </div>
  );
}
