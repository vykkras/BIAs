/**
 * Modal de alta / edición de una salvaguarda MAGERIT §6.
 * El analista elige el código del catálogo §6 y completa:
 * dimensiones protegidas, amenazas mitigadas, eficacia, coste y estado.
 */

import { useState, useEffect, useRef } from 'react';
import { useSafeguardStore } from '../../store/safeguardStore';
import {
  SAFEGUARD_CATALOG, CATALOG_BY_CODE,
  SAFEGUARD_FAMILIES, FAMILY_META, STATUS_LABELS,
} from '../../data/safeguards.data';
import { MAGERIT_THREATS, GROUP_LABELS } from '../../data/threats.data';
import type { Safeguard, SafeguardStatus, DimensionCode } from '../../types';

const DIMENSIONS: DimensionCode[] = ['D', 'I', 'C', 'A', 'T'];
const DIM_FULL: Record<DimensionCode, string> = {
  D: 'Disponibilidad', I: 'Integridad', C: 'Confidencialidad',
  A: 'Autenticidad',   T: 'Trazabilidad',
};
const STATUS_OPTS = Object.keys(STATUS_LABELS) as SafeguardStatus[];

interface Props {
  existing?: Safeguard;
  onClose: () => void;
}

export function SafeguardModal({ existing, onClose }: Props) {
  const { addSafeguard, updateSafeguard } = useSafeguardStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const isEdit = !!existing;

  const [catalogCode, setCatalogCode]   = useState(existing?.code ?? '');
  const [description, setDescription]   = useState(existing?.description ?? '');
  const [dimensions, setDimensions]     = useState<DimensionCode[]>(existing?.dimensionsProtected ?? []);
  const [threats, setThreats]           = useState<string[]>(existing?.threatsMitigated ?? []);
  const [effectiveness, setEffectiveness] = useState(existing?.effectiveness ?? 50);
  const [cost, setCost]                 = useState<string>(existing?.cost != null ? String(existing.cost) : '');
  const [status, setStatus]             = useState<SafeguardStatus>(existing?.status ?? 'planned');
  const [notes, setNotes]               = useState(existing?.notes ?? '');
  const [threatSearch, setThreatSearch] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (catalogCode && !isEdit) {
      setDescription(CATALOG_BY_CODE[catalogCode]?.description ?? '');
    }
  }, [catalogCode, isEdit]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  function toggleDimension(d: DimensionCode) {
    setDimensions(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  }

  function toggleThreat(code: string) {
    setThreats(prev =>
      prev.includes(code) ? prev.filter(x => x !== code) : [...prev, code]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!catalogCode) return;

    const entry = CATALOG_BY_CODE[catalogCode];
    const costNum = cost.trim() !== '' ? Number(cost) : undefined;

    const payload = {
      code: catalogCode as Safeguard['code'],
      family: entry?.family ?? ('H' as Safeguard['family']),
      name: entry?.name ?? catalogCode,
      description,
      protectsAssetTypes: [],
      dimensionsProtected: dimensions,
      threatsMitigated: threats as Safeguard['threatsMitigated'],
      effectiveness,
      cost: costNum,
      status,
      notes,
    };

    if (isEdit && existing) {
      updateSafeguard(existing.id, payload);
    } else {
      addSafeguard(payload);
    }
    onClose();
  }

  const filteredThreats = MAGERIT_THREATS.filter(t => {
    if (!threatSearch) return true;
    const q = threatSearch.toLowerCase();
    return t.code.toLowerCase().includes(q) || t.name.toLowerCase().includes(q);
  });

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEdit ? 'Editar salvaguarda' : 'Registrar salvaguarda'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">MAGERIT §6 · §A4.3</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-7 py-6">

          {/* Código del catálogo §6 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Salvaguarda del catálogo §6 *
            </label>
            <select
              value={catalogCode}
              onChange={e => setCatalogCode(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="">— Selecciona una salvaguarda —</option>
              {SAFEGUARD_FAMILIES.map(fam => {
                const entries = SAFEGUARD_CATALOG.filter(s => s.family === fam);
                return (
                  <optgroup key={fam} label={`[${fam}] ${FAMILY_META[fam].label} ${FAMILY_META[fam].section}`}>
                    {entries.map(s => (
                      <option key={s.code} value={s.code}>[{s.code}] {s.name}</option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
            {catalogCode && (
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                {CATALOG_BY_CODE[catalogCode]?.description}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Descripción / contexto de implantación
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalla cómo se implanta esta salvaguarda en la organización…"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          {/* Dimensiones protegidas §3 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Dimensiones protegidas §3
            </label>
            <div className="flex gap-2 flex-wrap">
              {DIMENSIONS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDimension(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    dimensions.includes(d)
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  [{d}] {DIM_FULL[d]}
                </button>
              ))}
            </div>
          </div>

          {/* Amenazas mitigadas §5 (M:N) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Amenazas mitigadas §5
              {threats.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-bold">
                  {threats.length} seleccionadas
                </span>
              )}
            </label>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                <input
                  type="text"
                  placeholder="Filtrar amenazas…"
                  value={threatSearch}
                  onChange={e => setThreatSearch(e.target.value)}
                  className="w-full bg-transparent text-sm focus:outline-none placeholder-slate-400"
                />
              </div>
              <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                {(['N', 'I', 'E', 'A'] as const).map(group => {
                  const groupThreats = filteredThreats.filter(t => t.group === group);
                  if (!groupThreats.length) return null;
                  return (
                    <div key={group}>
                      <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 sticky top-0">
                        [{group}] {GROUP_LABELS[group]}
                      </p>
                      {groupThreats.map(t => (
                        <label
                          key={t.code}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={threats.includes(t.code)}
                            onChange={() => toggleThreat(t.code)}
                            className="rounded border-slate-300 accent-slate-800"
                          />
                          <span className="font-mono text-xs text-slate-400 w-12 shrink-0">[{t.code}]</span>
                          <span className="text-sm text-slate-700 leading-tight">{t.name}</span>
                        </label>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Eficacia + Coste */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Eficacia §A4.3
                <span className="ml-2 font-mono text-slate-400">{effectiveness}%</span>
              </label>
              <input
                type="range"
                min={0} max={100} step={5}
                value={effectiveness}
                onChange={e => setEffectiveness(Number(e.target.value))}
                className="w-full accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-300 mt-0.5">
                <span>0%</span><span>50%</span><span>100%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Coste estimado <span className="font-normal text-slate-400">(€, opcional)</span>
              </label>
              <input
                type="number"
                min={0}
                step={100}
                value={cost}
                onChange={e => setCost(e.target.value)}
                placeholder="ej. 5000"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
          </div>

          {/* Estado §A4.3 / §A4.5 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Estado de implantación — §A4.3 / §A4.5
            </label>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                    status === s
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Notas</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Observaciones, responsable, fecha de revisión…"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors"
            >
              {isEdit ? 'Guardar cambios' : 'Registrar salvaguarda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
