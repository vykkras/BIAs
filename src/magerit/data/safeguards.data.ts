/**
 * Catálogo completo de salvaguardas MAGERIT v3 §6.
 * Fuente: Libro II – Catálogo de Elementos, págs. 53-57.
 * 16 familias oficiales, ~80 códigos literales del documento.
 */

import type { SafeguardFamily } from '../types';

export interface SafeguardCatalogEntry {
  code: string;
  family: SafeguardFamily;
  name: string;
  description: string;
}

// ---------------------------------------------------------------------------
// §6.1 – [H] Protecciones generales u horizontales
// ---------------------------------------------------------------------------
const H: SafeguardCatalogEntry[] = [
  { code: 'H.IA',        family: 'H', name: 'Identificación y autenticación',              description: 'Mecanismos para verificar la identidad de usuarios, procesos y dispositivos antes de conceder acceso.' },
  { code: 'H.AC',        family: 'H', name: 'Control de acceso lógico',                   description: 'Restricción del acceso a recursos del sistema conforme al principio de mínimo privilegio.' },
  { code: 'H.ST',        family: 'H', name: 'Segregación de tareas',                      description: 'Distribución de funciones críticas entre distintas personas para evitar la concentración de privilegios.' },
  { code: 'H.IR',        family: 'H', name: 'Gestión de incidencias',                     description: 'Procedimientos para detectar, registrar, clasificar y responder a incidentes de seguridad.' },
  { code: 'H.tools',     family: 'H', name: 'Herramientas de seguridad',                  description: 'Conjunto de herramientas técnicas de apoyo a la seguridad del sistema.' },
  { code: 'H.tools.AV',  family: 'H', name: 'Herramienta contra código dañino',           description: 'Antivirus, antimalware y herramientas de detección y eliminación de código malicioso.' },
  { code: 'H.tools.IDS', family: 'H', name: 'IDS/IPS: Detección / prevención de intrusión', description: 'Sistemas de detección y prevención de intrusiones que monitorizan el tráfico en busca de ataques.' },
  { code: 'H.tools.CC',  family: 'H', name: 'Herramienta de chequeo de configuración',   description: 'Verificación automática de que la configuración del sistema cumple las políticas de seguridad.' },
  { code: 'H.tools.VA',  family: 'H', name: 'Herramienta de análisis de vulnerabilidades', description: 'Escáner de vulnerabilidades conocidas en sistemas, aplicaciones y redes.' },
  { code: 'H.tools.TM',  family: 'H', name: 'Herramienta de monitorización de tráfico',  description: 'Análisis del tráfico de red para detectar anomalías, uso indebido o ataques.' },
  { code: 'H.tools.DLP', family: 'H', name: 'DLP: Monitorización de contenidos',         description: 'Data Loss Prevention: control de la transmisión de información sensible para prevenir fugas.' },
  { code: 'H.tools.LA',  family: 'H', name: 'Herramienta para análisis de logs',          description: 'Correlación y análisis automatizado de registros de actividad del sistema.' },
  { code: 'H.tools.HP',  family: 'H', name: 'Honey net / honey pot',                     description: 'Señuelos que simulan recursos reales para atraer y estudiar el comportamiento de atacantes.' },
  { code: 'H.tools.SFV', family: 'H', name: 'Verificación de las funciones de seguridad', description: 'Comprobación periódica de que los controles de seguridad funcionan según lo previsto.' },
  { code: 'H.VM',        family: 'H', name: 'Gestión de vulnerabilidades',                description: 'Ciclo de identificación, clasificación, remediación y seguimiento de vulnerabilidades del sistema.' },
  { code: 'H.AU',        family: 'H', name: 'Registro y auditoría',                       description: 'Generación, protección y revisión de registros de actividad para garantizar la trazabilidad.' },
];

// ---------------------------------------------------------------------------
// §6.2 – [D] Protección de los datos / información
// ---------------------------------------------------------------------------
const D: SafeguardCatalogEntry[] = [
  { code: 'D.A',  family: 'D', name: 'Copias de seguridad de los datos (backup)', description: 'Procedimientos de copia y restauración de datos para garantizar su disponibilidad ante fallos o pérdidas.' },
  { code: 'D.I',  family: 'D', name: 'Aseguramiento de la integridad',            description: 'Mecanismos (hashes, checksums) que garantizan que la información no ha sido alterada.' },
  { code: 'D.C',  family: 'D', name: 'Cifrado de la información',                 description: 'Cifrado de datos en reposo para proteger la confidencialidad ante accesos no autorizados.' },
  { code: 'D.DS', family: 'D', name: 'Uso de firmas electrónicas',               description: 'Firma digital de documentos e intercambios para garantizar autenticidad e integridad.' },
  { code: 'D.TS', family: 'D', name: 'Uso de servicios de fechado electrónico',  description: 'Time stamping: acreditación del momento exacto de creación o modificación de documentos.' },
];

// ---------------------------------------------------------------------------
// §6.3 – [K] Protección de las claves criptográficas
// ---------------------------------------------------------------------------
const K: SafeguardCatalogEntry[] = [
  { code: 'K.IC',    family: 'K', name: 'Gestión de claves de cifra de información',     description: 'Ciclo de vida completo de las claves utilizadas para cifrado de datos: generación, distribución, renovación y destrucción.' },
  { code: 'K.DS',    family: 'K', name: 'Gestión de claves de firma de información',     description: 'Gestión de claves privadas utilizadas en firma digital, incluyendo custodia y revocación.' },
  { code: 'K.disk',  family: 'K', name: 'Gestión de claves para contenedores criptográficos', description: 'Administración de claves que protegen volúmenes cifrados, discos y contenedores de almacenamiento.' },
  { code: 'K.comms', family: 'K', name: 'Gestión de claves de comunicaciones',           description: 'Claves para el establecimiento de canales seguros (TLS, VPN, SSH), su renovación y revocación.' },
  { code: 'K.509',   family: 'K', name: 'Gestión de certificados',                      description: 'Infraestructura de certificados X.509: emisión, renovación, revocación y validación.' },
];

// ---------------------------------------------------------------------------
// §6.4 – [S] Protección de los servicios
// ---------------------------------------------------------------------------
const S: SafeguardCatalogEntry[] = [
  { code: 'S.A',     family: 'S', name: 'Aseguramiento de la disponibilidad',          description: 'Medidas de alta disponibilidad, redundancia y balanceo de carga para garantizar la continuidad del servicio.' },
  { code: 'S.start', family: 'S', name: 'Aceptación y puesta en operación',            description: 'Procedimiento formal de aceptación antes de poner un servicio en producción, con pruebas de seguridad.' },
  { code: 'S.SC',    family: 'S', name: 'Se aplican perfiles de seguridad',            description: 'Configuración del servicio conforme a un perfil de seguridad (hardening) definido y aprobado.' },
  { code: 'S.op',    family: 'S', name: 'Explotación',                                description: 'Procedimientos operativos de seguridad durante el funcionamiento normal del servicio.' },
  { code: 'S.CM',    family: 'S', name: 'Gestión de cambios',                         description: 'Control formal de modificaciones al servicio para garantizar que no se degradan los niveles de seguridad.' },
  { code: 'S.end',   family: 'S', name: 'Terminación',                                description: 'Proceso seguro de retirada del servicio, incluyendo depuración de datos y revocación de accesos.' },
  { code: 'S.www',   family: 'S', name: 'Protección de servicios y aplicaciones web',  description: 'Controles específicos para servicios web: WAF, validación de entrada, gestión de sesiones seguras.' },
  { code: 'S.email', family: 'S', name: 'Protección del correo electrónico',           description: 'Filtrado antispam, antiphishing, cifrado en tránsito y firma de mensajes de correo electrónico.' },
  { code: 'S.dir',   family: 'S', name: 'Protección del directorio',                  description: 'Aseguramiento del servicio de directorio (LDAP/AD): control de acceso, auditoría y replicación segura.' },
  { code: 'S.dns',   family: 'S', name: 'Protección del DNS',                         description: 'Seguridad del servidor de nombres de dominio: DNSSEC, control de transferencias de zona, monitorización.' },
  { code: 'S.TW',    family: 'S', name: 'Teletrabajo',                                description: 'Medidas para garantizar la seguridad en el acceso remoto y el trabajo fuera de las instalaciones.' },
  { code: 'S.voip',  family: 'S', name: 'Voz sobre IP',                               description: 'Controles de seguridad específicos para servicios de voz sobre IP: autenticación, cifrado y disponibilidad.' },
];

// ---------------------------------------------------------------------------
// §6.5 – [SW] Protección de las aplicaciones (software)
// ---------------------------------------------------------------------------
const SW: SafeguardCatalogEntry[] = [
  { code: 'SW.A',     family: 'SW', name: 'Copias de seguridad (backup)',       description: 'Copias periódicas del software y su configuración para permitir la restauración ante incidentes.' },
  { code: 'SW.start', family: 'SW', name: 'Puesta en producción',              description: 'Procedimiento de validación de seguridad antes del despliegue de aplicaciones en el entorno de producción.' },
  { code: 'SW.SC',    family: 'SW', name: 'Se aplican perfiles de seguridad',  description: 'Configuración de la aplicación conforme a un perfil de hardening y principio de mínima funcionalidad.' },
  { code: 'SW.op',    family: 'SW', name: 'Explotación / Producción',          description: 'Procedimientos y controles de seguridad durante la operación normal de las aplicaciones.' },
  { code: 'SW.CM',    family: 'SW', name: 'Cambios (actualizaciones y mantenimiento)', description: 'Gestión segura de parches, actualizaciones y modificaciones de las aplicaciones.' },
  { code: 'SW.end',   family: 'SW', name: 'Terminación',                       description: 'Proceso seguro de retirada de una aplicación: borrado de datos, revocación de credenciales y documentación.' },
];

// ---------------------------------------------------------------------------
// §6.6 – [HW] Protección de los equipos (hardware)
// ---------------------------------------------------------------------------
const HW: SafeguardCatalogEntry[] = [
  { code: 'HW.start', family: 'HW', name: 'Puesta en producción',               description: 'Procedimiento de recepción, verificación y configuración segura antes de poner equipos en servicio.' },
  { code: 'HW.SC',    family: 'HW', name: 'Se aplican perfiles de seguridad',   description: 'Configuración del hardware conforme a perfiles de seguridad: BIOS/UEFI, puertos, servicios deshabilitados.' },
  { code: 'HW.A',     family: 'HW', name: 'Aseguramiento de la disponibilidad', description: 'Redundancia, SAI, mantenimiento preventivo y acuerdos de nivel de servicio para garantizar la continuidad.' },
  { code: 'HW.op',    family: 'HW', name: 'Operación',                          description: 'Procedimientos de operación segura de los equipos: acceso físico, inventario y supervisión.' },
  { code: 'HW.CM',    family: 'HW', name: 'Cambios (actualizaciones y mantenimiento)', description: 'Control de modificaciones físicas o de firmware en los equipos para mantener el nivel de seguridad.' },
  { code: 'HW.end',   family: 'HW', name: 'Terminación',                        description: 'Proceso seguro de baja de equipos: borrado certificado de datos y trazabilidad de la destrucción.' },
  { code: 'HW.PCD',   family: 'HW', name: 'Informática móvil',                  description: 'Medidas de seguridad para portátiles, tablets y dispositivos móviles: cifrado, borrado remoto, MDM.' },
  { code: 'HW.print', family: 'HW', name: 'Reproducción de documentos',         description: 'Control de impresoras, fotocopiadoras y dispositivos de reproducción para evitar fugas de información.' },
  { code: 'HW.pabx',  family: 'HW', name: 'Protección de la centralita telefónica (PABX)', description: 'Aseguramiento de la centralita: control de acceso, registro de llamadas y protección frente a fraude telefónico.' },
];

// ---------------------------------------------------------------------------
// §6.7 – [COM] Protección de las comunicaciones
// ---------------------------------------------------------------------------
const COM: SafeguardCatalogEntry[] = [
  { code: 'COM.start',    family: 'COM', name: 'Entrada en servicio',                    description: 'Procedimiento de aceptación y pruebas de seguridad antes de activar una red o enlace de comunicaciones.' },
  { code: 'COM.SC',       family: 'COM', name: 'Se aplican perfiles de seguridad',       description: 'Configuración de red conforme a perfiles de hardening: protocolos seguros, puertos, servicios.' },
  { code: 'COM.A',        family: 'COM', name: 'Aseguramiento de la disponibilidad',     description: 'Redundancia de enlaces, balanceo y acuerdos de nivel de servicio para garantizar la continuidad.' },
  { code: 'COM.aut',      family: 'COM', name: 'Autenticación del canal',               description: 'Verificación de la identidad de los extremos de la comunicación antes del intercambio de datos.' },
  { code: 'COM.I',        family: 'COM', name: 'Protección de la integridad de los datos intercambiados', description: 'Mecanismos (HMAC, firmas) que garantizan que los datos no han sido modificados en tránsito.' },
  { code: 'COM.C',        family: 'COM', name: 'Protección criptográfica de la confidencialidad', description: 'Cifrado de las comunicaciones (TLS, VPN, IPSec) para proteger el contenido en tránsito.' },
  { code: 'COM.op',       family: 'COM', name: 'Operación',                             description: 'Procedimientos y controles durante la operación normal de la red: monitorización, respuesta a incidentes.' },
  { code: 'COM.CM',       family: 'COM', name: 'Cambios (actualizaciones y mantenimiento)', description: 'Gestión segura de modificaciones en la infraestructura de red y sus componentes.' },
  { code: 'COM.end',      family: 'COM', name: 'Terminación',                           description: 'Proceso seguro de baja de un servicio o enlace de comunicaciones.' },
  { code: 'COM.internet', family: 'COM', name: 'Internet: uso de y acceso a',           description: 'Política de uso de Internet, filtrado de contenidos y protección del perímetro frente a amenazas externas.' },
  { code: 'COM.wifi',     family: 'COM', name: 'Seguridad Wireless (WiFi)',              description: 'Controles específicos para redes inalámbricas: WPA3, redes segregadas, detección de puntos de acceso falsos.' },
  { code: 'COM.mobile',   family: 'COM', name: 'Telefonía móvil',                       description: 'Seguridad en el uso de redes móviles para comunicaciones corporativas: cifrado y autenticación.' },
  { code: 'COM.DS',       family: 'COM', name: 'Segregación de las redes en dominios',  description: 'Segmentación de la red en zonas de confianza para contener la propagación de amenazas.' },
];

// ---------------------------------------------------------------------------
// §6.8 – [IP] Protección en los puntos de interconexión
// ---------------------------------------------------------------------------
const IP: SafeguardCatalogEntry[] = [
  { code: 'IP.SPP', family: 'IP', name: 'Sistema de protección perimetral', description: 'Firewall, proxy y otras medidas de defensa en el perímetro entre redes de distinta confianza.' },
  { code: 'IP.BS',  family: 'IP', name: 'Protección de los equipos de frontera', description: 'Aseguramiento de routers, firewalls y demás dispositivos en el punto de interconexión con redes externas.' },
];

// ---------------------------------------------------------------------------
// §6.9 – [MP] Protección de los soportes de información
// ---------------------------------------------------------------------------
const MP: SafeguardCatalogEntry[] = [
  { code: 'MP.A',     family: 'MP', name: 'Aseguramiento de la disponibilidad', description: 'Control del inventario, almacenamiento adecuado y redundancia de los soportes de información.' },
  { code: 'MP.IC',    family: 'MP', name: 'Protección criptográfica del contenido', description: 'Cifrado del contenido de los soportes para proteger la información en caso de robo o extravío.' },
  { code: 'MP.clean', family: 'MP', name: 'Limpieza de contenidos',             description: 'Borrado seguro de información en soportes antes de su reutilización, cesión o baja.' },
  { code: 'MP.end',   family: 'MP', name: 'Destrucción de soportes',            description: 'Destrucción física certificada de soportes que contienen información sensible al final de su vida útil.' },
];

// ---------------------------------------------------------------------------
// §6.10 – [AUX] Protección de los elementos auxiliares
// ---------------------------------------------------------------------------
const AUX: SafeguardCatalogEntry[] = [
  { code: 'AUX.A',      family: 'AUX', name: 'Aseguramiento de la disponibilidad', description: 'Mantenimiento preventivo y redundancia de equipamiento auxiliar (SAI, climatización, etc.).' },
  { code: 'AUX.start',  family: 'AUX', name: 'Instalación',                       description: 'Procedimiento formal de recepción y configuración segura de elementos auxiliares antes de su puesta en servicio.' },
  { code: 'AUX.power',  family: 'AUX', name: 'Suministro eléctrico',              description: 'SAI, generadores y acometidas redundantes para garantizar el suministro eléctrico ininterrumpido.' },
  { code: 'AUX.AC',     family: 'AUX', name: 'Climatización',                     description: 'Control de temperatura y humedad en las instalaciones para garantizar el funcionamiento correcto de los equipos.' },
  { code: 'AUX.wires',  family: 'AUX', name: 'Protección del cableado',           description: 'Protección física del cableado estructurado frente a accesos no autorizados, interferencias y daños.' },
];

// ---------------------------------------------------------------------------
// §6.11 – [L] Seguridad física – Protección de las instalaciones
// ---------------------------------------------------------------------------
const L: SafeguardCatalogEntry[] = [
  { code: 'L.design', family: 'L', name: 'Diseño',                      description: 'Diseño de las instalaciones incorporando principios de seguridad física desde la fase de construcción o reforma.' },
  { code: 'L.depth',  family: 'L', name: 'Defensa en profundidad',      description: 'Múltiples perímetros de seguridad física que limitan el impacto de la vulneración de una capa de control.' },
  { code: 'L.AC',     family: 'L', name: 'Control de los accesos físicos', description: 'Tornos, tarjetas de acceso, biometría y registro de entradas/salidas en zonas restringidas.' },
  { code: 'L.A',      family: 'L', name: 'Aseguramiento de la disponibilidad', description: 'Medidas contra incendio, inundación y otras amenazas que puedan inutilizar las instalaciones.' },
  { code: 'L.end',    family: 'L', name: 'Terminación',                  description: 'Proceso seguro de cierre o traslado de instalaciones: desinstalación y borrado de datos residuales.' },
];

// ---------------------------------------------------------------------------
// §6.12 – [PS] Salvaguardas relativas al personal
// ---------------------------------------------------------------------------
const PS: SafeguardCatalogEntry[] = [
  { code: 'PS.AT', family: 'PS', name: 'Formación y concienciación',           description: 'Programas de formación y sensibilización en seguridad de la información para todo el personal.' },
  { code: 'PS.A',  family: 'PS', name: 'Aseguramiento de la disponibilidad',   description: 'Políticas de gestión del personal para garantizar la continuidad del servicio: suplencias, documentación de funciones.' },
];

// ---------------------------------------------------------------------------
// §6.13 – [G] Salvaguardas de tipo organizativo
// ---------------------------------------------------------------------------
const G: SafeguardCatalogEntry[] = [
  { code: 'G.RM',   family: 'G', name: 'Gestión de riesgos',               description: 'Marco y procesos formales para identificar, analizar, evaluar y tratar los riesgos de seguridad.' },
  { code: 'G.plan', family: 'G', name: 'Planificación de la seguridad',     description: 'Políticas de seguridad, planes anuales y hoja de ruta para la mejora continua.' },
  { code: 'G.exam', family: 'G', name: 'Inspecciones de seguridad',         description: 'Auditorías, revisiones y pruebas periódicas de la eficacia de los controles implantados.' },
];

// ---------------------------------------------------------------------------
// §6.14 – [BC] Continuidad de operaciones
// ---------------------------------------------------------------------------
const BC: SafeguardCatalogEntry[] = [
  { code: 'BC.BIA', family: 'BC', name: 'Análisis de impacto (BIA)',              description: 'Evaluación del impacto en el negocio de la interrupción de cada proceso o servicio crítico.' },
  { code: 'BC.DRP', family: 'BC', name: 'Plan de Recuperación de Desastres (DRP)', description: 'Procedimientos de recuperación ante catástrofes que garanticen la vuelta a la operación dentro de los RTO/RPO definidos.' },
];

// ---------------------------------------------------------------------------
// §6.15 – [E] Externalización
// ---------------------------------------------------------------------------
const E: SafeguardCatalogEntry[] = [
  { code: 'E.1', family: 'E', name: 'Acuerdos para intercambio de información y software', description: 'Contratos y acuerdos que regulan la seguridad en el intercambio de información y código con terceros.' },
  { code: 'E.2', family: 'E', name: 'Acceso externo',                          description: 'Control y supervisión del acceso de terceros a los sistemas, con autenticación fuerte y registro de actividad.' },
  { code: 'E.3', family: 'E', name: 'Servicios proporcionados por otras organizaciones', description: 'SLA, NDA y auditoría de proveedores externos de servicios TI, cloud o seguridad.' },
  { code: 'E.4', family: 'E', name: 'Personal subcontratado',                  description: 'Cláusulas contractuales, supervisión y gestión de accesos para personal subcontratado o temporal.' },
];

// ---------------------------------------------------------------------------
// §6.16 – [NEW] Adquisición y desarrollo
// ---------------------------------------------------------------------------
const NEW: SafeguardCatalogEntry[] = [
  { code: 'NEW.S',   family: 'NEW', name: 'Servicios: Adquisición o desarrollo',        description: 'Requisitos de seguridad en los pliegos y contratos de adquisición o desarrollo de servicios TI.' },
  { code: 'NEW.SW',  family: 'NEW', name: 'Aplicaciones: Adquisición o desarrollo',     description: 'Inclusión de requisitos de seguridad en el ciclo de vida del software: análisis, diseño, pruebas y mantenimiento.' },
  { code: 'NEW.HW',  family: 'NEW', name: 'Equipos: Adquisición o desarrollo',          description: 'Verificación de la cadena de suministro y requisitos de seguridad en la adquisición de hardware.' },
  { code: 'NEW.COM', family: 'NEW', name: 'Comunicaciones: Adquisición o contratación', description: 'Requisitos de seguridad en la contratación de servicios de telecomunicaciones y conectividad.' },
  { code: 'NEW.MP',  family: 'NEW', name: 'Soportes de Información: Adquisición',       description: 'Criterios de seguridad en la adquisición de soportes: procedencia, cifrado de fábrica, garantías.' },
  { code: 'NEW.C',   family: 'NEW', name: 'Productos certificados o acreditados',       description: 'Preferencia o requisito de uso de productos con certificaciones de seguridad reconocidas (Common Criteria, etc.).' },
];

// ---------------------------------------------------------------------------
// Catálogo completo
// ---------------------------------------------------------------------------

export const SAFEGUARD_CATALOG: SafeguardCatalogEntry[] = [
  ...H, ...D, ...K, ...S, ...SW, ...HW, ...COM, ...IP, ...MP, ...AUX,
  ...L, ...PS, ...G, ...BC, ...E, ...NEW,
];

export const CATALOG_BY_CODE: Record<string, SafeguardCatalogEntry> =
  Object.fromEntries(SAFEGUARD_CATALOG.map(s => [s.code, s]));

// ---------------------------------------------------------------------------
// Metadatos de familias (§6.1 – §6.16)
// ---------------------------------------------------------------------------

export const FAMILY_META: Record<SafeguardFamily, { section: string; label: string; category: string }> = {
  H:   { section: '§6.1',  label: 'Protecciones generales u horizontales',     category: 'protecciones-generales' },
  D:   { section: '§6.2',  label: 'Protección de los datos / información',     category: 'proteccion-datos' },
  K:   { section: '§6.3',  label: 'Protección de las claves criptográficas',   category: 'proteccion-datos' },
  S:   { section: '§6.4',  label: 'Protección de los servicios',               category: 'protecciones-generales' },
  SW:  { section: '§6.5',  label: 'Protección de las aplicaciones (software)', category: 'protecciones-generales' },
  HW:  { section: '§6.6',  label: 'Protección de los equipos (hardware)',      category: 'protecciones-generales' },
  COM: { section: '§6.7',  label: 'Protección de las comunicaciones',          category: 'proteccion-comunicaciones' },
  IP:  { section: '§6.8',  label: 'Protección en puntos de interconexión',     category: 'proteccion-comunicaciones' },
  MP:  { section: '§6.9',  label: 'Protección de los soportes de información', category: 'proteccion-datos' },
  AUX: { section: '§6.10', label: 'Protección de los elementos auxiliares',    category: 'proteccion-fisica' },
  L:   { section: '§6.11', label: 'Protección de las instalaciones',           category: 'proteccion-fisica' },
  PS:  { section: '§6.12', label: 'Salvaguardas relativas al personal',        category: 'personal' },
  G:   { section: '§6.13', label: 'Salvaguardas de tipo organizativo',         category: 'organizativas' },
  BC:  { section: '§6.14', label: 'Continuidad de operaciones',                category: 'continuidad' },
  E:   { section: '§6.15', label: 'Externalización',                           category: 'externalizacion' },
  NEW: { section: '§6.16', label: 'Adquisición y desarrollo',                  category: 'adquisicion-desarrollo' },
};

export const SAFEGUARD_FAMILIES: SafeguardFamily[] = [
  'H', 'D', 'K', 'S', 'SW', 'HW', 'COM', 'IP', 'MP', 'AUX', 'L', 'PS', 'G', 'BC', 'E', 'NEW',
];

export const STATUS_LABELS: Record<string, string> = {
  implemented:    'Implantada',
  partial:        'Parcial',
  planned:        'Planificada',
  not_applicable: 'No aplica',
  missing:        'Insuficiente',
};
