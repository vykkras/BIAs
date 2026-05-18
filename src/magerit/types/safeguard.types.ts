/**
 * §6 – Salvaguardas
 * MAGERIT v3 Libro II – Catálogo de Elementos, págs. 53-57
 *
 * Jerarquía completa y literal: 16 familias, IDs exactos del catálogo.
 * "Las salvaguardas permiten hacer frente a las amenazas." (§6, párrafo 1)
 */

import type { AssetTypeCode } from './asset.types';
import type { DimensionCode } from './dimension.types';
import type { ThreatCode } from './threat.types';

// ---------------------------------------------------------------------------
// §6 – Familias (16 familias oficiales del catálogo)
// ---------------------------------------------------------------------------

/**
 * Familia de salvaguarda según §6.
 * Exactamente las 16 familias del catálogo, sin añadir ni eliminar.
 */
export type SafeguardFamily =
  | 'H'    // §6.1  Protecciones generales u horizontales
  | 'D'    // §6.2  Protección de los datos / información
  | 'K'    // §6.3  Protección de las claves criptográficas
  | 'S'    // §6.4  Protección de los servicios
  | 'SW'   // §6.5  Protección de las aplicaciones (software)
  | 'HW'   // §6.6  Protección de los equipos (hardware)
  | 'COM'  // §6.7  Protección de las comunicaciones
  | 'IP'   // §6.8  Protección en los puntos de interconexión
  | 'MP'   // §6.9  Protección de los soportes de información
  | 'AUX'  // §6.10 Protección de los elementos auxiliares
  | 'L'    // §6.11 Seguridad física – Protección de las instalaciones
  | 'PS'   // §6.12 Salvaguardas relativas al personal
  | 'G'    // §6.13 Salvaguardas de tipo organizativo
  | 'BC'   // §6.14 Continuidad de operaciones
  | 'E'    // §6.15 Externalización
  | 'NEW'; // §6.16 Adquisición y desarrollo

// ---------------------------------------------------------------------------
// Códigos oficiales de salvaguarda por familia (§6.1 – §6.16)
// ---------------------------------------------------------------------------

/** §6.1 Protecciones generales u horizontales */
export type GeneralSafeguardCode =
  | 'H.IA' | 'H.AC' | 'H.ST' | 'H.IR'
  | 'H.tools' | 'H.tools.AV' | 'H.tools.IDS' | 'H.tools.CC'
  | 'H.tools.VA' | 'H.tools.TM' | 'H.tools.DLP' | 'H.tools.LA'
  | 'H.tools.HP' | 'H.tools.SFV'
  | 'H.VM' | 'H.AU';

/** §6.2 Protección de datos */
export type DataSafeguardCode = 'D.A' | 'D.I' | 'D.C' | 'D.DS' | 'D.TS';

/** §6.3 Claves criptográficas */
export type KeySafeguardCode = 'K.IC' | 'K.DS' | 'K.disk' | 'K.comms' | 'K.509';

/** §6.4 Servicios */
export type ServiceSafeguardCode =
  | 'S.A' | 'S.start' | 'S.SC' | 'S.op' | 'S.CM' | 'S.end'
  | 'S.www' | 'S.email' | 'S.dir' | 'S.dns' | 'S.TW' | 'S.voip';

/** §6.5 Software */
export type SoftwareSafeguardCode = 'SW.A' | 'SW.start' | 'SW.SC' | 'SW.op' | 'SW.CM' | 'SW.end';

/** §6.6 Hardware */
export type HardwareSafeguardCode =
  | 'HW.start' | 'HW.SC' | 'HW.A' | 'HW.op' | 'HW.CM' | 'HW.end'
  | 'HW.PCD' | 'HW.print' | 'HW.pabx';

/** §6.7 Comunicaciones */
export type CommsSafeguardCode =
  | 'COM.start' | 'COM.SC' | 'COM.A' | 'COM.aut' | 'COM.I' | 'COM.C'
  | 'COM.op' | 'COM.CM' | 'COM.end'
  | 'COM.internet' | 'COM.wifi' | 'COM.mobile' | 'COM.DS';

/** §6.8 Puntos de interconexión */
export type InterconnectionSafeguardCode = 'IP.SPP' | 'IP.BS';

/** §6.9 Soportes de información */
export type MediaSafeguardCode = 'MP.A' | 'MP.IC' | 'MP.clean' | 'MP.end';

/** §6.10 Elementos auxiliares */
export type AuxSafeguardCode = 'AUX.A' | 'AUX.start' | 'AUX.power' | 'AUX.AC' | 'AUX.wires';

/** §6.11 Instalaciones */
export type FacilitySafeguardCode = 'L.design' | 'L.depth' | 'L.AC' | 'L.A' | 'L.end';

/** §6.12 Personal */
export type PersonnelSafeguardCode = 'PS.AT' | 'PS.A';

/** §6.13 Organización */
export type OrgSafeguardCode = 'G.RM' | 'G.plan' | 'G.exam';

/** §6.14 Continuidad de operaciones */
export type ContinuitySafeguardCode = 'BC.BIA' | 'BC.DRP';

/** §6.15 Externalización */
export type ExternalSafeguardCode = 'E.1' | 'E.2' | 'E.3' | 'E.4';

/** §6.16 Adquisición y desarrollo */
export type AcquisitionSafeguardCode = 'NEW.S' | 'NEW.SW' | 'NEW.HW' | 'NEW.COM' | 'NEW.MP' | 'NEW.C';

/** Unión de todos los códigos de salvaguarda del catálogo §6 */
export type SafeguardCode =
  | GeneralSafeguardCode | DataSafeguardCode | KeySafeguardCode
  | ServiceSafeguardCode | SoftwareSafeguardCode | HardwareSafeguardCode
  | CommsSafeguardCode | InterconnectionSafeguardCode | MediaSafeguardCode
  | AuxSafeguardCode | FacilitySafeguardCode | PersonnelSafeguardCode
  | OrgSafeguardCode | ContinuitySafeguardCode | ExternalSafeguardCode
  | AcquisitionSafeguardCode;

// ---------------------------------------------------------------------------
// Entidad Salvaguarda
// ---------------------------------------------------------------------------

/**
 * Salvaguarda del catálogo MAGERIT v3 §6.
 * Puede ser una del catálogo o una instancia concreta implantada en la organización.
 */
export interface Safeguard {
  /** ID interno único del registro */
  id: string;
  /**
   * Código oficial MAGERIT de la salvaguarda (§6).
   * Ej.: "H.AC", "D.A", "COM.C"
   */
  code: SafeguardCode;
  /**
   * Familia de la salvaguarda según §6.
   * Derivada automáticamente del prefijo del código.
   */
  family: SafeguardFamily;
  /** Nombre oficial del catálogo §6 */
  name: string;
  /** Descripción del catálogo y detalles de implementación */
  description: string;
  /**
   * Tipos de activos que protege.
   * Derivado de la familia: ej. familia 'D' → activos tipo 'D'.
   * Puede proteger activos de varios tipos (ej. 'H' protege todos).
   */
  protectsAssetTypes: AssetTypeCode[];
  /**
   * Dimensiones de seguridad que refuerza (§3).
   * Definidas por el analista según la naturaleza de la salvaguarda.
   */
  dimensionsProtected: DimensionCode[];
  /**
   * Amenazas del catálogo §5 que esta salvaguarda ayuda a mitigar.
   * Definidas por el analista según correspondencia amenaza-salvaguarda.
   */
  threatsMitigated: ThreatCode[];
  /**
   * Efectividad de la salvaguarda (0-100%).
   * §A4.3: "evaluación de la eficacia de las salvaguardas existentes
   * en relación al riesgo que afrontan."
   */
  effectiveness: number;
  /** Estado de implantación */
  status: SafeguardStatus;
  /** Coste estimado de implantación (opcional, en €) */
  cost?: number;
  /** Notas del analista */
  notes: string;
  /** Fecha de registro */
  createdAt: string;
  /** Fecha de última actualización */
  updatedAt: string;
}

/**
 * Estado de implantación de la salvaguarda.
 * Basado en §A4.3 y §A4.5 (informe de insuficiencias).
 */
export type SafeguardStatus =
  | 'implemented'    // implantada y operativa
  | 'partial'        // implantada parcialmente
  | 'planned'        // planificada (plan de seguridad §A4.6)
  | 'not_applicable' // no aplica al contexto
  | 'missing';       // identificada como necesaria pero no implantada (§A4.5)
