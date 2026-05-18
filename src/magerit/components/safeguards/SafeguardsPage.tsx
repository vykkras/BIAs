import { useState, useMemo } from 'react';
import { SAFEGUARD_CATALOG, FAMILY_META, SAFEGUARD_FAMILIES } from '../../data/safeguards.data';
import type { SafeguardCatalogEntry } from '../../data/safeguards.data';

function SafeguardRow({ sg }: { sg: SafeguardCatalogEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-5 px-6 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-mono text-xs font-bold text-slate-400 w-24 shrink-0">[{sg.code}]</span>
        <span className="flex-1 text-[15px] font-medium text-slate-800 leading-snug">{sg.name}</span>
        <svg
          className={`w-4 h-4 text-slate-300 shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-6 pb-5 pt-4 border-t border-slate-100 bg-slate-50/60">
          <p className="text-sm text-slate-600 leading-relaxed">{sg.description}</p>
        </div>
      )}
    </div>
  );
}

export default function SafeguardsPage() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return SAFEGUARD_CATALOG;
    const q = search.toLowerCase();
    return SAFEGUARD_CATALOG.filter(s =>
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Salvaguardas MAGERIT §6</h1>
            <p className="text-sm text-slate-400 mt-1">
              {SAFEGUARD_CATALOG.length} salvaguardas · 16 familias · Libro II págs. 53-57
            </p>
          </div>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar código, nombre, descripción…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm w-80 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </div>
      </div>

      {/* Families */}
      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-10">
        {SAFEGUARD_FAMILIES.map(fam => {
          const entries = filtered.filter(s => s.family === fam);
          if (!entries.length) return null;
          const meta = FAMILY_META[fam];

          return (
            <section key={fam}>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-mono text-sm font-bold text-slate-400">[{fam}]</span>
                <h2 className="text-base font-bold text-slate-700">{meta.label}</h2>
                <span className="text-sm text-slate-400">{meta.section} · {entries.length} salvaguardas</span>
              </div>

              <div className="flex flex-col gap-2">
                {entries.map(sg => (
                  <SafeguardRow key={sg.code} sg={sg} />
                ))}
              </div>
            </section>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-40 text-sm text-slate-400">
            Sin resultados para "{search}"
          </div>
        )}
      </div>
    </div>
  );
}
