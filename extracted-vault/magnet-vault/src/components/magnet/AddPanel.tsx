import { useState } from 'react';
import { Plus, ClipboardPaste } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { parseMagnetTitle, isValidMagnet } from '@/lib/magnetUtils';

interface AddPanelProps {
  syncing: boolean;
  onAdd: (title: string, magnet: string) => void;
  onPasteAdd: (raw: string) => void;
}

export default function AddPanel({ syncing, onAdd, onPasteAdd }: AddPanelProps) {
  const [open, setOpen] = useState(true);
  const [title, setTitle] = useState('');
  const [magnet, setMagnet] = useState('');

  function handleMagnetChange(val: string) {
    setMagnet(val);
    if (!title.trim()) {
      const parsed = parseMagnetTitle(val);
      if (parsed) setTitle(parsed);
    }
  }

  function handleAdd() {
    if (!isValidMagnet(magnet)) return;
    const t = title.trim() || parseMagnetTitle(magnet) || '(untitled)';
    onAdd(t, magnet.trim());
    setTitle('');
    setMagnet('');
  }

  function handlePasteAdd() {
    onPasteAdd(magnet);
    setTitle('');
    setMagnet('');
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted text-muted-foreground hover:text-foreground">
          <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-0' : '-rotate-90'}`} />
          <Plus className="w-4 h-4 shrink-0 text-primary" />
          Add Links Manually
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 px-2 space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Title</Label>
            <Input
              type="text"
              placeholder="Auto-filled from magnet if blank"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 text-sm bg-muted border-border"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Magnet URL</Label>
            <textarea
              rows={3}
              placeholder="magnet:?xt=urn:btih:..."
              value={magnet}
              onChange={(e) => handleMagnetChange(e.target.value)}
              className="w-full rounded-md border border-border bg-muted px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={syncing || !isValidMagnet(magnet)}
              className="flex-1 h-8 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePasteAdd}
              disabled={syncing}
              className="flex-1 h-8 text-xs border-border"
              title="Parse all magnet links from pasted text"
            >
              <ClipboardPaste className="w-3 h-3 mr-1" />
              Add All Pasted
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
