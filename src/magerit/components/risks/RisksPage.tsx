import { useState, useMemo } from 'react';
import { MAGERIT_THREATS, GROUP_LABELS } from '../../data/threats.data';
import type { Threat } from '../../types';

const ASSET_LABELS: Record<string, string> = {
  D: 'Datos', K: 'Claves cripto', S: 'Servicios', SW: 'Software',
  HW: 'Hardware', COM: 'Comunicaciones', Media: 'Soportes',
  AUX: 'Aux. equip.', L: 'Instalaciones', P: 'Personal',
};

const DIM_COLORS: Record<string, string> = {
  D: 'bg-blue-50 text-blue-700 border-blue-200',
  I: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  C: 'bg-purple-50 text-purple-700 border-purple-200',
  A: 'bg-orange-50 text-orange-700 border-orange-200',
  T: 'bg-pink-50 text-pink-700 border-pink-200',
};

function ThreatRow({ threat }: { threat: Threat }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-5 px-6 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-mono text-xs font-bold text-slate-400 w-16 shrink-0">[{threat.code}]</span>
        <span className="flex-1 text-[15px] font-medium text-slate-800 leading-snug">{threat.name}</span>
        <div className="flex gap-2 shrink-0">
          {threat.affectedDimensions.map(d => (
            <span
              key={d.dimension}
              className={`px-2 py-0.5 rounded text-xs font-bold border ${DIM_COLORS[d.dimension]}`}
            >
              {d.dimension}
            </span>
          ))}
        </div>
        <svg
          className={`w-4 h-4 text-slate-300 shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-6 pb-5 pt-4 border-t border-slate-100 flex flex-col gap-4 bg-slate-50/60">
          <p className="text-sm text-slate-600 leading-relaxed">{threat.description}</p>

          <div className="flex gap-8 flex-wrap">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Activos afectados
              </p>
              <div className="flex flex-wrap gap-2">
                {threat.affectedAssetTypes.map(a => (
                  <span key={a} className="px-2.5 py-1 rounded-lg text-xs bg-white border border-slate-200 text-slate-600">
                    [{a}] {ASSET_LABELS[a] ?? a}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Origen · Causa
              </p>
              <div className="flex gap-2">
                {threat.origins.map(o => (
                  <span key={o} className="px-2.5 py-1 rounded-lg text-xs bg-white border border-slate-200 text-slate-600">
                    {o === 'N' ? 'Natural' : o === 'E' ? 'Entorno' : 'Humano'}
                  </span>
                ))}
                {threat.causes.map(c => (
                  <span key={c} className={`px-2.5 py-1 rounded-lg text-xs font-medium ${c === 'D' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-white border border-slate-200 text-slate-600'}`}>
                    {c === 'A' ? 'Accidental' : 'Deliberada'}
                  </span>
                ))}
              </div>
            </div>

            {threat.correlatedCode && (
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Correlación §5.5
                </p>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white border border-slate-200 text-slate-500">
                  [{threat.correlatedCode}]
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RisksPage() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return MAGERIT_THREATS;
    const q = search.toLowerCase();
    return MAGERIT_THREATS.filter(t =>
      t.code.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Amenazas MAGERIT §5</h1>
            <p className="text-sm text-slate-400 mt-1">
              {MAGERIT_THREATS.length} amenazas · Libro II Catálogo de Elementos v3
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

      {/* Threat groups */}
      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-10">
        {(['N', 'I', 'E', 'A'] as const).map(group => {
          const threats = filtered.filter(t => t.group === group);
          if (!threats.length) return null;

          return (
            <section key={group}>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-mono text-sm font-bold text-slate-400">[{group}]</span>
                <h2 className="text-base font-bold text-slate-700">{GROUP_LABELS[group]}</h2>
                <span className="text-sm text-slate-400">{threats.length} amenazas</span>
              </div>

              <div className="flex flex-col gap-2">
                {threats.map(t => (
                  <ThreatRow key={t.code} threat={t} />
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
