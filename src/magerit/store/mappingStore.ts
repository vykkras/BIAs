/**
 * Store de mapeos Amenaza ↔ Salvaguarda (N:M).
 * §A4.3: "eficacia de las salvaguardas en relación al riesgo que afrontan."
 * §A4.4: "riesgo residual: lo que puede pasar tomando en consideración las salvaguardas desplegadas."
 *
 * Fórmulas literales del documento:
 *   Efectividad combinada = 1 − ∏(1 − Eᵢ/100)   [§A4.4]
 *   Riesgo residual = Riesgo_inherente × (1 − Eficacia_combinada/100)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MappingSafeguard {
  code: string;
  effectiveness: number; // 0-100
}

export interface Mapping {
  id: string;
  threatCode: string;   // código §5
  assetLabel: string;   // etiqueta libre del activo
  probability: number;  // 1-5 (frecuencia/probabilidad)
  impact: number;       // 1-5 (impacto)
  safeguards: MappingSafeguard[];
  // Campos derivados — recalculados en cada cambio
  inherentScore: number;         // probability × impact  (1-25)
  combinedEffectiveness: number; // §A4.4: 1 − ∏(1 − Eᵢ/100)  (0-100)
  residualScore: number;         // inherentScore × (1 − combinedEff/100)
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Cálculos §A4.4
// ---------------------------------------------------------------------------

export function calcCombinedEff(safeguards: MappingSafeguard[]): number {
  if (!safeguards.length) return 0;
  const factor = safeguards.reduce((p, s) => p * (1 - s.effectiveness / 100), 1);
  return Math.round((1 - factor) * 1000) / 10; // 1 decimal
}

export function calcResidual(inherentScore: number, combinedEff: number): number {
  return Math.round(inherentScore * (1 - combinedEff / 100) * 100) / 100;
}

function derive(m: Omit<Mapping, 'inherentScore' | 'combinedEffectiveness' | 'residualScore'>): Mapping {
  const inherentScore = m.probability * m.impact;
  const combinedEffectiveness = calcCombinedEff(m.safeguards);
  const residualScore = calcResidual(inherentScore, combinedEffectiveness);
  return { ...m, inherentScore, combinedEffectiveness, residualScore };
}

// ---------------------------------------------------------------------------
// Niveles de riesgo para escala 1-25
// ---------------------------------------------------------------------------

export type RiskLevel = 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO' | 'MUY_BAJO';

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 20) return 'CRITICO';
  if (score >= 12) return 'ALTO';
  if (score >= 6)  return 'MEDIO';
  if (score >= 3)  return 'BAJO';
  return 'MUY_BAJO';
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

let _counter = 1;
function nextId(existing: Mapping[]) {
  if (existing.length) {
    const max = Math.max(...existing.map(m => parseInt(m.id.replace('MAP-', ''), 10)).filter(n => !isNaN(n)));
    _counter = max + 1;
  }
  return `MAP-${String(_counter++).padStart(3, '0')}`;
}

interface MappingStore {
  mappings: Mapping[];
  createMapping: (data: { threatCode: string; assetLabel: string; probability: number; impact: number; notes?: string }) => void;
  deleteMapping: (id: string) => void;
  addSafeguard: (mappingId: string, safeguard: MappingSafeguard) => void;
  removeSafeguard: (mappingId: string, code: string) => void;
  updateEffectiveness: (mappingId: string, code: string, effectiveness: number) => void;
}

export const useMappingStore = create<MappingStore>()(
  persist(
    (set, get) => ({
      mappings: [],

      createMapping({ threatCode, assetLabel, probability, impact, notes }) {
        const now = new Date().toISOString();
        const m = derive({
          id: nextId(get().mappings),
          threatCode, assetLabel, probability, impact,
          safeguards: [],
          notes,
          createdAt: now,
          updatedAt: now,
        });
        set(s => ({ mappings: [...s.mappings, m] }));
      },

      deleteMapping(id) {
        set(s => ({ mappings: s.mappings.filter(m => m.id !== id) }));
      },

      addSafeguard(mappingId, safeguard) {
        set(s => ({
          mappings: s.mappings.map(m => {
            if (m.id !== mappingId) return m;
            const exists = m.safeguards.some(sg => sg.code === safeguard.code);
            if (exists) return m;
            return derive({ ...m, safeguards: [...m.safeguards, safeguard], updatedAt: new Date().toISOString() });
          }),
        }));
      },

      removeSafeguard(mappingId, code) {
        set(s => ({
          mappings: s.mappings.map(m => {
            if (m.id !== mappingId) return m;
            return derive({ ...m, safeguards: m.safeguards.filter(sg => sg.code !== code), updatedAt: new Date().toISOString() });
          }),
        }));
      },

      updateEffectiveness(mappingId, code, effectiveness) {
        set(s => ({
          mappings: s.mappings.map(m => {
            if (m.id !== mappingId) return m;
            return derive({
              ...m,
              safeguards: m.safeguards.map(sg => sg.code === code ? { ...sg, effectiveness } : sg),
              updatedAt: new Date().toISOString(),
            });
          }),
        }));
      },
    }),
    { name: 'magerit-mappings' }
  )
);
