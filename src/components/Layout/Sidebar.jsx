import styles from './Sidebar.module.css';

const NAV = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'companies', label: 'Companies' },
  { id: 'processes', label: 'Processes' },
  { id: 'report', label: 'Report' },
];

export default function Sidebar({ activePage, onNavigate, companies, activeCompanyId, onSwitchCompany }) {
  const activeCompany = companies.find(c => c.id === activeCompanyId);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandIcon}>BIA</div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>BIA Manager</span>
          <span className={styles.brandSub}>ISO 22301 Ready</span>
        </div>
      </div>

      <div className={styles.companySection}>
        <p className={styles.sectionLabel}>Active Scope</p>
        <div className={styles.companySelector}>
          <select
            value={activeCompanyId || ''}
            onChange={e => onSwitchCompany(e.target.value || null)}
            className={styles.companySelect}
          >
            <option value="">Corporate View (All)</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        {activeCompany && (
          <div className={styles.companyMeta}>
            <span className={styles.companyType}>{activeCompany.type || 'No type'}</span>
            {activeCompany.location && <span className={styles.companyLoc}>{activeCompany.location}</span>}
          </div>
        )}
        {!activeCompany && (
          <p className={styles.corpNote}>Viewing all {companies.length} compan{companies.length !== 1 ? 'ies' : 'y'}</p>
        )}
      </div>

      <nav className={styles.nav}>
        <p className={styles.sectionLabel}>Navigation</p>
        {NAV.map(item => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activePage === item.id ? styles.active : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
            {item.id === 'companies' && companies.length > 0 && (
              <span className={styles.navBadge}>{companies.length}</span>
            )}
          </button>
        ))}
      </nav>

      <div className={styles.footer}>
        <button
          className={`${styles.helpBtn} ${activePage === 'help' ? styles.helpBtnActive : ''}`}
          onClick={() => onNavigate('help')}
        >
          <span className={styles.helpIcon}>?</span>
          Guía de la aplicación
        </button>
        <p>Business Impact Analysis</p>
        <p>Continuity Planning Tool</p>
      </div>
    </aside>
  );
}
