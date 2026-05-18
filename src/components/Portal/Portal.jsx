import styles from './Portal.module.css'

const TOOLS = [
  {
    id: 'bia',
    icon: '📋',
    name: 'BIA Manager',
    desc: 'Business Impact Analysis — procesos, RTOs, reportes y exportación.',
  },
  {
    id: 'magerit',
    icon: '🛡️',
    name: 'MAGERIT Risk Analysis',
    desc: 'Análisis de riesgos MAGERIT v3 — amenazas §5, salvaguardas §6, mapeos.',
    href: '/magerit.html',
  },
]

export default function Portal({ onSelect }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.logo}>⚙</div>
        <h1 className={styles.title}>Team Tools</h1>
        <p className={styles.subtitle}>Selecciona una herramienta para comenzar</p>
      </div>

      <div className={styles.grid}>
        {TOOLS.map(tool =>
          tool.href ? (
            <a key={tool.id} href={tool.href} className={styles.card}>
              <span className={styles.cardIcon}>{tool.icon}</span>
              <span className={styles.cardName}>{tool.name}</span>
              <span className={styles.cardDesc}>{tool.desc}</span>
            </a>
          ) : (
            <button key={tool.id} className={styles.card} onClick={() => onSelect(tool.id)}>
              <span className={styles.cardIcon}>{tool.icon}</span>
              <span className={styles.cardName}>{tool.name}</span>
              <span className={styles.cardDesc}>{tool.desc}</span>
            </button>
          )
        )}
      </div>
    </div>
  )
}
