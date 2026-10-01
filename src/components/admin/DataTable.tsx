'use client';
import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';

type Column = { key: string; label: string; render?: (row: any) => React.ReactNode };

export default function DataTable({ columns, data, searchKeys = [], onRowClick, emptyMessage = 'No data', loading }: {
  columns: Column[]; data: any[]; searchKeys?: string[]; onRowClick?: (row: any) => void; emptyMessage?: string; loading?: boolean;
}) {
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    let r = data;
    if (q && searchKeys.length) {
      const lq = q.toLowerCase();
      r = r.filter((row) => searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(lq)));
    }
    if (sortKey) {
      r = [...r].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        if (av === bv) return 0;
        return (av > bv ? 1 : -1) * (sortDir === 'asc' ? 1 : -1);
      });
    }
    return r;
  }, [data, q, sortKey, sortDir, searchKeys]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search..."
            className="pl-8 pr-3 py-2 text-sm border border-rose-200 rounded-lg focus:border-rose-500 outline-none" />
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-rose-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-rose-50">
            <tr>
              {columns.map((c) => (
                <th key={c.key} onClick={() => { if (sortKey === c.key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); else { setSortKey(c.key); setSortDir('asc'); } }}
                  className="text-left px-4 py-3 font-medium text-rose-900 cursor-pointer select-none whitespace-nowrap">
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    {sortKey === c.key && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}><td colSpan={columns.length} className="px-4 py-3"><div className="h-4 bg-rose-100 rounded animate-pulse" /></td></tr>
            )) : current.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center py-12 text-rose-800/60">{emptyMessage}</td></tr>
            ) : current.map((row, i) => (
              <tr key={i} onClick={() => onRowClick?.(row)} className={'border-t border-rose-50 ' + (onRowClick ? 'cursor-pointer hover:bg-rose-50/50' : '')}>
                {columns.map((c) => <td key={c.key} className="px-4 py-3 text-rose-900">{c.render ? c.render(row) : row[c.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 text-sm border border-rose-200 rounded disabled:opacity-40">Prev</button>
          <span className="px-3 py-1 text-sm text-rose-800">Page {page} / {pages}</span>
          <button disabled={page === pages} onClick={() => setPage(page + 1)} className="px-3 py-1 text-sm border border-rose-200 rounded disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
