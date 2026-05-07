import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getRiskColor, getRiskBg, getRiskLevel } from '../../utils/scoring';
import styles from './CompanyList.module.css';

const INDUSTRY_TYPES = [
  'Hotel', 'Restaurant', 'Retail', 'Dry Cleaning', 'Laundry',
  'Manufacturing', 'Healthcare', 'Finance', 'Technology',
  'Real Estate', 'Logistics', 'Construction', 'Education', 'Other',
];

const BLANK = { name: '', type: '', description: '', location: '' };

function companyStats(processes) {
  if (!processes.length) return { total: 0, critical: 0, high: 0, avgRisk: 0, topRisk: null };
  const byLevel = processes.reduce((acc, p) => {
    acc[p.riskLevel] = (acc[p.riskLevel] || 0) + 1;
    return acc;
  }, {});
  const top = [...processes].sort((a, b) => b.riskScore - a.riskScore)[0];
  const avg = processes.reduce((s, p) => s + p.riskScore, 0) / processes.length;
  return {
    total: processes.length,
    critical: byLevel.Critical || 0,
    high: byLevel.High || 0,
    medium: byLevel.Medium || 0,
    low: byLevel.Low || 0,
    avgRisk: avg.toFixed(1),
    topRisk: top ? { level: top.riskLevel, score: top.riskScore } : null,
  };
}

export default function CompanyList({ companies, allProcesses, activeCompanyId, onAdd, onUpdate, onDelete, onSwitch }) {
  const [modal, setModal] = useState(null); // null | 'add' | { company }
  const [form, setForm] = useState(BLANK);
  const [search, setSearch] = useState('');

  function openAdd() { setForm(BLANK); setModal('add'); }
  function openEdit(c) { setForm({ name: c.name, type: c.type || '', description: c.description || '', location: c.location || '' }); setModal(c); }
  function closeModal() { setModal(null); }

  function handleSubmit() {
    if (!form.name.trim()) return;
    if (modal === 'add') {
      onAdd(form);
    } else {
      onUpdate(modal.id, form);
    }
    closeModal();
  }

  const filtered = companies.filter(c =>
    !search || [c.name, c.type, c.location].some(s => s?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Companies</h1>
          <p className={styles.subtitle}>{companies.length} sub-compan{companies.length !== 1 ? 'ies' : 'y'} in the corporation</p>
        </div>
        <button className={styles.btnPrimary} onClick={openAdd}>+ Add Company</button>
      </div>

      {companies.length > 4 && (
        <input
          className={styles.search}
          placeholder="Search companies..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      )}

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>C</div>
          <h3>No companies yet</h3>
          <p>Add your first sub-company to get started.</p>
          <button className={styles.btnPrimary} onClick={openAdd}>Add Company</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(c => {
            const procs = allProcesses.filter(p => p.companyId === c.id);
            const stats = companyStats(procs);
            const isActive = activeCompanyId === c.id;
            return (
              <CompanyCard
                key={c.id}
                company={c}
                stats={stats}
                isActive={isActive}
                onSwitch={onSwitch}
                onEdit={openEdit}
                onDelete={onDelete}
              />
            );
          })}
        </div>
      )}

      {modal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{modal === 'add' ? 'Add Company' : 'Edit Company'}</h2>
              <button className={styles.modalClose} onClick={closeModal}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label>Company Name <span className={styles.req}>*</span></label>
                <input
                  autoFocus
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., Grand Plaza Hotel"
                />
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Industry / Type</label>
                  <input
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    placeholder="e.g., Hotel"
                    list="industry-list"
                  />
                  <datalist id="industry-list">
                    {INDUSTRY_TYPES.map(t => <option key={t} value={t} />)}
                  </datalist>
                </div>
                <div className={styles.field}>
                  <label>Location</label>
                  <input
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="e.g., New York, NY"
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Brief description of this company..."
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={closeModal}>Cancel</button>
              <button className={styles.btnSave} onClick={handleSubmit} disabled={!form.name.trim()}>
                {modal === 'add' ? 'Add Company' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompanyCard({ company: c, stats, isActive, onSwitch, onEdit, onDelete }) {
  const topLevel = stats.topRisk?.level;

  return (
    <div className={`${styles.card} ${isActive ? styles.cardActive : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardLeft}>
          <h3 className={styles.cardName}>{c.name}</h3>
          <div className={styles.cardMeta}>
            {c.type && <span className={styles.typeBadge}>{c.type}</span>}
            {c.location && <span className={styles.location}>{c.location}</span>}
          </div>
        </div>
        {topLevel && (
          <span className={styles.topRisk} style={{ background: getRiskBg(topLevel), color: getRiskColor(topLevel) }}>
            {topLevel}
          </span>
        )}
      </div>

      {c.description && <p className={styles.desc}>{c.description}</p>}

      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <strong>{stats.total}</strong>
          <span>Processes</span>
        </div>
        {stats.critical > 0 && (
          <div className={styles.stat}>
            <strong style={{ color: '#dc2626' }}>{stats.critical}</strong>
            <span>Critical</span>
          </div>
        )}
        {stats.high > 0 && (
          <div className={styles.stat}>
            <strong style={{ color: '#ea580c' }}>{stats.high}</strong>
            <span>High</span>
          </div>
        )}
        {stats.total > 0 && (
          <div className={styles.stat}>
            <strong style={{ color: '#7c3aed' }}>{stats.avgRisk}</strong>
            <span>Avg Risk</span>
          </div>
        )}
      </div>


      <div className={styles.cardActions}>
        <button
          className={`${styles.btnSwitch} ${isActive ? styles.btnSwitchActive : ''}`}
          onClick={() => onSwitch(c.id)}
        >
          {isActive ? 'Active' : 'Switch To'}
        </button>
        <button className={styles.btnEdit} onClick={() => onEdit(c)}>Edit</button>
        <button className={styles.btnDelete} onClick={() => onDelete(c.id)}>Delete</button>
      </div>
    </div>
  );
}
