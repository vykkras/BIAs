/**
 * Badges de severidad, criticidad, dimensión, grupo de amenaza y estado.
 * Colores por nivel de riesgo basados en la escala §4.1 (0-10).
 */

import type { DimensionCode } from '../../types';
import type { CriticalityLevel } from '../../store/riskStore';
import type { ThreatFrequencyLevel } from '../../types';
import { FREQUENCY_LABELS } from '../../data/threats.data';

// ---------------------------------------------------------------------------
// Criticidad / severidad
// ---------------------------------------------------------------------------

const CRITICALITY_CONFIG: Record<CriticalityLevel, { label: string; classes: string; dot: string }> = {
  CRITICO:  { label: 'Crítico',  classes: 'bg-red-100 text-red-800 ring-red-300',       dot: 'bg-red-500' },
  ALTO:     { label: 'Alto',     classes: 'bg-orange-100 text-orange-800 ring-orange-300', dot: 'bg-orange-500' },
  MEDIO:    { label: 'Medio',    classes: 'bg-yellow-100 text-yellow-800 ring-yellow-300', dot: 'bg-yellow-500' },
  BAJO:     { label: 'Bajo',     classes: 'bg-green-100 text-green-800 ring-green-300',   dot: 'bg-green-500' },
  MUY_BAJO: { label: 'Muy bajo', classes: 'bg-slate-100 text-slate-600 ring-slate-200',   dot: 'bg-slate-400' },
};

interface CriticalityBadgeProps { level: CriticalityLevel; }
export function CriticalityBadge({ level }: CriticalityBadgeProps) {
  const cfg = CRITICALITY_CONFIG[level];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Estado del riesgo
// ---------------------------------------------------------------------------

const STATUS_CONFIG = {
  open:        { label: 'Abierto',     classes: 'bg-red-50 text-red-700 ring-red-200' },
  mitigated:   { label: 'Mitigado',    classes: 'bg-green-50 text-green-700 ring-green-200' },
  accepted:    { label: 'Aceptado',    classes: 'bg-blue-50 text-blue-700 ring-blue-200' },
  transferred: { label: 'Transferido', classes: 'bg-purple-50 text-purple-700 ring-purple-200' },
};

interface StatusBadgeProps { status: string; }
export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.open;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ring-1 ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Grupo de amenaza [N] [I] [E] [A]
// ---------------------------------------------------------------------------

const GROUP_CONFIG = {
  N: { label: 'N', title: 'Desastres naturales',       classes: 'bg-sky-100 text-sky-800 ring-sky-300' },
  I: { label: 'I', title: 'Origen industrial',          classes: 'bg-amber-100 text-amber-800 ring-amber-300' },
  E: { label: 'E', title: 'Errores no intencionados',   classes: 'bg-violet-100 text-violet-800 ring-violet-300' },
  A: { label: 'A', title: 'Ataques deliberados',        classes: 'bg-rose-100 text-rose-800 ring-rose-300' },
};

interface ThreatGroupBadgeProps { group: 'N' | 'I' | 'E' | 'A'; code: string; }
export function ThreatGroupBadge({ group, code }: ThreatGroupBadgeProps) {
  const cfg = GROUP_CONFIG[group];
  return (
    <span
      title={cfg.title}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ring-1 font-mono ${cfg.classes}`}
    >
      [{code}]
    </span>
  );
}

// ---------------------------------------------------------------------------
// Dimensión [D] [I] [C] [A] [T]
// ---------------------------------------------------------------------------

const DIM_CONFIG: Record<DimensionCode, { label: string; classes: string }> = {
  D: { label: 'D · Disponibilidad',  classes: 'bg-blue-100 text-blue-800' },
  I: { label: 'I · Integridad',      classes: 'bg-emerald-100 text-emerald-800' },
  C: { label: 'C · Confidencialidad', classes: 'bg-purple-100 text-purple-800' },
  A: { label: 'A · Autenticidad',    classes: 'bg-orange-100 text-orange-800' },
  T: { label: 'T · Trazabilidad',    classes: 'bg-pink-100 text-pink-800' },
};

interface DimensionBadgeProps { dimension: DimensionCode; compact?: boolean; }
export function DimensionBadge({ dimension, compact }: DimensionBadgeProps) {
  const cfg = DIM_CONFIG[dimension];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cfg.classes}`}>
      {compact ? dimension : cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Frecuencia §5.7.1
// ---------------------------------------------------------------------------

interface FrequencyBadgeProps { level: ThreatFrequencyLevel; }
export function FrequencyBadge({ level }: FrequencyBadgeProps) {
  const colors: Record<ThreatFrequencyLevel, string> = {
    VR: 'bg-slate-100 text-slate-600',
    U:  'bg-blue-50 text-blue-700',
    P:  'bg-yellow-50 text-yellow-700',
    VH: 'bg-orange-50 text-orange-700',
    AC: 'bg-red-50 text-red-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colors[level]}`}>
      <span className="font-mono font-bold">{level}</span>
      <span className="text-xs opacity-70">· {FREQUENCY_LABELS[level]}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Valor de riesgo con color de fondo
// ---------------------------------------------------------------------------

interface RiskValueProps { value: number; label?: string; }
export function RiskValue({ value, label }: RiskValueProps) {
  const color =
    value >= 8 ? 'text-red-700 font-bold' :
    value >= 6 ? 'text-orange-700 font-bold' :
    value >= 3 ? 'text-yellow-700 font-semibold' :
    value >= 1 ? 'text-green-700' :
    'text-slate-400';

  return (
    <span className={`tabular-nums text-sm ${color}`}>
      {value.toFixed(2)}
      {label && <span className="text-xs opacity-60 ml-1">{label}</span>}
    </span>
  );
}
