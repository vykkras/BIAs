import styles from './HelpModal.module.css';

const RISK_LEVELS = [
  { level: 'Low', range: '1 – 4', color: '#16a34a', bg: '#dcfce7', desc: 'Impacto menor. Proceso recuperable con recursos normales.' },
  { level: 'Medium', range: '5 – 8', color: '#d97706', bg: '#fef3c7', desc: 'Impacto moderado. Requiere plan de contingencia.' },
  { level: 'High', range: '9 – 12', color: '#ea580c', bg: '#ffedd5', desc: 'Impacto significativo. Prioridad alta de recuperación.' },
  { level: 'Critical', range: '13 – 20', color: '#dc2626', bg: '#fee2e2', desc: 'Impacto severo. Amenaza la continuidad del negocio.' },
];

const IMPACT_CATS = [
  { name: 'Financiero', desc: 'Pérdidas económicas directas, multas, costos de recuperación.' },
  { name: 'Operacional', desc: 'Interrupción de operaciones, productividad, cadena de suministro.' },
  { name: 'Legal', desc: 'Incumplimiento regulatorio, sanciones, litigios.' },
  { name: 'Reputacional', desc: 'Daño a la imagen de marca, pérdida de clientes o confianza.' },
];

const TIME_PERIODS = [
  { label: '0 – 4 horas', key: 'h4', desc: 'Impacto inmediato. ¿Qué falla primero?' },
  { label: '24 horas', key: 'h24', desc: 'Primer día completo de interrupción.' },
  { label: '3 días', key: 'd3', desc: 'Impacto a corto plazo sostenido.' },
  { label: '1 semana', key: 'w1', desc: 'Impacto prolongado en operaciones.' },
];

const GLOSSARY = [
  { term: 'BIA', def: 'Business Impact Analysis — análisis que identifica los efectos de una interrupción en los procesos críticos del negocio.' },
  { term: 'ISO 22301', def: 'Norma internacional de Sistemas de Gestión de Continuidad de Negocio (SGCN). Define requisitos para planificar, establecer, implementar y operar la continuidad.' },
  { term: 'RTO', def: 'Recovery Time Objective — tiempo máximo tolerable para restaurar un proceso tras una interrupción. Ej: "4 horas".' },
  { term: 'RPO', def: 'Recovery Point Objective — punto en el tiempo al que deben restaurarse los datos. Define la pérdida máxima de datos aceptable. Ej: "1 hora".' },
  { term: 'MTD', def: 'Maximum Tolerable Downtime — tiempo máximo que el negocio puede sobrevivir sin el proceso antes de sufrir daño irreversible.' },
  { term: 'Likelihood', def: 'Probabilidad de ocurrencia del fallo, en escala 1–5 (1 = muy improbable, 5 = muy probable).' },
];

export default function HelpModal({ onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>?</div>
            <div>
              <h2 className={styles.title}>Guía de BIA Manager</h2>
              <p className={styles.subtitle}>Todo lo que necesitas saber sobre la aplicación</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>

          {/* Qué es */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>¿Qué es esta aplicación?</h3>
            <p className={styles.text}>
              <strong>BIA Manager</strong> es una herramienta de <strong>Análisis de Impacto al Negocio</strong> (Business Impact Analysis) alineada con la norma <strong>ISO 22301</strong>. Permite documentar los procesos críticos de una o varias empresas, evaluar qué tan riesgosos son si fallan, y generar reportes profesionales para auditorías o planes de continuidad.
            </p>
            <div className={styles.flowRow}>
              <div className={styles.flowBox}>Empresas</div>
              <div className={styles.flowArrow}>→</div>
              <div className={styles.flowBox}>Procesos</div>
              <div className={styles.flowArrow}>→</div>
              <div className={styles.flowBox}>Score de Riesgo</div>
              <div className={styles.flowArrow}>→</div>
              <div className={styles.flowBox}>Reporte PDF / Excel</div>
            </div>
          </section>

          {/* Cálculo de Riesgo */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Cálculo del Score de Riesgo</h3>
            <p className={styles.text}>Cada proceso recibe un <strong>Risk Score</strong> calculado con dos factores:</p>

            <div className={styles.formulaBox}>
              <div className={styles.formulaRow}>
                <span className={styles.formulaLabel}>Paso 1</span>
                <span className={styles.formula}>
                  Impact Score = <span className={styles.highlight}>MAX</span>(Financiero, Operacional, Legal, Reputacional)
                </span>
              </div>
              <div className={styles.formulaDivider} />
              <div className={styles.formulaRow}>
                <span className={styles.formulaLabel}>Paso 2</span>
                <span className={styles.formula}>
                  Risk Score = Impact Score × <span className={styles.highlight}>Likelihood</span>
                </span>
              </div>
              <div className={styles.formulaDivider} />
              <div className={styles.formulaRow}>
                <span className={styles.formulaLabel}>Rango</span>
                <span className={styles.formula}>
                  Mínimo: <strong>1</strong> (impacto Low × likelihood 1) &nbsp;|&nbsp; Máximo: <strong>20</strong> (impacto Critical × likelihood 5)
                </span>
              </div>
            </div>

            <div className={styles.scaleRow}>
              <div className={styles.scaleLabel}>Escala de impacto:</div>
              {['Low = 1', 'Medium = 2', 'High = 3', 'Critical = 4'].map((l, i) => (
                <span key={i} className={styles.scaleChip}>{l}</span>
              ))}
            </div>
            <div className={styles.scaleRow}>
              <div className={styles.scaleLabel}>Likelihood:</div>
              {['1 = Muy improbable', '2 = Improbable', '3 = Posible', '4 = Probable', '5 = Muy probable'].map((l, i) => (
                <span key={i} className={styles.scaleChip}>{l}</span>
              ))}
            </div>

            <div className={styles.exampleBox}>
              <strong>Ejemplo:</strong> Un proceso con impacto Financiero=High (3), Operacional=Critical (4), Legal=Medium (2), Reputacional=Low (1), y Likelihood=4.<br />
              Impact Score = MAX(3, 4, 2, 1) = <strong>4</strong> &nbsp;→&nbsp; Risk Score = 4 × 4 = <strong>16 → Critical</strong>
            </div>

            <div className={styles.levelsGrid}>
              {RISK_LEVELS.map(r => (
                <div key={r.level} className={styles.levelCard} style={{ background: r.bg }}>
                  <div className={styles.levelHeader}>
                    <span className={styles.levelBadge} style={{ background: r.color }}>{r.level}</span>
                    <span className={styles.levelRange} style={{ color: r.color }}>Score {r.range}</span>
                  </div>
                  <p className={styles.levelDesc}>{r.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Categorías de impacto */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>4 Categorías de Impacto</h3>
            <p className={styles.text}>Cada proceso se evalúa en cuatro dimensiones. El score final usa el <strong>máximo</strong> de las cuatro — el peor caso manda.</p>
            <div className={styles.catsGrid}>
              {IMPACT_CATS.map(c => (
                <div key={c.name} className={styles.catCard}>
                  <div className={styles.catName}>{c.name}</div>
                  <p className={styles.catDesc}>{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Impacto temporal */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Análisis de Impacto Temporal</h3>
            <p className={styles.text}>Se evalúa cómo evoluciona el daño cuanto más tiempo dure la interrupción. Para cada horizonte de tiempo se define una severidad y una descripción del impacto.</p>
            <div className={styles.timeGrid}>
              {TIME_PERIODS.map(t => (
                <div key={t.key} className={styles.timeCard}>
                  <div className={styles.timeLabel}>{t.label}</div>
                  <p className={styles.timeDesc}>{t.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Métricas de recuperación */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Métricas de Recuperación</h3>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricAcro}>RTO</div>
                <div className={styles.metricName}>Recovery Time Objective</div>
                <p className={styles.metricDesc}>¿En cuánto tiempo debe restaurarse el proceso? Define el objetivo de velocidad de recuperación.</p>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricAcro}>RPO</div>
                <div className={styles.metricName}>Recovery Point Objective</div>
                <p className={styles.metricDesc}>¿Hasta qué punto en el tiempo deben recuperarse los datos? Define la pérdida máxima de información aceptable.</p>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricAcro}>MTD</div>
                <div className={styles.metricName}>Maximum Tolerable Downtime</div>
                <p className={styles.metricDesc}>¿Cuánto tiempo puede estar caído el proceso antes de causar daño irreversible al negocio?</p>
              </div>
            </div>
          </section>

          {/* Dependencias */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Dependencias del Proceso</h3>
            <p className={styles.text}>Cada proceso documenta qué necesita para funcionar, en cuatro categorías:</p>
            <div className={styles.depsGrid}>
              {[
                { name: 'Sistemas IT', desc: 'Software, servidores, plataformas tecnológicas necesarias.' },
                { name: 'Personas Clave', desc: 'Empleados o roles sin los cuales el proceso no puede ejecutarse.' },
                { name: 'Proveedores Externos', desc: 'Vendors o servicios externos de los que depende el proceso.' },
                { name: 'Terceros', desc: 'Otros actores externos relevantes (reguladores, socios, etc.).' },
              ].map(d => (
                <div key={d.name} className={styles.depCard}>
                  <div className={styles.depName}>{d.name}</div>
                  <p className={styles.depDesc}>{d.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Exportación */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Exportación de Reportes</h3>
            <div className={styles.exportRow}>
              <div className={styles.exportCard}>
                <div className={styles.exportIcon} style={{ background: '#16a34a' }}>XLS</div>
                <div>
                  <div className={styles.exportName}>Excel</div>
                  <p className={styles.exportDesc}>Dos hojas: resumen BIA con todos los procesos y métricas, más una hoja detallada de dependencias.</p>
                </div>
              </div>
              <div className={styles.exportCard}>
                <div className={styles.exportIcon} style={{ background: '#dc2626' }}>PDF</div>
                <div>
                  <div className={styles.exportName}>PDF</div>
                  <p className={styles.exportDesc}>Documento A4 landscape con tabla resumen coloreada por nivel de riesgo y análisis detallado por proceso.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Glosario */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Glosario</h3>
            <div className={styles.glossary}>
              {GLOSSARY.map(g => (
                <div key={g.term} className={styles.glossaryRow}>
                  <span className={styles.glossaryTerm}>{g.term}</span>
                  <span className={styles.glossaryDef}>{g.def}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
