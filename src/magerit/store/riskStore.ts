/**
 * Store Zustand para la gestión de riesgos MAGERIT
 * Cálculos: §A4.2 Mapa de riesgos, §A4.4 Estado de riesgo
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Risk, RiskStatus, ThreatFrequencyLevel } from '../types';
import { FREQUENCY_VALUES } from '../data/threats.data';

// ---------------------------------------------------------------------------
// Helpers de cálculo (§A4.2, §A4.4)
// ---------------------------------------------------------------------------

export function calcImpact(assetValue: number, degradation: number): number {
  return parseFloat((assetValue * (degradation / 100)).toFixed(2));
}

export function calcRisk(impact: number, frequencyLevel: ThreatFrequencyLevel): number {
  return parseFloat((impact * FREQUENCY_VALUES[frequencyLevel]).toFixed(2));
}

export function calcResidualRisk(risk: number, combinedEffectiveness: number): number {
  return parseFloat((risk * (1 - combinedEffectiveness / 100)).toFixed(2));
}

/** Efectividad combinada: 1 − ∏(1 − Eᵢ/100) */
export function combinedEffectiveness(effectivenesses: number[]): number {
  if (effectivenesses.length === 0) return 0;
  const combined = 1 - effectivenesses.reduce((acc, e) => acc * (1 - e / 100), 1);
  return parseFloat((combined * 100).toFixed(2));
}

/** Nivel de criticidad basado en el valor de riesgo (escala 0-10, §4.1) */
export type CriticalityLevel = 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO' | 'MUY_BAJO';

export function getCriticality(risk: number): CriticalityLevel {
  if (risk >= 8)  return 'CRITICO';
  if (risk >= 6)  return 'ALTO';
  if (risk >= 3)  return 'MEDIO';
  if (risk >= 1)  return 'BAJO';
  return 'MUY_BAJO';
}

// ---------------------------------------------------------------------------
// Estado del store
// ---------------------------------------------------------------------------

interface RiskStore {
  risks: Risk[];

  addRisk: (risk: Omit<Risk, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRisk: (id: string, patch: Partial<Risk>) => void;
  deleteRisk: (id: string) => void;
  updateStatus: (id: string, status: RiskStatus) => void;
}

function uid(): string {
  return `RSK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function buildRisk(data: Omit<Risk, 'id' | 'createdAt' | 'updatedAt'>): Risk {
  const now = new Date().toISOString();
  return { ...data, id: uid(), createdAt: now, updatedAt: now };
}

export const useRiskStore = create<RiskStore>()(
  persist(
    (set) => ({
      risks: [],

      addRisk: (data) =>
        set((s) => ({ risks: [...s.risks, buildRisk(data)] })),

      updateRisk: (id, patch) =>
        set((s) => ({
          risks: s.risks.map((r) =>
            r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r
          ),
        })),

      deleteRisk: (id) =>
        set((s) => ({ risks: s.risks.filter((r) => r.id !== id) })),

      updateStatus: (id, status) =>
        set((s) => ({
          risks: s.risks.map((r) =>
            r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
          ),
        })),
    }),
    { name: 'magerit-risks' }
  )
);
