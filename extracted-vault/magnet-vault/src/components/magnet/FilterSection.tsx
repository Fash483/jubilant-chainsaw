import { ChevronDown, Search, EyeOff, SplitSquareHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Filters } from '@/types/magnet';
import { useState } from 'react';

interface FilterSectionProps {
  filters: Filters;
  onFilterChange: (f: Filters) => void;
}

function FilterInput({
  icon: Icon,
  label,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </Label>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 text-xs bg-muted border-border"
      />
    </div>
  );
}

export default function FilterSection({ filters, onFilterChange }: FilterSectionProps) {
  const [open, setOpen] = useState(true);  const set = (field: keyof Filters) => (val: string) =>
    onFilterChange({ ...filters, [field]: val });

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted text-muted-foreground hover:text-foreground">
          <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-0' : '-rotate-90'}`} />
          <Search className="w-4 h-4 shrink-0 text-primary" />
          Filters
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 px-2 space-y-3">
          <FilterInput icon={Search} label="Show name" placeholder="e.g. the wire" value={filters.show} onChange={set('show')} />
          <FilterInput icon={Search} label="All keywords (AND)" placeholder="e.g. S03 1080p" value={filters.term} onChange={set('term')} />
          <FilterInput icon={Search} label="Any keyword (OR)" placeholder="e.g. 2160p REPACK" value={filters.or} onChange={set('or')} />
          <FilterInput icon={Search} label="Only phrase" placeholder="e.g. 1080p" value={filters.only} onChange={set('only')} />
          <FilterInput icon={Search} label="Except phrase" placeholder="e.g. cam, telesync" value={filters.except} onChange={set('except')} />

          <div className="border-t border-border pt-3 space-y-3">
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <EyeOff className="w-3 h-3" />
                  Hide count
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={filters.hideCount}
                  onChange={(e) => set('hideCount')(e.target.value)}
                  className="h-7 text-xs bg-muted border-border"
                />
              </div>
              <div className="w-28">
                <Select
                  value={filters.hidePosition}
                  onValueChange={(v) => onFilterChange({ ...filters, hidePosition: v as 'top' | 'bottom' })}
                >
                  <SelectTrigger className="h-7 text-xs bg-muted border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">From Top</SelectItem>
                    <SelectItem value="bottom">From Bottom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <SplitSquareHorizontal className="w-3 h-3" />
                  Split groups
                </Label>
                <Input
                  type="number"
                  min={2}
                  max={100}
                  placeholder="N groups"
                  value={filters.splitCount}
                  onChange={(e) => set('splitCount')(e.target.value)}
                  className="h-7 text-xs bg-muted border-border"
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">Per group</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="links/group"
                  value={filters.perGroup}
                  onChange={(e) => set('perGroup')(e.target.value)}
                  className="h-7 text-xs bg-muted border-border"
                />
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
