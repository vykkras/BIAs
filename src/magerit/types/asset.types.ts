/**
 * §2 – Tipos de activos
 * MAGERIT v3 Libro II – Catálogo de Elementos, págs. 7-14
 *
 * Jerarquía completa y literal del catálogo. Ningún tipo inventado.
 */

import type { AssetValuation } from './dimension.types';
import type { ValuationCriteria } from './valuation.types';

// ---------------------------------------------------------------------------
// §2.3 [D] Datos / Información — subtipos exactos del catálogo
// ---------------------------------------------------------------------------
export type DataSubtype =
  | 'D.files'    // ficheros
  | 'D.backup'   // copias de respaldo
  | 'D.conf'     // datos de configuración
  | 'D.int'      // datos de gestión interna
  | 'D.password' // credenciales (ej. contraseñas)
  | 'D.auth'     // datos de validación de credenciales
  | 'D.acl'      // datos de control de acceso
  | 'D.log'      // registro de actividad
  | 'D.source'   // código fuente
  | 'D.exe'      // código ejecutable
  | 'D.test';    // datos de prueba

// ---------------------------------------------------------------------------
// §2.4 [K] Claves criptográficas — subtipos exactos del catálogo
// ---------------------------------------------------------------------------
export type KeySubtype =
  | 'K.info.encrypt'           // claves de cifra (información)
  | 'K.info.shared_secret'     // secreto compartido – clave simétrica (información)
  | 'K.info.public_encryption' // clave pública de cifra
  | 'K.info.public_decryption' // clave privada de descifrado
  | 'K.sign.shared_secret'     // secreto compartido – clave simétrica (firma)
  | 'K.sign.public_signature'  // clave privada de firma
  | 'K.sign.public_verification' // clave pública de verificación de firma
  | 'K.com.channel'            // claves de cifrado del canal
  | 'K.com.authentication'     // claves de autenticación
  | 'K.com.verification'       // claves de verificación de autenticación
  | 'K.disk.encrypt'           // cifrado de soportes de información
  | 'K.x509';                  // certificados de clave pública

// ---------------------------------------------------------------------------
// §2.5 [S] Servicios — subtipos exactos del catálogo
// ---------------------------------------------------------------------------
export type ServiceSubtype =
  | 'S.anon'   // anónimo (sin requerir identificación del usuario)
  | 'S.pub'    // al público en general (sin relación contractual)
  | 'S.ext'    // a usuarios externos (bajo relación contractual)
  | 'S.int'    // interno (a usuarios de la propia organización)
  | 'S.www'    // world wide web
  | 'S.telnet' // acceso remoto a cuenta local
  | 'S.email'  // correo electrónico
  | 'S.file'   // almacenamiento de ficheros
  | 'S.ftp'    // transferencia de ficheros
  | 'S.edi'    // intercambio electrónico de datos
  | 'S.dir'    // servicio de directorio
  | 'S.idm'    // gestión de identidades
  | 'S.ipm'    // gestión de privilegios
  | 'S.pki';   // PKI - infraestructura de clave pública

// ---------------------------------------------------------------------------
// §2.6 [SW] Software – Aplicaciones informáticas — subtipos exactos
// ---------------------------------------------------------------------------
export type SoftwareSubtype =
  | 'SW.prp'          // desarrollo propio (in house)
  | 'SW.sub'          // desarrollo a medida (subcontratado)
  | 'SW.std'          // estándar (off the shelf)
  | 'SW.browser'      // navegador web
  | 'SW.www'          // servidor de presentación
  | 'SW.app'          // servidor de aplicaciones
  | 'SW.email_client' // cliente de correo electrónico
  | 'SW.email_server' // servidor de correo electrónico
  | 'SW.file'         // servidor de ficheros
  | 'SW.dbms'         // sistema de gestión de bases de datos
  | 'SW.tm'           // monitor transaccional
  | 'SW.office'       // ofimática
  | 'SW.av'           // anti virus
  | 'SW.os'           // sistema operativo
  | 'SW.hypervisor'   // gestor de máquinas virtuales
  | 'SW.ts'           // servidor de terminales
  | 'SW.backup';      // sistema de backup

// ---------------------------------------------------------------------------
// §2.7 [HW] Equipamiento informático — subtipos exactos
// ---------------------------------------------------------------------------
export type HardwareSubtype =
  | 'HW.host'     // grandes equipos
  | 'HW.mid'      // equipos medios
  | 'HW.pc'       // informática personal
  | 'HW.mobile'   // informática móvil
  | 'HW.pda'      // agendas electrónicas
  | 'HW.vhost'    // equipo virtual
  | 'HW.backup'   // equipamiento de respaldo
  | 'HW.print'    // medios de impresión
  | 'HW.scan'     // escáneres
  | 'HW.crypto'   // dispositivos criptográficos
  | 'HW.bp'       // dispositivo de frontera
  | 'HW.modem'    // módems
  | 'HW.hub'      // concentradores
  | 'HW.switch'   // conmutadores
  | 'HW.router'   // encaminadores
  | 'HW.bridge'   // pasarelas
  | 'HW.firewall' // cortafuegos
  | 'HW.wap'      // punto de acceso inalámbrico
  | 'HW.pabx'     // centralita telefónica
  | 'HW.ipphone'; // teléfono IP

// ---------------------------------------------------------------------------
// §2.8 [COM] Redes de comunicaciones — subtipos exactos
// ---------------------------------------------------------------------------
export type CommsSubtype =
  | 'COM.PSTN'    // red telefónica
  | 'COM.ISDN'    // rdsi (red digital)
  | 'COM.X25'     // X25 (red de datos)
  | 'COM.ADSL'    // ADSL
  | 'COM.pp'      // punto a punto
  | 'COM.radio'   // comunicaciones radio
  | 'COM.wifi'    // red inalámbrica
  | 'COM.mobile'  // telefonía móvil
  | 'COM.sat'     // por satélite
  | 'COM.LAN'     // red local
  | 'COM.MAN'     // red metropolitana
  | 'COM.Internet'; // Internet

// ---------------------------------------------------------------------------
// §2.9 [Media] Soportes de información — subtipos exactos
// ---------------------------------------------------------------------------
export type MediaSubtype =
  | 'Media.disk'          // discos (electrónico)
  | 'Media.vdisk'         // discos virtuales
  | 'Media.san'           // almacenamiento en red
  | 'Media.disquette'     // disquetes
  | 'Media.cd'            // cederrón (CD-ROM)
  | 'Media.usb'           // memorias USB
  | 'Media.dvd'           // DVD
  | 'Media.tape'          // cinta magnética
  | 'Media.mc'            // tarjetas de memoria
  | 'Media.ic'            // tarjetas inteligentes
  | 'Media.printed'       // material impreso (no electrónico)
  | 'Media.paper_tape'    // cinta de papel
  | 'Media.film'          // microfilm
  | 'Media.cards';        // tarjetas perforadas

// ---------------------------------------------------------------------------
// §2.10 [AUX] Equipamiento auxiliar — subtipos exactos
// ---------------------------------------------------------------------------
export type AuxSubtype =
  | 'AUX.power'    // fuentes de alimentación
  | 'AUX.ups'      // sistemas de alimentación ininterrumpida
  | 'AUX.gen'      // generadores eléctricos
  | 'AUX.ac'       // equipos de climatización
  | 'AUX.wire'     // cable eléctrico
  | 'AUX.fiber'    // fibra óptica
  | 'AUX.robot_tape' // robots de cintas
  | 'AUX.robot_disk' // robots de discos
  | 'AUX.supply'   // suministros esenciales
  | 'AUX.destroy'  // equipos de destrucción de soportes
  | 'AUX.furniture' // mobiliario: armarios, etc.
  | 'AUX.safe';    // cajas fuertes

// ---------------------------------------------------------------------------
// §2.11 [L] Instalaciones — subtipos exactos
// ---------------------------------------------------------------------------
export type FacilitySubtype =
  | 'L.site'     // recinto
  | 'L.building' // edificio
  | 'L.local'    // cuarto
  | 'L.car'      // vehículo terrestre
  | 'L.plane'    // vehículo aéreo
  | 'L.ship'     // vehículo marítimo
  | 'L.shelter'  // contenedores
  | 'L.channel'  // canalización
  | 'L.backup';  // instalaciones de respaldo

// ---------------------------------------------------------------------------
// §2.12 [P] Personal — subtipos exactos
// ---------------------------------------------------------------------------
export type PersonnelSubtype =
  | 'P.ue'   // usuarios externos
  | 'P.ui'   // usuarios internos
  | 'P.op'   // operadores
  | 'P.adm'  // administradores de sistemas
  | 'P.com'  // administradores de comunicaciones
  | 'P.dba'  // administradores de BBDD
  | 'P.sec'  // administradores de seguridad
  | 'P.des'  // desarrolladores / programadores
  | 'P.sub'  // subcontratas
  | 'P.prov'; // proveedores

// ---------------------------------------------------------------------------
// Unión de todos los tipos de activos (§2)
// ---------------------------------------------------------------------------

/**
 * Código de tipo principal de activo según §2.
 * Exactamente los diez tipos del catálogo.
 */
export type AssetTypeCode = 'D' | 'K' | 'S' | 'SW' | 'HW' | 'COM' | 'Media' | 'AUX' | 'L' | 'P';

/** Unión de todos los subtipos posibles del catálogo §2 */
export type AssetSubtype =
  | DataSubtype | KeySubtype | ServiceSubtype | SoftwareSubtype
  | HardwareSubtype | CommsSubtype | MediaSubtype | AuxSubtype
  | FacilitySubtype | PersonnelSubtype;

/**
 * Tipo de activo MAGERIT con jerarquía completa (§2).
 * Un activo puede pertenecer simultáneamente a varios tipos (§2, párrafo 4).
 */
export interface AssetType {
  code: AssetTypeCode;
  name: string;
  subtypes: AssetSubtype[];
}

// ---------------------------------------------------------------------------
// Dependencia entre activos (Apéndice A3 – Modelo de valor)
// ---------------------------------------------------------------------------

/**
 * Relación de dependencia entre activos.
 * grado: número real entre 0.0 y 1.0 (§A3.1 – atributo "grado")
 */
export interface AssetDependency {
  /** Código del activo superior (del que depende) */
  superiorAssetId: string;
  /** Código del activo inferior (que depende) */
  inferiorAssetId: string;
  /** Grado de dependencia 0.0 – 1.0 (§A3.1) */
  degree: number;
  /** Justificación de la dependencia */
  reason: string;
}

// ---------------------------------------------------------------------------
// §A2 – Ficha de activo (Apéndice 2, págs. 60-69)
// ---------------------------------------------------------------------------

/**
 * Activo del sistema de información.
 * Estructura derivada de las fichas del Apéndice 2 (A2.1-A2.12).
 * Nota: un activo puede ser simultáneamente de varios tipos (§2, párrafo 4).
 */
export interface Asset {
  /** Código único del activo (§A3.1) */
  id: string;
  /** Nombre descriptivo */
  name: string;
  /** Descripción del activo */
  description: string;
  /** Propietario (responsable de la información) */
  owner: string;
  /** Responsable operativo */
  responsible: string;
  /** Tipo principal de activo según §2 */
  type: AssetTypeCode;
  /** Subtipos del catálogo §2 que aplican (puede ser más de uno) */
  subtypes: AssetSubtype[];
  /** Ubicación física (aplica a HW, COM, Media, AUX, L) */
  location?: string;
  /** Número de unidades (aplica a HW, COM, Media, AUX, L) */
  quantity?: number;
  /**
   * Valoración del activo por dimensión según §3 y §4.
   * Solo se valoran las dimensiones relevantes para el tipo de activo.
   * [info]: I, C, A, T — [service]: D, A, T — resto: todas las aplicables.
   */
  valuation: AssetValuation;
  /** Criterios de valoración aplicados §4.1 */
  valuationCriteria: ValuationCriteria;
  /** Dependencias con otros activos (Apéndice A3) */
  dependencies: AssetDependency[];
  /** Fecha de registro */
  createdAt: string;
  /** Fecha de última actualización */
  updatedAt: string;
}
