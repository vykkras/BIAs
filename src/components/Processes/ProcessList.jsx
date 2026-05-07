import { useState } from 'react';
import { getRiskColor, getRiskBg } from '../../utils/scoring';
import styles from './ProcessList.module.css';

const RISK_LEVELS = ['All', 'Low', 'Medium', 'High', 'Critical'];

export default function ProcessList({ processes, companies, activeCompanyId, onNew, onEdit, onDelete }) {
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('All');
  const [sortField, setSortField] = useState('riskScore');
  const [sortDir, setSortDir] = useState('desc');

  const isCorporate = !activeCompanyId;

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  }

  const filtered = processes
    .filter(p => {
      const q = search.toLowerCase();
      return !q || [p.name, p.department, p.owner].some(s => s?.toLowerCase().includes(q));
    })
    .filter(p => filterRisk === 'All' || p.riskLevel === filterRisk)
    .sort((a, b) => {
      let av = a[sortField] ?? '', bv = b[sortField] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ field }) => (
    <span className={styles.sortIcon}>{sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
  );

  const companyMap = Object.fromEntries(companies.map(c => [c.id, c]));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Business Processes</h1>
          <p className={styles.subtitle}>
            {isCorporate ? `All companies · ` : ''}{processes.length} process{processes.length !== 1 ? 'es' : ''}
          </p>
        </div>
        {(!isCorporate || companies.length > 0) && (
          <button className={styles.btnPrimary} onClick={onNew}>+ Add Process</button>
        )}
      </div>

      {isCorporate && companies.length === 0 && (
        <div className={styles.corpNotice}>
          Select a company from the sidebar to manage its processes, or add companies first.
        </div>
      )}

      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="Search by name, department, or owner..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={styles.filters}>
          {RISK_LEVELS.map(l => (
            <button
              key={l}
              className={`${styles.filterBtn} ${filterRisk === l ? styles.filterActive : ''}`}
              style={filterRisk === l && l !== 'All' ? { background: getRiskBg(l), color: getRiskColor(l), borderColor: getRiskColor(l) } : {}}
              onClick={() => setFilterRisk(l)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          {processes.length === 0 ? (
            <>
              <div className={styles.emptyIcon}>+</div>
              <h3>No processes yet</h3>
              <p>Start by documenting your first business process.</p>
              {!isCorporate && <button className={styles.btnPrimary} onClick={onNew}>Add First Process</button>}
            </>
          ) : (
            <p>No processes match your search or filter.</p>
          )}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => toggleSort('name')} className={styles.sortable}>Process <SortIcon field="name" /></th>
                {isCorporate && <th onClick={() => toggleSort('companyId')} className={styles.sortable}>Company <SortIcon field="companyId" /></th>}
                <th onClick={() => toggleSort('department')} className={styles.sortable}>Dept <SortIcon field="department" /></th>
                <th>Owner</th>
                <th>Criticality</th>
                <th>Financial</th>
                <th>Operational</th>
                <th>RTO</th>
                <th>RPO</th>
                <th onClick={() => toggleSort('riskScore')} className={styles.sortable}>Risk <SortIcon field="riskScore" /></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <ProcessRow key={p.id} process={p} isCorporate={isCorporate} companyMap={companyMap} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProcessRow({ process: p, isCorporate, companyMap, onEdit, onDelete }) {
  const company = companyMap[p.companyId];
  return (
    <tr>
      <td>
        <div className={styles.processName}>{p.name}</div>
        {p.description && <div className={styles.processDesc}>{p.description.slice(0, 55)}{p.description.length > 55 ? '…' : ''}</div>}
      </td>
      {isCorporate && (
        <td>
          {company ? (
            <span className={styles.companyTag}>{company.name}</span>
          ) : (
            <span className={styles.unassigned}>Unassigned</span>
          )}
        </td>
      )}
      <td className={styles.dim}>{p.department || '—'}</td>
      <td className={styles.dim}>{p.owner || '—'}</td>
      <td><LevelBadge level={p.criticality} /></td>
      <td><LevelBadge level={p.financialImpact} /></td>
      <td><LevelBadge level={p.operationalImpact} /></td>
      <td className={styles.mono}>{p.rto || '—'}</td>
      <td className={styles.mono}>{p.rpo || '—'}</td>
      <td>
        <span className={styles.riskScore} style={{ background: getRiskBg(p.riskLevel), color: getRiskColor(p.riskLevel) }}>
          <strong>{p.riskScore}</strong> {p.riskLevel}
        </span>
      </td>
      <td>
        <div className={styles.rowActions}>
          <button className={styles.btnEdit} onClick={() => onEdit(p)}>Edit</button>
          <button className={styles.btnDelete} onClick={() => { if (confirm(`Delete "${p.name}"?`)) onDelete(p.id); }}>Delete</button>
        </div>
      </td>
    </tr>
  );
}

export function LevelBadge({ level }) {
  if (!level) return <span className={styles.dim}>—</span>;
  return (
    <span className={styles.badge} style={{ background: getRiskBg(level), color: getRiskColor(level) }}>
      {level}
    </span>
  );
}
