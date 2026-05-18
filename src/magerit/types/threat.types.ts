/**
 * §5 – Amenazas
 * MAGERIT v3 Libro II – Catálogo de Elementos, págs. 25-52
 *
 * Catálogo completo de amenazas con sus activos afectados y dimensiones degradadas.
 * La numeración NO es consecutiva en grupos [E] y [A]: está alineada para mostrar
 * errores vs ataques deliberados de la misma naturaleza (§5.5 Correlación).
 */

import type { AssetTypeCode } from './asset.types';
import type { DimensionCode } from './dimension.types';

// ---------------------------------------------------------------------------
// §5 – Origen y causa de amenazas (atributos XML tho/thc §5.6.1)
// ---------------------------------------------------------------------------

/**
 * Origen de la amenaza (atributo tho del esquema XML §5.6.1).
 * N=Natural | E=Entorno industrial | H=Humano
 */
export type ThreatOrigin = 'N' | 'E' | 'H';

/**
 * Causa de la amenaza (atributo thc del esquema XML §5.6.1).
 * A=Accidental | D=Deliberada
 */
export type ThreatCause = 'A' | 'D';

/**
 * Grupo/categoría principal de amenaza según §5.
 * Exactamente los cuatro grupos del catálogo.
 */
export type ThreatGroup = 'N' | 'I' | 'E' | 'A';

// ---------------------------------------------------------------------------
// §5.7 – Nivel de amenaza (escala official del catálogo)
// ---------------------------------------------------------------------------

/**
 * Nivel de probabilidad de materialización de una amenaza.
 * Escala oficial del catálogo §5.7.1 (atributo "level"):
 * VR=muy raro | U=improbable | P=posible | VH=probable | AC=prácticamente segura
 */
export type ThreatFrequencyLevel = 'VR' | 'U' | 'P' | 'VH' | 'AC';

// ---------------------------------------------------------------------------
// Códigos oficiales de amenaza (§5.1 – §5.4)
// ---------------------------------------------------------------------------

/** §5.1 Desastres naturales */
export type NaturalThreatCode = 'N.1' | 'N.2' | 'N.*';

/** §5.2 De origen industrial */
export type IndustrialThreatCode =
  | 'I.1' | 'I.2' | 'I.*' | 'I.3' | 'I.4'
  | 'I.5' | 'I.6' | 'I.7' | 'I.8' | 'I.9'
  | 'I.10' | 'I.11';

/** §5.3 Errores y fallos no intencionados (numeración alineada con §5.5) */
export type ErrorThreatCode =
  | 'E.1' | 'E.2' | 'E.3' | 'E.4' | 'E.7'
  | 'E.8' | 'E.9' | 'E.10' | 'E.14' | 'E.15'
  | 'E.18' | 'E.19' | 'E.20' | 'E.21' | 'E.23'
  | 'E.24' | 'E.25' | 'E.28';

/** §5.4 Ataques intencionados (numeración alineada con §5.5) */
export type AttackThreatCode =
  | 'A.3' | 'A.4' | 'A.5' | 'A.6' | 'A.7'
  | 'A.8' | 'A.9' | 'A.10' | 'A.11' | 'A.12'
  | 'A.13' | 'A.14' | 'A.15' | 'A.18' | 'A.19'
  | 'A.22' | 'A.23' | 'A.24' | 'A.25' | 'A.26'
  | 'A.27' | 'A.28' | 'A.29' | 'A.30';

/** Unión de todos los códigos oficiales del catálogo §5 */
export type ThreatCode =
  | NaturalThreatCode
  | IndustrialThreatCode
  | ErrorThreatCode
  | AttackThreatCode;

// ---------------------------------------------------------------------------
// Dimensión afectada con orden de relevancia (§5 – cada ficha de amenaza)
// ---------------------------------------------------------------------------

/**
 * Dimensión afectada por una amenaza, con su posición de relevancia.
 * El catálogo ordena las dimensiones "de más a menos relevante" en cada amenaza.
 */
export interface AffectedDimension {
  dimension: DimensionCode;
  /** Posición de relevancia (1 = más relevante) según el catálogo */
  relevanceOrder: number;
  /** Nota aclaratoria del catálogo cuando aplica, ej. "(trazabilidad)" en A.3 */
  note?: string;
}

// ---------------------------------------------------------------------------
// §5 – Amenaza del catálogo MAGERIT
// ---------------------------------------------------------------------------

/**
 * Amenaza del catálogo MAGERIT v3 §5.
 * Estructura derivada literalmente de las fichas de amenaza (págs. 25-47).
 */
export interface Threat {
  /** Código oficial MAGERIT (ej. "A.11", "E.20", "N.1") */
  code: ThreatCode;
  /** Grupo al que pertenece: N | I | E | A */
  group: ThreatGroup;
  /** Nombre oficial de la amenaza según el catálogo */
  name: string;
  /** Descripción literal del catálogo */
  description: string;
  /**
   * Tipos de activos que pueden verse afectados.
   * Derivado de la sección "Tipos de activos" de cada ficha §5.
   */
  affectedAssetTypes: AssetTypeCode[];
  /**
   * Dimensiones de seguridad que puede degradar, ordenadas de más a menos relevante.
   * Derivado de la sección "Dimensiones" de cada ficha §5.
   */
  affectedDimensions: AffectedDimension[];
  /**
   * Origen de la amenaza (atributo tho §5.6.1).
   * N=Natural | E=Entorno industrial | H=Humano
   * Una amenaza puede tener múltiples orígenes posibles (ej. I.1: E y H).
   */
  origins: ThreatOrigin[];
  /**
   * Causa (atributo thc §5.6.1).
   * A=Accidental | D=Deliberada
   * Una amenaza puede ser tanto accidental como deliberada.
   */
  causes: ThreatCause[];
  /**
   * Código correlacionado §5.5.
   * Los errores [E] y ataques [A] comparten número cuando son la misma
   * amenaza con diferente intencionalidad.
   */
  correlatedCode?: ThreatCode;
}

// ---------------------------------------------------------------------------
// §5.7 – Nivel de amenaza sobre un activo concreto
// ---------------------------------------------------------------------------

/**
 * Nivel de amenaza de una amenaza concreta sobre un tipo de activo concreto.
 * Estructura del elemento <tip> del esquema XML §5.7.1.
 */
export interface ThreatLevel {
  /** Código del tipo de activo */
  assetType: AssetTypeCode;
  /** Código de la amenaza */
  threat: ThreatCode;
  /**
   * Nivel de probabilidad de materialización §5.7.1:
   * VR=muy raro | U=improbable | P=posible | VH=probable | AC=prácticamente segura
   */
  level: ThreatFrequencyLevel;
  description?: string;
}
