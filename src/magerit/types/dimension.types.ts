/**
 * §3 – Dimensiones de valoración
 * MAGERIT v3 Libro II – Catálogo de Elementos, págs. 15-17
 *
 * Son las características o atributos que hacen valioso un activo.
 * Se utilizan para valorar las consecuencias de la materialización de una amenaza.
 */

/** §3.1-3.5 – Los cinco códigos oficiales. No existen otros en el catálogo. */
export type DimensionCode = 'D' | 'I' | 'C' | 'A' | 'T';

/** Estructura de una dimensión de valoración según §3 */
export interface Dimension {
  /** Código oficial MAGERIT */
  code: DimensionCode;
  /** Nombre oficial del catálogo */
  name: string;
  /** Definición literal del catálogo */
  definition: string;
  /** Pregunta guía del catálogo para valorar el activo en esta dimensión */
  guidingQuestion: string;
}

/**
 * Valoración de un activo en una dimensión concreta.
 * §4.1 – escala 0-10 con criterio justificado.
 */
export interface DimensionValue {
  dimension: DimensionCode;
  /** Valor en escala 0-10 (§4.1) */
  value: number;
  /** Justificación mediante código de criterio §4.1, p.ej. "9.cei.a" */
  justification: string;
}

/** Mapa completo de valoración de un activo por sus cinco dimensiones */
export type AssetValuation = Partial<Record<DimensionCode, DimensionValue>>;
