/**
 * Mapeo Riesgo ↔ Salvaguarda (N:M)
 * Derivado de §A4.3 (Evaluación de salvaguardas) y §A4.4 (Estado de riesgo)
 *
 * "Evaluación de la eficacia de las salvaguardas existentes en relación
 * al riesgo que afrontan." – §A4.3
 */

import type { DimensionCode } from './dimension.types';

// ---------------------------------------------------------------------------
// Mapeo individual
// ---------------------------------------------------------------------------

/**
 * Asignación de una salvaguarda concreta a un riesgo concreto.
 * Una salvaguarda puede mitigar múltiples riesgos y un riesgo puede ser
 * mitigado por múltiples salvaguardas (relación N:M).
 */
export interface RiskSafeguardMapping {
  /** Identificador interno único del mapeo */
  id: string;
  /** ID del riesgo que se mitiga */
  riskId: string;
  /** ID de la salvaguarda que mitiga */
  safeguardId: string;
  /**
   * Efectividad de esta salvaguarda SOBRE ESTE riesgo específico (0-100%).
   * Puede diferir de la efectividad general de la salvaguarda.
   * §A4.3: "indicación de su eficacia frente a los riesgos a los que se enfrenta."
   */
  effectiveness: number;
  /** Dimensión del riesgo sobre la que actúa esta salvaguarda */
  dimension: DimensionCode;
  /** Notas del analista sobre esta asignación concreta */
  notes: string;
  /** Fecha de creación del mapeo */
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Evaluación de efectividad combinada
// ---------------------------------------------------------------------------

/**
 * Evaluación de la mitigación combinada de múltiples salvaguardas sobre un riesgo.
 * §A4.4: "riesgo residual: lo que puede pasar tomando en consideración
 * las salvaguardas desplegadas."
 *
 * Efectividad combinada: 1 − ∏(1 − Eᵢ/100)   [composición conservadora]
 * Riesgo residual = Riesgo_inherente × (1 − EfectividadCombinada/100)
 */
export interface MitigationEvaluation {
  /** ID del riesgo evaluado */
  riskId: string;
  /** IDs de los mapeos aplicados */
  mappingIds: string[];
  /** Efectividades individuales de cada salvaguarda asignada */
  individualEffectiveness: number[];
  /**
   * Efectividad combinada (0-100%).
   * Calculada como: 1 − ∏(1 − Eᵢ/100)
   * Garantiza que ninguna combinación supere el 100%.
   */
  combinedEffectiveness: number;
  /** Riesgo inherente (antes de salvaguardas) */
  inherentRisk: number;
  /** Riesgo residual resultante */
  residualRisk: number;
}
