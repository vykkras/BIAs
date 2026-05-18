/**
 * Pestaña "Mapeos" — Matriz Amenaza §5 ↔ Salvaguarda §6 (N:M)
 * §A4.3 Evaluación de salvaguardas · §A4.4 Estado de riesgo
 *
 * Tres vistas:
 *   1. Detalle    — lista de mapeos + panel de salvaguardas aplicadas
 *   2. Heatmap    — mapa de riesgo 5×5 (Probabilidad × Impacto)
 *   3. Matriz     — cobertura Mapeo × Familia §6 (interactiva)
 */

import { useState, useMemo } from 'react';
import {
  useMappingStore, calcCombinedEff, getRiskLevel,
  type Mapping, type MappingSafeguard, type RiskLevel,
} from '../../store/mappingStore';
import { MAGERIT_THREATS, GROUP_LABELS } from '../../data/threats.data';
import { SAFEGUARD_CATALOG, CATALOG_BY_CODE, FAMILY_META, SAFEGUARD_FAMILIES } from '../../data/safeguards.data';
import type { SafeguardFamily } from '../../types';

// ---------------------------------------------------------------------------
// Constantes de presentación
// ---------------------------------------------------------------------------

const PROB_LABELS = ['', 'Muy rara', 'Poco freq.', 'Posible', 'Frecuente', 'Muy freq.'];
const IMP_LABELS  = ['', 'Mínimo',   'Bajo',       'Medio',   'Alto',      'Crítico'];

const LEVEL_COLORS: Record<RiskLevel, { bg: string; text: string; light: string }> = {
  CRITICO: { bg: 'bg-red-600',    text: 'text-white',       light: 'bg-red-50 text-red-700 border-red-200' },
  ALTO:    { bg: 'bg-orange-500', text: 'text-white',       light: 'bg-orange-50 text-orange-700 border-orange-200' },
  MEDIO:   { bg: 'bg-amber-400',  text: 'text-amber-900',   light: 'bg-amber-50 text-amber-700 border-amber-200' },
  BAJO:    { bg: 'bg-green-500',  text: 'text-white',       light: 'bg-green-50 text-green-700 border-green-200' },
  MUY_BAJO:{ bg: 'bg-slate-300',  text: 'text-slate-700',   light: 'bg-slate-50 text-slate-500 border-slate-200' },
};

// Color de celda en el heatmap 5×5 según P×I
function heatCellBg(p: number, i: number): string {
  const s = p * i;
  if (s >= 20) return 'bg-red-500';
  if (s >= 12) return 'bg-orange-400';
  if (s >= 6)  return 'bg-amber-300';
  if (s >= 3)  return 'bg-green-300';
  return 'bg-slate-200';
}

function effColor(pct: number) {
  if (pct >= 75) return 'text-emerald-600';
  if (pct >= 50) return 'text-amber-600';
  if (pct >= 25) return 'text-orange-600';
  return 'text-red-600';
}

function LevelBadge({ score, compact }: { score: number; compact?: boolean }) {
  const lvl = getRiskLevel(score);
  const c = LEVEL_COLORS[lvl];
  const label: Record<RiskLevel, string> = {
    CRITICO: 'Crítico', ALTO: 'Alto', MEDIO: 'Medio', BAJO: 'Bajo', MUY_BAJO: 'Muy bajo',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border ${c.light}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.bg}`} />
      {compact ? score.toFixed(1) : `${label[lvl]} (${score.toFixed(1)})`}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Modal: crear mapeo
// ---------------------------------------------------------------------------

function CreateMappingModal({ onClose }: { onClose: () => void }) {
  const { createMapping } = useMappingStore();
  const [threatCode, setThreatCode] = useState('');
  const [assetLabel, setAssetLabel] = useState('');
  const [probability, setProbability] = useState(3);
  const [impact, setImpact] = useState(3);
  const [notes, setNotes] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!threatCode || !assetLabel) return;
    createMapping({ threatCode, assetLabel, probability, impact, notes: notes || undefined });
    onClose();
  }

  const previewScore = probability * impact;
  const previewLevel = getRiskLevel(previewScore);
  const c = LEVEL_COLORS[previewLevel];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Crear mapeo</h2>
            <p className="text-xs text-slate-400 mt-0.5">Amenaza §5 · Activo · Nivel de riesgo</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-6 flex flex-col gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Amenaza §5 *</label>
            <select
              value={threatCode}
              onChange={e => setThreatCode(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="">— Selecciona una amenaza —</option>
              {(['N','I','E','A'] as const).map(g => (
                <optgroup key={g} label={`[${g}] ${GROUP_LABELS[g]}`}>
                  {MAGERIT_THREATS.filter(t => t.group === g).map(t => (
                    <option key={t.code} value={t.code}>[{t.code}] {t.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Activo afectado *</label>
            <input
              type="text"
              value={assetLabel}
              onChange={e => setAssetLabel(e.target.value)}
              required
              placeholder="ej. Servidor web, Base de datos clientes…"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Probabilidad <span className="text-slate-400 font-normal">(1-5)</span>
              </label>
              <div className="flex gap-1.5">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n} type="button"
                    onClick={() => setProbability(n)}
                    title={PROB_LABELS[n]}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      probability === n ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >{n}</button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{PROB_LABELS[probability]}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Impacto <span className="text-slate-400 font-normal">(1-5)</span>
              </label>
              <div className="flex gap-1.5">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n} type="button"
                    onClick={() => setImpact(n)}
                    title={IMP_LABELS[n]}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      impact === n ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >{n}</button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{IMP_LABELS[impact]}</p>
            </div>
          </div>

          {/* Preview score */}
          <div className={`rounded-xl px-4 py-3 flex items-center justify-between ${c.light} border`}>
            <p className="text-xs font-semibold">Riesgo inherente (P×I)</p>
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold">{probability}×{impact} = {previewScore}</span>
              <LevelBadge score={previewScore} compact />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notas</label>
            <textarea
              rows={2} value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Contexto del riesgo…"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700">
              Crear mapeo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel: añadir salvaguarda a un mapeo
// ---------------------------------------------------------------------------

function AddSafeguardPanel({ mappingId, existing, onDone }: {
  mappingId: string;
  existing: string[];
  onDone: () => void;
}) {
  const { addSafeguard } = useMappingStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('');
  const [eff, setEff] = useState(50);

  const options = useMemo(() => {
    const q = search.toLowerCase();
    return SAFEGUARD_CATALOG.filter(s =>
      !existing.includes(s.code) &&
      (s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    );
  }, [search, existing]);

  function handleAdd() {
    if (!selected) return;
    addSafeguard(mappingId, { code: selected, effectiveness: eff });
    onDone();
  }

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col gap-3">
      <p className="text-xs font-semibold text-slate-600">Añadir salvaguarda §6</p>
      <input
        type="text"
        placeholder="Buscar salvaguarda…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
      />
      <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-lg bg-white divide-y divide-slate-50">
        {options.slice(0, 50).map(s => (
          <button
            key={s.code}
            type="button"
            onClick={() => setSelected(s.code)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
              selected === s.code ? 'bg-slate-800 text-white' : 'hover:bg-slate-50 text-slate-700'
            }`}
          >
            <span className="font-mono text-xs w-20 shrink-0 opacity-60">[{s.code}]</span>
            <span className="flex-1 leading-snug">{s.name}</span>
          </button>
        ))}
        {options.length === 0 && (
          <p className="px-3 py-4 text-xs text-center text-slate-400">Sin resultados</p>
        )}
      </div>

      {selected && (
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600 shrink-0">
            Eficacia: <span className={`font-bold ${effColor(eff)}`}>{eff}%</span>
          </label>
          <input
            type="range" min={0} max={100} step={5}
            value={eff}
            onChange={e => setEff(Number(e.target.value))}
            className="flex-1 accent-slate-800"
          />
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDone}
          className="flex-1 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-500 hover:bg-slate-100"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selected}
          className="flex-1 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-40"
        >
          + Añadir
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vista DETALLE: panel derecho cuando hay mapeo seleccionado
// ---------------------------------------------------------------------------

function DetailPanel({ mapping }: { mapping: Mapping }) {
  const { removeSafeguard, updateEffectiveness } = useMappingStore();
  const [showAdd, setShowAdd] = useState(false);

  const threat = MAGERIT_THREATS.find(t => t.code === mapping.threatCode);
  const inherentLevel = getRiskLevel(mapping.inherentScore);
  const residualLevel = getRiskLevel(mapping.residualScore);

  // Dimensiones cubiertas por las salvaguardas aplicadas (de sus catálogos)
  const coveredFamilies = [...new Set(mapping.safeguards.map(sg => {
    const entry = CATALOG_BY_CODE[sg.code];
    return entry?.family ?? null;
  }).filter(Boolean))];

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto">

      {/* Info del riesgo */}
      <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="font-mono text-xs text-slate-400 mb-0.5">[{mapping.threatCode}] · {mapping.id}</p>
            <p className="text-base font-bold text-slate-800 leading-snug">{threat?.name ?? mapping.threatCode}</p>
            <p className="text-sm text-slate-500 mt-0.5">{mapping.assetLabel}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white rounded-lg border border-slate-100 py-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Probabilidad</p>
            <p className="text-xl font-black text-slate-700">{mapping.probability}</p>
            <p className="text-[10px] text-slate-400">{PROB_LABELS[mapping.probability]}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-100 py-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Impacto</p>
            <p className="text-xl font-black text-slate-700">{mapping.impact}</p>
            <p className="text-[10px] text-slate-400">{IMP_LABELS[mapping.impact]}</p>
          </div>
          <div className={`rounded-lg border py-2 ${LEVEL_COLORS[inherentLevel].light}`}>
            <p className="text-[10px] uppercase tracking-wider opacity-70">Inherente</p>
            <p className="text-xl font-black">{mapping.inherentScore}</p>
            <p className="text-[10px] opacity-70">P×I</p>
          </div>
        </div>
      </div>

      {/* Salvaguardas aplicadas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Salvaguardas aplicadas §6
            <span className="ml-2 text-slate-400 normal-case font-normal">({mapping.safeguards.length})</span>
          </p>
          {!showAdd && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Añadir
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {mapping.safeguards.map(sg => {
            const entry = CATALOG_BY_CODE[sg.code];
            return (
              <div key={sg.code} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
                <span className="font-mono text-xs text-slate-400 shrink-0 w-20">[{sg.code}]</span>
                <span className="flex-1 text-sm text-slate-700 leading-tight min-w-0 truncate" title={entry?.name}>
                  {entry?.name ?? sg.code}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number" min={0} max={100} step={5}
                    value={sg.effectiveness}
                    onChange={e => updateEffectiveness(mapping.id, sg.code, Number(e.target.value))}
                    className="w-14 text-center border border-slate-200 rounded-lg text-xs py-1 font-bold focus:outline-none focus:ring-1 focus:ring-slate-300"
                  />
                  <span className={`text-xs font-bold ${effColor(sg.effectiveness)}`}>%</span>
                  <button
                    onClick={() => removeSafeguard(mapping.id, sg.code)}
                    className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}

          {mapping.safeguards.length === 0 && !showAdd && (
            <p className="text-xs text-slate-400 text-center py-4">
              Sin salvaguardas asignadas — pulsa Añadir para comenzar.
            </p>
          )}
        </div>

        {showAdd && (
          <div className="mt-2">
            <AddSafeguardPanel
              mappingId={mapping.id}
              existing={mapping.safeguards.map(s => s.code)}
              onDone={() => setShowAdd(false)}
            />
          </div>
        )}
      </div>

      {/* Cálculo §A4.4 */}
      <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 flex flex-col gap-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Cálculo de mitigación — §A4.4
        </p>

        {/* Fórmula */}
        <div className="bg-white rounded-lg border border-slate-100 px-3 py-2">
          <p className="text-[10px] text-slate-400 mb-1 font-mono">Eficacia combinada = 1 − ∏(1 − Eᵢ/100)</p>
          {mapping.safeguards.length > 0 ? (
            <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
              = 1 − {mapping.safeguards.map(s => `(1−${s.effectiveness}/100)`).join('×')}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 font-mono">= 0% (sin salvaguardas)</p>
          )}
        </div>

        {/* Resultados */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white rounded-lg border border-slate-100 py-2">
            <p className="text-[10px] text-slate-400 uppercase">Eficacia</p>
            <p className={`text-lg font-black ${effColor(mapping.combinedEffectiveness)}`}>
              {mapping.combinedEffectiveness.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-100 py-2">
            <p className="text-[10px] text-slate-400 uppercase">Cobertura</p>
            <p className="text-lg font-black text-slate-600">
              {mapping.safeguards.length > 0
                ? (mapping.combinedEffectiveness >= 75 ? 'Total' : mapping.combinedEffectiveness >= 30 ? 'Parcial' : 'Mínima')
                : '—'}
            </p>
          </div>
          <div className={`rounded-lg border py-2 ${LEVEL_COLORS[residualLevel].light}`}>
            <p className="text-[10px] uppercase opacity-70">Residual</p>
            <p className="text-lg font-black">{mapping.residualScore.toFixed(1)}</p>
          </div>
        </div>

        {/* Barra de mitigación */}
        <div>
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Inherente: {mapping.inherentScore}</span>
            <span>Residual: {mapping.residualScore.toFixed(1)}</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${mapping.combinedEffectiveness}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 text-center">
            {mapping.combinedEffectiveness.toFixed(1)}% mitigado
          </p>
        </div>

        {/* Familias cubiertas */}
        {coveredFamilies.length > 0 && (
          <div>
            <p className="text-[10px] text-slate-400 mb-1.5">Familias §6 cubiertas</p>
            <div className="flex flex-wrap gap-1.5">
              {(coveredFamilies as SafeguardFamily[]).map(f => (
                <span key={f} className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-white border border-slate-200 text-slate-600">
                  [{f}]
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vista HEATMAP — Mapa de riesgo 5×5
// ---------------------------------------------------------------------------

function HeatmapView({ mappings, onSelect }: { mappings: Mapping[]; onSelect: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-4 p-6 h-full overflow-y-auto">
      <div>
        <h3 className="text-sm font-bold text-slate-700">Mapa de Riesgo §A4.2</h3>
        <p className="text-xs text-slate-400">Probabilidad × Impacto · Posición antes (●) y después (○) de salvaguardas</p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-[480px]">
          {/* Cabecera eje X */}
          <div className="flex ml-16 mb-1">
            {[1,2,3,4,5].map(p => (
              <div key={p} className="flex-1 text-center">
                <span className="text-[10px] font-bold text-slate-500">{p}</span>
                <p className="text-[9px] text-slate-400 leading-tight">{PROB_LABELS[p]}</p>
              </div>
            ))}
          </div>

          {/* Grid 5×5 (I de 5→1 top to bottom) */}
          {[5,4,3,2,1].map(i => (
            <div key={i} className="flex items-stretch mb-1">
              {/* Etiqueta eje Y */}
              <div className="w-16 shrink-0 flex flex-col justify-center pr-2 text-right">
                <span className="text-[10px] font-bold text-slate-500">{i}</span>
                <span className="text-[9px] text-slate-400 leading-tight">{IMP_LABELS[i]}</span>
              </div>
              {/* Celdas */}
              {[1,2,3,4,5].map(p => {
                const cellMappings = mappings.filter(m => m.probability === p && m.impact === i);
                return (
                  <div
                    key={p}
                    className={`flex-1 min-h-[72px] rounded-lg mr-1 ${heatCellBg(p, i)} flex flex-col items-center justify-center gap-1 p-1 relative`}
                  >
                    <span className="text-[9px] font-mono font-bold text-black/30 absolute top-1 right-1.5">{p*i}</span>
                    {cellMappings.map(m => {
                      const lvl = getRiskLevel(m.residualScore);
                      return (
                        <button
                          key={m.id}
                          onClick={() => onSelect(m.id)}
                          title={`${m.id}: ${MAGERIT_THREATS.find(t=>t.code===m.threatCode)?.name}\nInherente: ${m.inherentScore} | Residual: ${m.residualScore.toFixed(1)} | Eficacia: ${m.combinedEffectiveness.toFixed(0)}%`}
                          className="group flex flex-col items-center"
                        >
                          {/* Dot inherente */}
                          <span className="w-4 h-4 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-[7px] font-bold text-white shadow">
                            ●
                          </span>
                          {/* Dot residual */}
                          <span className={`w-3 h-3 rounded-full border border-white/50 ${LEVEL_COLORS[lvl].bg} -mt-0.5 shadow`} />
                          <span className="text-[8px] font-bold text-white/80 group-hover:text-white leading-none mt-0.5">
                            {m.id.replace('MAP-','')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Eje X label */}
          <div className="flex ml-16 mt-1">
            <p className="flex-1 text-center text-[10px] text-slate-400">← Probabilidad →</p>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex gap-3 flex-wrap text-[11px]">
        {[
          { color: 'bg-red-500',    label: 'Crítico (≥20)' },
          { color: 'bg-orange-400', label: 'Alto (12-19)' },
          { color: 'bg-amber-300',  label: 'Medio (6-11)' },
          { color: 'bg-green-300',  label: 'Bajo (3-5)' },
          { color: 'bg-slate-200',  label: 'Muy bajo (1-2)' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded ${l.color}`} />
            <span className="text-slate-500">{l.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-4">
          <span className="text-slate-400">● Inherente</span>
          <span className="text-slate-400">· Residual</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vista MATRIZ — Cobertura interactiva Mapeo × Familia §6
// ---------------------------------------------------------------------------

function MatrixView({ mappings, onSelect, selectedId }: {
  mappings: Mapping[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  const { addSafeguard } = useMappingStore();
  const [quickAdd, setQuickAdd] = useState<{ mappingId: string; family: SafeguardFamily } | null>(null);
  const [quickCode, setQuickCode] = useState('');
  const [quickEff, setQuickEff] = useState(50);

  function handleCellClick(mappingId: string, family: SafeguardFamily, hasCoverage: boolean) {
    if (hasCoverage) {
      onSelect(mappingId);
    } else {
      setQuickAdd({ mappingId, family });
      setQuickCode('');
      setQuickEff(50);
    }
  }

  function handleQuickAdd() {
    if (!quickAdd || !quickCode) return;
    addSafeguard(quickAdd.mappingId, { code: quickCode, effectiveness: quickEff });
    setQuickAdd(null);
  }

  if (!mappings.length) return (
    <div className="flex items-center justify-center h-full text-sm text-slate-400">
      Crea mapeos para ver la matriz de cobertura.
    </div>
  );

  return (
    <div className="p-6 h-full overflow-auto flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-bold text-slate-700">Matriz de Cobertura</h3>
        <p className="text-xs text-slate-400">Celda cubierta (■) = familia §6 presente. Pulsa celda vacía para añadir.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="text-xs border-collapse min-w-max">
          <thead>
            <tr>
              <th className="text-left px-3 py-2 text-slate-500 font-semibold min-w-[200px]">Mapeo</th>
              <th className="px-3 py-2 text-center text-slate-500 font-semibold min-w-[40px]">P×I</th>
              <th className="px-3 py-2 text-center text-slate-500 font-semibold">Eff.</th>
              {SAFEGUARD_FAMILIES.map(f => (
                <th key={f} className="px-2 py-2 text-center font-mono text-slate-400 min-w-[36px]" title={FAMILY_META[f].label}>
                  {f}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mappings.map(m => {
              const threat = MAGERIT_THREATS.find(t => t.code === m.threatCode);
              const familiesCovered = new Set(
                m.safeguards.map(sg => CATALOG_BY_CODE[sg.code]?.family).filter(Boolean)
              );
              const lvl = getRiskLevel(m.inherentScore);
              const resLvl = getRiskLevel(m.residualScore);
              const isSelected = m.id === selectedId;

              return (
                <tr
                  key={m.id}
                  className={`transition-colors ${isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
                >
                  <td className="px-3 py-2.5">
                    <button onClick={() => onSelect(m.id)} className="text-left">
                      <p className="font-mono text-[10px] text-slate-400">{m.id}</p>
                      <p className="font-medium text-slate-700 leading-snug">
                        [{m.threatCode}] {threat?.name?.slice(0, 30)}{(threat?.name?.length ?? 0) > 30 ? '…' : ''}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{m.assetLabel}</p>
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${LEVEL_COLORS[lvl].light}`}>
                      {m.inherentScore}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`text-xs font-bold ${effColor(m.combinedEffectiveness)}`}>
                      {m.combinedEffectiveness.toFixed(0)}%
                    </span>
                    <br />
                    <span className={`text-[10px] border rounded px-1 ${LEVEL_COLORS[resLvl].light}`}>
                      {m.residualScore.toFixed(1)}
                    </span>
                  </td>
                  {SAFEGUARD_FAMILIES.map(family => {
                    const covered = familiesCovered.has(family);
                    const sgsInFamily = m.safeguards.filter(sg => CATALOG_BY_CODE[sg.code]?.family === family);
                    const avgEff = sgsInFamily.length
                      ? Math.round(sgsInFamily.reduce((s, sg) => s + sg.effectiveness, 0) / sgsInFamily.length)
                      : 0;

                    return (
                      <td key={family} className="px-2 py-2.5 text-center">
                        <button
                          onClick={() => handleCellClick(m.id, family, covered)}
                          title={covered
                            ? `${sgsInFamily.map(s=>s.code).join(', ')} · Eficacia media: ${avgEff}%`
                            : `Añadir salvaguarda [${family}]`}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all ${
                            covered
                              ? 'bg-slate-700 text-white hover:bg-slate-600'
                              : 'bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-500 border border-dashed border-slate-300'
                          }`}
                        >
                          {covered ? (
                            <span className="text-[10px] font-bold">{avgEff}%</span>
                          ) : (
                            <span className="text-[10px]">+</span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quick-add popover */}
      {quickAdd && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-800">
                Añadir salvaguarda [{quickAdd.family}]
              </p>
              <button onClick={() => setQuickAdd(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-slate-400">{FAMILY_META[quickAdd.family].label} · {FAMILY_META[quickAdd.family].section}</p>
            <select
              value={quickCode}
              onChange={e => setQuickCode(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="">— Selecciona salvaguarda —</option>
              {SAFEGUARD_CATALOG.filter(s => s.family === quickAdd.family).map(s => (
                <option key={s.code} value={s.code}>[{s.code}] {s.name}</option>
              ))}
            </select>
            {quickCode && (
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Eficacia: <span className={`font-bold ${effColor(quickEff)}`}>{quickEff}%</span>
                </label>
                <input
                  type="range" min={0} max={100} step={5}
                  value={quickEff}
                  onChange={e => setQuickEff(Number(e.target.value))}
                  className="w-full mt-1 accent-slate-800"
                />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setQuickAdd(null)}
                className="flex-1 py-2 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50">
                Cancelar
              </button>
              <button onClick={handleQuickAdd} disabled={!quickCode}
                className="flex-1 py-2 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 disabled:opacity-40">
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

type ViewMode = 'detail' | 'heatmap' | 'matrix';

export default function MappingsPage() {
  const { mappings, deleteMapping } = useMappingStore();
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [view, setView]               = useState<ViewMode>('detail');
  const [showCreate, setShowCreate]   = useState(false);

  const selected = mappings.find(m => m.id === selectedId) ?? null;

  const totalMappings  = mappings.length;
  const avgEff         = totalMappings ? Math.round(mappings.reduce((s, m) => s + m.combinedEffectiveness, 0) / totalMappings) : 0;
  const unprotected    = mappings.filter(m => m.safeguards.length === 0).length;
  const wellMitigated  = mappings.filter(m => m.combinedEffectiveness >= 75).length;

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Mapeos Amenaza ↔ Salvaguarda</h1>
            <p className="text-sm text-slate-400 mt-0.5">§A4.3 Evaluación de salvaguardas · §A4.4 Estado de riesgo residual</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
              {([
                { id: 'detail',  label: 'Detalle' },
                { id: 'heatmap', label: 'Heatmap' },
                { id: 'matrix',  label: 'Matriz' },
              ] as const).map(v => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    view === v.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear mapeo
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Mapeos',          value: totalMappings, sub: 'total',                     color: 'text-slate-800' },
            { label: 'Sin protección',   value: unprotected,   sub: 'sin salvaguardas',          color: unprotected > 0 ? 'text-red-600' : 'text-slate-400' },
            { label: 'Bien mitigados',   value: wellMitigated, sub: '≥ 75% eficacia',            color: 'text-emerald-600' },
            { label: 'Eficacia media',   value: `${avgEff}%`,  sub: 'eficacia combinada §A4.4', color: effColor(avgEff) },
          ].map(k => (
            <div key={k.label} className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              <p className="text-xs text-slate-400">{k.label}</p>
              <p className={`text-xl font-black ${k.color}`}>{k.value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Body: left list + right panel */}
      <div className="flex-1 flex overflow-hidden">

        {/* Lista de mapeos */}
        <div className="w-72 shrink-0 border-r border-slate-200 bg-white flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {mappings.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
                <p className="text-sm">Sin mapeos.</p>
                <button onClick={() => setShowCreate(true)}
                  className="text-xs underline underline-offset-2 hover:text-slate-600">
                  Crear el primero
                </button>
              </div>
            )}
            {mappings.map(m => {
              const threat = MAGERIT_THREATS.find(t => t.code === m.threatCode);
              const lvl = getRiskLevel(m.inherentScore);
              const resLvl = getRiskLevel(m.residualScore);
              const isActive = m.id === selectedId;

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`rounded-xl border p-3 cursor-pointer transition-all ${
                    isActive
                      ? 'border-slate-300 bg-slate-50 shadow-sm'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="font-mono text-[10px] text-slate-400">{m.id}</p>
                    <button
                      onClick={e => { e.stopPropagation(); if (confirm(`¿Eliminar ${m.id}?`)) deleteMapping(m.id); }}
                      className="p-0.5 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 leading-snug mb-0.5">
                    [{m.threatCode}] {threat?.name?.slice(0, 28)}{(threat?.name?.length ?? 0) > 28 ? '…' : ''}
                  </p>
                  <p className="text-[10px] text-slate-400 mb-2">{m.assetLabel}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${LEVEL_COLORS[lvl].light}`}>
                        {m.inherentScore}
                      </span>
                      <span className="text-[10px] text-slate-300">→</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${LEVEL_COLORS[resLvl].light}`}>
                        {m.residualScore.toFixed(1)}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold ${effColor(m.combinedEffectiveness)}`}>
                      {m.combinedEffectiveness.toFixed(0)}%
                    </span>
                  </div>

                  {/* Mini barra */}
                  <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${m.combinedEffectiveness}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel derecho */}
        <div className="flex-1 overflow-hidden">
          {view === 'heatmap' && (
            <HeatmapView
              mappings={mappings}
              onSelect={id => { setSelectedId(id); setView('detail'); }}
            />
          )}
          {view === 'matrix' && (
            <MatrixView
              mappings={mappings}
              onSelect={id => { setSelectedId(id); }}
              selectedId={selectedId}
            />
          )}
          {view === 'detail' && (
            <div className="h-full overflow-y-auto p-6">
              {selected ? (
                <DetailPanel mapping={selected} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                  <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  <p className="text-sm">
                    {mappings.length === 0
                      ? 'Crea un mapeo para comenzar.'
                      : 'Selecciona un mapeo de la lista.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showCreate && <CreateMappingModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
