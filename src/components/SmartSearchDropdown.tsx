import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { slugify } from '@/lib/slugify';

interface Props {
  items: string[];
  placeholder: string;
  basePath: string;
  onAddNew?: (name: string) => void;
  emptyLabel?: string;
}

const SmartSearchDropdown = ({ items, placeholder, basePath, onAddNew, emptyLabel = 'No items added yet' }: Props) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const uniqueItems = [...new Set(items)].sort();
  const filtered = query ? uniqueItems.filter(n => n.toLowerCase().includes(query.toLowerCase())) : uniqueItems;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (name: string) => {
    setOpen(false);
    setQuery('');
    navigate(`${basePath}/${slugify(name)}`);
  };

  return (
    <div ref={ref} className="relative mb-6">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
      <input value={query} onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-surface2 py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-accent-light" />
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-lg border border-border bg-card shadow-md max-h-[240px] overflow-y-auto">
          {uniqueItems.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground text-center">{emptyLabel}</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-2">
              <p className="text-sm text-muted-foreground">No results for "{query}"</p>
              {onAddNew && (
                <button onClick={() => { onAddNew(query); setOpen(false); setQuery(''); }}
                  className="mt-1 text-sm font-medium text-primary hover:underline">
                  + Add "{query}" as new
                </button>
              )}
            </div>
          ) : (
            filtered.map(name => (
              <button key={name} onClick={() => handleSelect(name)}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-secondary transition-colors">
                {query ? (
                  <span dangerouslySetInnerHTML={{
                    __html: name.replace(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<strong class="text-primary">$1</strong>')
                  }} />
                ) : name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearchDropdown;
