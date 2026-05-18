/**
 * Modal para registrar un nuevo riesgo MAGERIT.
 * El usuario selecciona amenaza del catálogo §5 y el activo,
 * luego introduce degradación y frecuencia; el cálculo es automático.
 */

import { useState, useRef, useEffect } from 'react';
import { useRiskStore, calcImpact, calcRisk } from '../../store/riskStore';
import { MAGERIT_THREATS, FREQUENCY_VALUES, FREQUENCY_LABELS } from '../../data/threats.data';
import type { ThreatFrequencyLevel, DimensionCode } from '../../types';

interface Props { onClose: () => void; }

const FREQ_LEVELS: ThreatFrequencyLevel[] = ['VR', 'U', 'P', 'VH', 'AC'];

export function AddRiskModal({ onClose }: Props) {
  const { addRisk } = useRiskStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  const [threatCode, setThreatCode] = useState('');
  const [assetId, setAssetId] = useState('');
  const [dimension, setDimension] = useState<DimensionCode>('D');
  const [assetValue, setAssetValue] = useState(5);
  const [degradation, setDegradation] = useState(50);
  const [frequencyLevel, setFrequencyLevel] = useState<ThreatFrequencyLevel>('P');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const selectedThreat = MAGERIT_THREATS.find(t => t.code === threatCode);
  const impact = calcImpact(assetValue, degradation);
  const risk   = calcRisk(impact, frequencyLevel);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!threatCode || !assetId) return;

    const freqVal = FREQUENCY_VALUES[frequencyLevel];
    addRisk({
      threatCode: threatCode as any,
      assetId,
      dimension,
      dimensionRelevanceOrder: selectedThreat?.affectedDimensions.find(d => d.dimension === dimension)?.relevanceOrder ?? 1,
      degradation,
      frequencyLevel,
      calculation: {
        assetValue,
        degradation,
        frequencyLevel,
        frequencyValue: freqVal,
        impact,
        risk,
      },
      residualRisk: {
        inherentRisk: risk,
        combinedEffectiveness: 0,
        residualRisk: risk,
        mappingIds: [],
      },
      status: 'open',
      notes,
    });
    onClose();
  }

  /* Cuando cambia la amenaza, resetear la dimensión al primer valor disponible */
  function handleThreatChange(code: string) {
    setThreatCode(code);
    const t = MAGERIT_THREATS.find(th => th.code === code);
    if (t && t.affectedDimensions.length > 0) {
      setDimension(t.affectedDimensions[0].dimension);
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Registrar riesgo</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">

          {/* Amenaza */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Amenaza MAGERIT §5 *
            </label>
            <select
              value={threatCode}
              onChange={e => handleThreatChange(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="">— Selecciona una amenaza —</option>
              {['N','I','E','A'].map(group => (
                <optgroup key={group} label={`[${group}] ${group === 'N' ? 'Desastres naturales' : group === 'I' ? 'Origen industrial' : group === 'E' ? 'Errores no intencionados' : 'Ataques deliberados'}`}>
                  {MAGERIT_THREATS.filter(t => t.group === group).map(t => (
                    <option key={t.code} value={t.code}>[{t.code}] {t.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {selectedThreat && (
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{selectedThreat.description}</p>
            )}
          </div>

          {/* Activo */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              ID del activo afectado *
            </label>
            <input
              type="text"
              value={assetId}
              onChange={e => setAssetId(e.target.value)}
              required
              placeholder="ej. ACT-001"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          {/* Dimensión */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Dimensión afectada §3
            </label>
            <div className="flex gap-2 flex-wrap">
              {(selectedThreat ? selectedThreat.affectedDimensions.map(d => d.dimension) : ['D','I','C','A','T']).map(dim => (
                <button
                  type="button"
                  key={dim}
                  onClick={() => setDimension(dim as DimensionCode)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    dimension === dim
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  [{dim}]
                </button>
              ))}
            </div>
          </div>

          {/* Valor activo + degradación */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Valor del activo §4.1 <span className="font-mono text-slate-400">(0-10)</span>
              </label>
              <input
                type="number" min={0} max={10} step={1}
                value={assetValue}
                onChange={e => setAssetValue(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Degradación <span className="font-mono text-slate-400">(0-100%)</span>
              </label>
              <input
                type="number" min={0} max={100} step={5}
                value={degradation}
                onChange={e => setDegradation(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
          </div>

          {/* Frecuencia §5.7 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Frecuencia §5.7.1
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {FREQ_LEVELS.map(lvl => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setFrequencyLevel(lvl)}
                  className={`py-2 px-1 rounded-lg text-center transition-all ${
                    frequencyLevel === lvl
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold font-mono">{lvl}</div>
                  <div className="text-[10px] mt-0.5 opacity-70 leading-tight">
                    {FREQUENCY_LABELS[lvl].split(' ')[0]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview de cálculo */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 mb-3">Cálculo automático §A4.2</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-slate-400">Impacto</p>
                <p className="text-lg font-bold text-slate-700">{impact.toFixed(2)}</p>
                <p className="text-[10px] text-slate-400">{assetValue} × {degradation}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Frecuencia</p>
                <p className="text-lg font-bold text-slate-700">× {FREQUENCY_VALUES[frequencyLevel]}</p>
                <p className="text-[10px] text-slate-400">{frequencyLevel}</p>
              </div>
              <div className={`rounded-lg p-2 ${risk >= 8 ? 'bg-red-100' : risk >= 6 ? 'bg-orange-100' : risk >= 3 ? 'bg-yellow-100' : 'bg-green-100'}`}>
                <p className="text-xs text-slate-400">Riesgo</p>
                <p className={`text-lg font-black ${risk >= 8 ? 'text-red-700' : risk >= 6 ? 'text-orange-700' : risk >= 3 ? 'text-yellow-700' : 'text-green-700'}`}>
                  {risk.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notas</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Contexto del riesgo, justificación, etc."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
            >
              Registrar riesgo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
