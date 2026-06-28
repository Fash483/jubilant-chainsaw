import { useState } from 'react';
import { Plus, SlidersHorizontal, Wrench, Bookmark } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import AddPanel from './AddPanel';
import FilterSection from './FilterSection';
import PriorityPanel from './PriorityPanel';
import BookmarkletPanel from './BookmarkletPanel';
import type { Filters, DedupeSettings } from '@/types/magnet';

type Tab = 'add' | 'filter' | 'tools' | 'bookmarklet' | null;

interface MobileBottomBarProps {
  syncing: boolean;
  filters: Filters;
  priorityWords: string[];
  dedupeSettings: DedupeSettings;
  connectionString: string;
  onAdd: (title: string, magnet: string) => void;
  onPasteAdd: (raw: string) => void;
  onFilterChange: (f: Filters) => void;
  onMoveWord: (idx: number, dir: -1 | 1) => void;
  onRemoveWord: (i: number) => void;
  onAddWord: (w: string) => void;
  onSettingsChange: (p: Partial<DedupeSettings>) => void;
}

const TABS: { id: Tab; icon: React.ReactNode; label: string }[] = [
  { id: 'add',         icon: <Plus className="w-5 h-5" />,                label: 'Add'       },
  { id: 'filter',      icon: <SlidersHorizontal className="w-5 h-5" />,   label: 'Filter'    },
  { id: 'tools',       icon: <Wrench className="w-5 h-5" />,              label: 'Tools'     },
  { id: 'bookmarklet', icon: <Bookmark className="w-5 h-5" />,            label: 'Bookmarks' },
];

export default function MobileBottomBar({
  syncing, filters, priorityWords, dedupeSettings, connectionString,
  onAdd, onPasteAdd, onFilterChange,
  onMoveWord, onRemoveWord, onAddWord, onSettingsChange,
}: MobileBottomBarProps) {
  const [activeTab, setActiveTab] = useState<Tab>(null);

  function toggle(tab: Tab) {
    setActiveTab((prev) => (prev === tab ? null : tab));
  }

  const SHEET_TITLE: Record<NonNullable<Tab>, string> = {
    add:         'Add Magnet',
    filter:      'Filter & Search',
    tools:       'Priority & Dedupe',
    bookmarklet: 'Browser Integration',
  };

  return (
    <>
      {/* Bottom navigation bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center border-t border-border bg-background"
      >
        {TABS.map(({ id, icon, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
              style={{ color: active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
            >
              {icon}
              <span className="text-[10px] font-medium">{label}</span>
              {active && (
                <span
                  className="absolute bottom-0 w-8 h-0.5 rounded-full"
                  style={{ background: 'hsl(var(--primary))' }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Sheet */}
      <Sheet open={activeTab !== null} onOpenChange={(o) => { if (!o) setActiveTab(null); }}>
        <SheetContent
          side="bottom"
          className="md:hidden max-h-[80dvh] overflow-y-auto rounded-t-2xl px-0 pb-safe bg-background border-border"
        >
          <SheetHeader className="px-4 pb-2">
            <SheetTitle className="text-sm font-semibold gradient-text text-left">
              {activeTab ? SHEET_TITLE[activeTab] : ''}
            </SheetTitle>
          </SheetHeader>

          <div className="px-3 pb-6">
            {activeTab === 'add' && (
              <AddPanel syncing={syncing} onAdd={onAdd} onPasteAdd={onPasteAdd} />
            )}
            {activeTab === 'filter' && (
              <FilterSection filters={filters} onFilterChange={onFilterChange} />
            )}
            {activeTab === 'tools' && (
              <PriorityPanel
                words={priorityWords}
                settings={dedupeSettings}
                onMove={onMoveWord}
                onRemove={onRemoveWord}
                onAdd={onAddWord}
                onSettingsChange={onSettingsChange}
              />
            )}
            {activeTab === 'bookmarklet' && (
              <BookmarkletPanel connectionString={connectionString} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
