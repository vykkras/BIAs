/**
 * Modal de detalle de un riesgo MAGERIT.
 * Muestra todos los campos del riesgo, el cálculo completo y permite cambiar estado.
 */

import { useEffect, useRef } from 'react';
import type { Risk } from '../../types';
import { useRiskStore, getCriticality, type CriticalityLevel } from '../../store/riskStore';
import { THREATS_BY_CODE, FREQUENCY_LABELS, GROUP_LABELS } from '../../data/threats.data';
import {
  CriticalityBadge, StatusBadge, ThreatGroupBadge,
  DimensionBadge, FrequencyBadge, RiskValue,
} from './RiskBadges';

interface Props {
  risk: Risk;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { value: 'open',        label: 'Abierto' },
  { value: 'mitigated',   label: 'Mitigado' },
  { value: 'accepted',    label: 'Aceptado' },
  { value: 'transferred', label: 'Transferido' },
];

export function RiskModal({ risk, onClose }: Props) {
  const { updateStatus, deleteRisk } = useRiskStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const threat = THREATS_BY_CODE[risk.threatCode];
  const criticality = getCriticality(risk.calculation.risk) as CriticalityLevel;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  function handleDelete() {
    if (confirm(`¿Eliminar el riesgo ${risk.id}?`)) {
      deleteRisk(risk.id);
      onClose();
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">{risk.id}</span>
              <CriticalityBadge level={criticality} />
              <StatusBadge status={risk.status} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {threat?.name ?? risk.threatCode}
            </h2>
            <ThreatGroupBadge group={threat?.group ?? 'A'} code={risk.threatCode} />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">

          {/* Amenaza */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Amenaza MAGERIT §5
            </h3>
            <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex gap-3">
                <span className="text-xs text-slate-500 w-28 shrink-0">Código</span>
                <span className="font-mono text-sm font-bold text-slate-800">[{risk.threatCode}]</span>
              </div>
              <div className="flex gap-3">
                <span className="text-xs text-slate-500 w-28 shrink-0">Grupo</span>
                <span className="text-sm text-slate-700">{GROUP_LABELS[threat?.group ?? ''] ?? '—'}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-xs text-slate-500 w-28 shrink-0">Descripción</span>
                <span className="text-sm text-slate-700 leading-relaxed">{threat?.description ?? '—'}</span>
              </div>
              {threat?.correlatedCode && (
                <div className="flex gap-3">
                  <span className="text-xs text-slate-500 w-28 shrink-0">Correlación §5.5</span>
                  <span className="font-mono text-xs text-slate-500">[{threat.correlatedCode}]</span>
                </div>
              )}
            </div>
          </section>

          {/* Activo y dimensión */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Activo y dimensión afectada
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Activo afectado</p>
                <p className="text-sm font-semibold text-slate-800 font-mono">{risk.assetId}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Dimensión degradada §3</p>
                <DimensionBadge dimension={risk.dimension} />
              </div>
            </div>
          </section>

          {/* Cálculo §A4.2 */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Cálculo de riesgo — §A4.2
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs text-blue-600 mb-1">Valor del activo (0-10)</p>
                <p className="text-xl font-bold text-blue-800">{risk.calculation.assetValue}</p>
                <p className="text-xs text-blue-500 mt-1">Escala §4.1</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-xs text-amber-600 mb-1">Degradación</p>
                <p className="text-xl font-bold text-amber-800">{risk.degradation}%</p>
                <p className="text-xs text-amber-500 mt-1">Pérdida del valor del activo</p>
              </div>
              <div className="bg-violet-50 rounded-xl p-4">
                <p className="text-xs text-violet-600 mb-1">Frecuencia §5.7</p>
                <FrequencyBadge level={risk.frequencyLevel} />
                <p className="text-xs text-violet-500 mt-1">
                  × {risk.calculation.frequencyValue} anual
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Impacto</p>
                <p className="text-xl font-bold text-slate-800">
                  {risk.calculation.impact.toFixed(2)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  = {risk.calculation.assetValue} × {risk.degradation}%
                </p>
              </div>
            </div>

            {/* Resultados */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className={`rounded-xl p-4 ${
                risk.calculation.risk >= 8 ? 'bg-red-50' :
                risk.calculation.risk >= 6 ? 'bg-orange-50' :
                risk.calculation.risk >= 3 ? 'bg-yellow-50' : 'bg-green-50'
              }`}>
                <p className="text-xs text-slate-500 mb-1">Riesgo inherente</p>
                <p className={`text-2xl font-black ${
                  risk.calculation.risk >= 8 ? 'text-red-700' :
                  risk.calculation.risk >= 6 ? 'text-orange-700' :
                  risk.calculation.risk >= 3 ? 'text-yellow-700' : 'text-green-700'
                }`}>
                  {risk.calculation.risk.toFixed(2)}
                </p>
                <p className="text-xs text-slate-400 mt-1">= Impacto × Frecuencia</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Riesgo residual §A4.4</p>
                <p className="text-2xl font-black text-emerald-700">
                  {risk.residualRisk.residualRisk.toFixed(2)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Efectividad salvaguardas: {risk.residualRisk.combinedEffectiveness}%
                </p>
              </div>
            </div>
          </section>

          {/* Estado */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Estado del tratamiento
            </h3>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateStatus(risk.id, opt.value as Risk['status'])}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    risk.status === opt.value
                      ? 'bg-slate-800 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* Notas */}
          {risk.notes && (
            <section>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notas</h3>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-4 leading-relaxed">{risk.notes}</p>
            </section>
          )}

          {/* Metadata */}
          <section className="flex gap-4 text-xs text-slate-400">
            <span>Creado: {new Date(risk.createdAt).toLocaleString('es-ES')}</span>
            <span>·</span>
            <span>Actualizado: {new Date(risk.updatedAt).toLocaleString('es-ES')}</span>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            Eliminar riesgo
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
