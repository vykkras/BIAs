/**
 * §4 – Criterios de valoración
 * MAGERIT v3 Libro II – Catálogo de Elementos, págs. 19-24
 *
 * Guían la valoración homogénea de activos en escala 0-10.
 * Escala: 10 extremo | 9 muy alto | 6-8 alto | 3-5 medio | 1-2 bajo | 0 despreciable
 */

/**
 * Códigos oficiales de criterios de valoración según §4.1.
 * Exactamente los trece criterios del catálogo, sin añadir ni eliminar.
 */
export type ValuationCriterionCode =
  | 'pi'      // Información de carácter personal
  | 'lpo'     // Obligaciones legales
  | 'si'      // Seguridad
  | 'cei'     // Intereses comerciales o económicos
  | 'da'      // Interrupción del servicio
  | 'po'      // Orden público
  | 'olm'     // Operaciones
  | 'adm'     // Administración y gestión
  | 'lg'      // Pérdida de confianza (reputación)
  | 'crm'     // Persecución de delitos
  | 'rto'     // Tiempo de recuperación del servicio
  | 'lbl.nat' // Información clasificada (nacional)
  | 'lbl.ue'; // Información clasificada (Unión Europea)

/** Escala simplificada §4.1 */
export type ValuationScale =
  | 10  // extremo – daño extremadamente grave
  | 9   // muy alto – daño muy grave
  | 8   // alto
  | 7   // alto
  | 6   // alto – daño grave
  | 5   // medio
  | 4   // medio
  | 3   // medio – daño importante
  | 2   // bajo
  | 1   // bajo – daño menor
  | 0;  // despreciable – irrelevante a efectos prácticos

/**
 * Un criterio de valoración aplicado, con su código MAGERIT (p.ej. "9.cei.a")
 * y el valor numérico que le corresponde en la escala §4.1.
 */
export interface AppliedCriterion {
  /** Código del criterio §4.1, p.ej. "7.da", "9.lg.a", "5.pi1" */
  criterionCode: string;
  /** Tipo de criterio al que pertenece */
  type: ValuationCriterionCode;
  /** Valor numérico en escala 0-10 */
  value: ValuationScale;
  /** Texto descriptivo tal como aparece en el catálogo */
  description: string;
}

/**
 * Valoración completa de un activo con todos sus criterios justificativos.
 * El valor final de cada dimensión = max(valores de criterios aplicables).
 */
export interface ValuationCriteria {
  /** Criterios aplicados en la valoración de este activo */
  appliedCriteria: AppliedCriterion[];
}
