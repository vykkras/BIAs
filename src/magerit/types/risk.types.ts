/**
 * Riesgo – Amenaza materializada sobre un activo
 * Derivado de §5 (amenazas) + §3 (dimensiones) + §4 (valoración)
 * Informes: §A4.2 Mapa de riesgos, §A4.4 Estado de riesgo
 *
 * Fórmulas del catálogo (§A4.2, §A4.4):
 *   Impacto   = Valor_activo[dimensión] × Degradación(%)
 *   Riesgo    = Impacto × Frecuencia
 *   Riesgo_residual = Riesgo × (1 − EfectividadCombinada%)
 */

import type { DimensionCode } from './dimension.types';
import type { ThreatCode, ThreatFrequencyLevel } from './threat.types';

// ---------------------------------------------------------------------------
// Estado del riesgo
// ---------------------------------------------------------------------------

/**
 * Estado de tratamiento del riesgo.
 * Estos estados derivan del ciclo de gestión de riesgos (§6.13 G.RM).
 */
export type RiskStatus =
  | 'open'        // identificado, sin tratar
  | 'mitigated'   // con salvaguardas activas
  | 'accepted'    // aceptado por la dirección
  | 'transferred'; // transferido (ej. seguro, externalización)

// ---------------------------------------------------------------------------
// Cálculo de riesgo (§A4.2, §A4.4)
// ---------------------------------------------------------------------------

/**
 * Resultado del cálculo de riesgo sobre una dimensión concreta.
 * Valores derivados de §4 (escala 0-10) y §5.7 (frecuencia VR/U/P/VH/AC).
 *
 * §A4.4 distingue:
 *  - Impacto/Riesgo acumulado: propagado a través de dependencias
 *  - Impacto/Riesgo repercutido: impacto directo sobre el activo
 */
export interface RiskCalculation {
  /**
   * Valor del activo en la dimensión afectada (escala 0-10, §4.1).
   * Corresponde a la valoración registrada en el activo.
   */
  assetValue: number;
  /**
   * Degradación estimada: porcentaje del valor del activo que se pierde
   * si la amenaza se materializa (0-100).
   * Derivado del análisis de la ficha de amenaza §5.
   */
  degradation: number;
  /**
   * Nivel de frecuencia según la escala oficial del catálogo §5.7.1.
   * VR=muy raro | U=improbable | P=posible | VH=probable | AC=prácticamente segura
   */
  frequencyLevel: ThreatFrequencyLevel;
  /**
   * Valor numérico de la frecuencia anualizada para el cálculo.
   * Mapeado desde frequencyLevel (valor de referencia, no inventado):
   * VR=0.01 | U=0.1 | P=1 | VH=10 | AC=100
   */
  frequencyValue: number;
  /**
   * Impacto = assetValue × (degradation / 100).
   * §A4.4: "impacto repercutido" sobre el activo en la dimensión.
   */
  impact: number;
  /**
   * Riesgo = impact × frequencyValue.
   * §A4.2: "riesgo" del activo frente a la amenaza en la dimensión.
   */
  risk: number;
}

// ---------------------------------------------------------------------------
// Riesgo residual (§A4.4 Estado de riesgo)
// ---------------------------------------------------------------------------

/**
 * Riesgo residual tras aplicar salvaguardas.
 * §A4.4: "Caracterización de los activos por su riesgo residual;
 * es decir lo que puede pasar tomando en consideración las salvaguardas desplegadas."
 */
export interface ResidualRisk {
  /** Riesgo inherente (antes de salvaguardas) */
  inherentRisk: number;
  /**
   * Efectividad combinada de todas las salvaguardas asignadas (0-100%).
   * Calculada a partir de los mapeos riesgo ↔ salvaguarda.
   */
  combinedEffectiveness: number;
  /**
   * Riesgo residual = inherentRisk × (1 − combinedEffectiveness / 100).
   * Definido en §A4.4.
   */
  residualRisk: number;
  /** IDs de los mapeos riesgo↔salvaguarda que producen esta mitigación */
  mappingIds: string[];
}

// ---------------------------------------------------------------------------
// Entidad Riesgo
// ---------------------------------------------------------------------------

/**
 * Riesgo: amenaza materializada sobre un activo en una dimensión.
 * Unidad básica de análisis del mapa de riesgos (§A4.2).
 *
 * Un mismo par (activo, amenaza) puede generar múltiples registros de riesgo
 * si la amenaza afecta a varias dimensiones del activo (§5 – sección "Dimensiones").
 */
export interface Risk {
  /** Identificador interno único */
  id: string;
  /**
   * Código oficial MAGERIT de la amenaza (§5).
   * Ej.: "A.11", "E.20", "N.1"
   */
  threatCode: ThreatCode;
  /** ID del activo afectado */
  assetId: string;
  /**
   * Dimensión de seguridad degradada por esta amenaza sobre este activo (§3).
   * Debe pertenecer a las dimensiones que el catálogo §5 asigna a la amenaza.
   */
  dimension: DimensionCode;
  /**
   * Posición de relevancia de la dimensión para esta amenaza (§5 – "Dimensiones").
   * 1 = más relevante. Permite ordenar riesgos por dimensión afectada principal.
   */
  dimensionRelevanceOrder: number;
  /**
   * Degradación estimada (0-100%).
   * Porcentaje del valor del activo que se pierde si la amenaza se materializa.
   */
  degradation: number;
  /**
   * Nivel de frecuencia según §5.7.1.
   * VR=muy raro | U=improbable | P=posible | VH=probable | AC=prácticamente segura
   */
  frequencyLevel: ThreatFrequencyLevel;
  /** Resultado del cálculo: impacto y riesgo inherente */
  calculation: RiskCalculation;
  /** Riesgo residual tras las salvaguardas aplicadas */
  residualRisk: ResidualRisk;
  /** Estado del tratamiento del riesgo */
  status: RiskStatus;
  /** Notas del analista */
  notes: string;
  /** Fecha de identificación */
  createdAt: string;
  /** Fecha de última revisión */
  updatedAt: string;
}
