import { useState } from 'react';
import { ChevronDown, Star, Plus, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DedupeSettings } from '@/types/magnet';

interface PriorityPanelProps {
  words: string[];
  settings: DedupeSettings;
  onMove: (idx: number, dir: -1 | 1) => void;
  onRemove: (idx: number) => void;
  onAdd: (word: string) => void;
  onSettingsChange: (partial: Partial<DedupeSettings>) => void;
}

export default function PriorityPanel({ words, settings, onMove, onRemove, onAdd, onSettingsChange }: PriorityPanelProps) {
  const [open, setOpen] = useState(true);
  const [newWord, setNewWord] = useState('');

  function handleAdd() {
    const w = newWord.trim().toLowerCase();
    if (w && !words.includes(w)) {
      onAdd(w);
      setNewWord('');
    }
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted text-muted-foreground hover:text-foreground">
          <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-0' : '-rotate-90'}`} />
          <Star className="w-4 h-4 shrink-0 text-primary" />
          Dedupe Priority Words
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 px-2 space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            When duplicate episodes are found, the link containing the highest-ranked priority word is kept.
          </p>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Dedupe mode</Label>
            <Select
              value={settings.mode}
              onValueChange={(v) => onSettingsChange({ mode: v as DedupeSettings['mode'] })}
            >
              <SelectTrigger className="h-7 text-xs bg-muted border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Use priority words</SelectItem>
                <SelectItem value="keep-first">Keep first shown</SelectItem>
                <SelectItem value="keep-second">Keep second shown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Phrase to remove from title</Label>
            <Input
              type="text"
              placeholder="e.g. REPACK"
              value={settings.removePhrase}
              onChange={(e) => onSettingsChange({ removePhrase: e.target.value })}
              className="h-7 text-xs bg-muted border-border"
            />
          </div>

          {/* Priority list */}
          <div className="space-y-1">
            {words.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">No priority words set.</p>
            ) : (
              words.map((word, idx) => (
                <div key={word} className="flex items-center gap-1.5 py-1 px-2 rounded-md bg-muted">
                  <span className="text-xs font-mono font-semibold text-foreground flex-1 uppercase">{word}</span>
                  <button
                    className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                    onClick={() => onMove(idx, -1)}
                    disabled={idx === 0}
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                    onClick={() => onMove(idx, 1)}
                    disabled={idx === words.length - 1}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button
                    className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(idx)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add keyword (e.g. 4k)…"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="h-7 text-xs bg-muted border-border flex-1"
            />
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!newWord.trim()}
              className="h-7 text-xs px-2"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
