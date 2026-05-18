/**
 * Catálogo completo de amenazas MAGERIT §5.
 * Muestra las 42 amenazas organizadas por grupo [N][I][E][A]
 * con sus activos afectados, dimensiones degradadas y correlaciones §5.5.
 */

import { useState, useMemo } from 'react';
import { MAGERIT_THREATS, GROUP_LABELS } from '../../data/threats.data';
import type { Threat } from '../../types';
import { ThreatGroupBadge, DimensionBadge } from './RiskBadges';

const GROUP_COLORS: Record<string, { bg: string; border: string; header: string; dot: string }> = {
  N: { bg: 'bg-sky-50',    border: 'border-sky-200',    header: 'bg-sky-100 text-sky-900',    dot: 'bg-sky-500' },
  I: { bg: 'bg-amber-50',  border: 'border-amber-200',  header: 'bg-amber-100 text-amber-900', dot: 'bg-amber-500' },
  E: { bg: 'bg-violet-50', border: 'border-violet-200', header: 'bg-violet-100 text-violet-900', dot: 'bg-violet-500' },
  A: { bg: 'bg-rose-50',   border: 'border-rose-200',   header: 'bg-rose-100 text-rose-900',   dot: 'bg-rose-500' },
};

const ASSET_LABELS: Record<string, string> = {
  D: 'Datos', K: 'Claves cripto', S: 'Servicios', SW: 'Software',
  HW: 'Hardware', COM: 'Comunicaciones', Media: 'Soportes',
  AUX: 'Aux. equip.', L: 'Instalaciones', P: 'Personal',
};

interface ThreatCardProps {
  threat: Threat;
  onUse?: (threat: Threat) => void;
}

function ThreatCard({ threat, onUse }: ThreatCardProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = GROUP_COLORS[threat.group];

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden transition-shadow hover:shadow-md`}>
      {/* Header de la tarjeta */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <ThreatGroupBadge group={threat.group} code={threat.code} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 leading-tight">{threat.name}</p>
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            {threat.affectedDimensions.map(d => (
              <DimensionBadge key={d.dimension} dimension={d.dimension} compact />
            ))}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 shrink-0 mt-0.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Detalle expandido */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-black/5 pt-3 flex flex-col gap-3">
          <p className="text-xs text-slate-600 leading-relaxed">{threat.description}</p>

          {/* Activos afectados */}
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Tipos de activos afectados
            </p>
            <div className="flex flex-wrap gap-1.5">
              {threat.affectedAssetTypes.map(a => (
                <span
                  key={a}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-white border border-slate-200 text-slate-600"
                >
                  [{a}] {ASSET_LABELS[a] ?? a}
                </span>
              ))}
            </div>
          </div>

          {/* Dimensiones con orden de relevancia */}
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Dimensiones degradadas (§3) — de más a menos relevante
            </p>
            <div className="flex flex-wrap gap-1.5">
              {threat.affectedDimensions
                .sort((a, b) => a.relevanceOrder - b.relevanceOrder)
                .map(d => (
                  <span key={d.dimension} className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">{d.relevanceOrder}.</span>
                    <DimensionBadge dimension={d.dimension} />
                    {d.note && <span className="text-[10px] text-slate-400 italic">({d.note})</span>}
                  </span>
                ))}
            </div>
          </div>

          {/* Origen y causa */}
          <div className="flex gap-4">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Origen (tho)</p>
              <div className="flex gap-1">
                {threat.origins.map(o => (
                  <span key={o} className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white border border-slate-200 text-slate-600">
                    {o === 'N' ? 'Natural' : o === 'E' ? 'Entorno' : 'Humano'}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Causa (thc)</p>
              <div className="flex gap-1">
                {threat.causes.map(c => (
                  <span key={c} className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    c === 'D' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {c === 'A' ? 'Accidental' : 'Deliberada'}
                  </span>
                ))}
              </div>
            </div>
            {threat.correlatedCode && (
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Correlación §5.5</p>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-slate-200 text-slate-600">
                  [{threat.correlatedCode}]
                </span>
              </div>
            )}
          </div>

          {onUse && (
            <button
              onClick={() => onUse(threat)}
              className="mt-1 w-full py-2 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              + Registrar riesgo con [{threat.code}]
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal del catálogo
// ---------------------------------------------------------------------------

interface Props {
  onUseThreat?: (threat: Threat) => void;
}

export function ThreatsCatalog({ onUseThreat }: Props) {
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState<string>('');

  const filtered = useMemo(() => {
    let list = MAGERIT_THREATS;
    if (activeGroup) list = list.filter(t => t.group === activeGroup);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.code.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, activeGroup]);

  const countByGroup = (g: string) => MAGERIT_THREATS.filter(t => t.group === g).length;

  return (
    <div className="flex flex-col h-full">
      {/* Barra superior */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Catálogo de Amenazas MAGERIT §5</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {MAGERIT_THREATS.length} amenazas · Libro II págs. 25-52
            </p>
          </div>
          <span className="text-xs text-slate-400">{filtered.length} mostradas</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Búsqueda */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar amenaza…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          {/* Filtros de grupo */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveGroup('')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                !activeGroup ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({MAGERIT_THREATS.length})
            </button>
            {['N', 'I', 'E', 'A'].map(g => {
              const colors = GROUP_COLORS[g];
              return (
                <button
                  key={g}
                  onClick={() => setActiveGroup(activeGroup === g ? '' : g)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                    activeGroup === g
                      ? `${colors.header} ${colors.border}`
                      : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
                  }`}
                >
                  [{g}] {countByGroup(g)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid de amenazas agrupadas */}
      <div className="flex-1 overflow-y-auto p-6">
        {(['N', 'I', 'E', 'A'] as const).map(group => {
          const groupThreats = filtered.filter(t => t.group === group);
          if (groupThreats.length === 0) return null;
          const colors = GROUP_COLORS[group];

          return (
            <div key={group} className="mb-8">
              {/* Cabecera de grupo */}
              <div className={`flex items-center gap-3 mb-4 px-4 py-2.5 rounded-xl ${colors.header}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                <span className="text-sm font-bold">[{group}] {GROUP_LABELS[group]}</span>
                <span className="ml-auto text-xs opacity-60">{groupThreats.length} amenazas</span>
              </div>

              {/* Tarjetas en grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {groupThreats.map(t => (
                  <ThreatCard key={t.code} threat={t} onUse={onUseThreat} />
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <p className="text-sm">No hay amenazas con esos criterios.</p>
          </div>
        )}
      </div>
    </div>
  );
}
