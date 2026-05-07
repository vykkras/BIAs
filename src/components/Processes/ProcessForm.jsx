import { useState, useEffect } from 'react';

const DRAFT_KEY = 'bia_process_draft';
import { v4 as uuidv4 } from 'uuid';
import { getRiskColor, getRiskBg, calcRiskScore, getRiskLevel } from '../../utils/scoring';
import styles from './ProcessForm.module.css';

const TABS = [
  { label: 'Basic Info', desc: 'Name, owner, department' },
  { label: 'Impact Analysis', desc: 'Financial, operational, legal, reputational' },
  { label: 'Time Impact', desc: 'Impact over time periods' },
  { label: 'Recovery', desc: 'RTO, RPO, MTD, likelihood' },
  { label: 'Dependencies', desc: 'Systems, people, vendors' },
];

const IMPACT_OPTIONS = [
  { key: 'financialImpact', label: 'Financial Impact', hint: 'Revenue loss, financial penalties, increased costs' },
  { key: 'operationalImpact', label: 'Operational Impact', hint: 'Process disruption, reduced capacity, service failures' },
  { key: 'legalImpact', label: 'Legal / Regulatory Impact', hint: 'Compliance violations, contractual breaches, fines' },
  { key: 'reputationalImpact', label: 'Reputational Impact', hint: 'Customer trust, brand damage, media coverage' },
];

const TIME_FRAMES = [
  { key: 'h4', label: '0–4 Hours', desc: 'Immediate impact within first 4 hours of disruption' },
  { key: 'h24', label: '24 Hours', desc: 'Impact after one full day of unavailability' },
  { key: 'd3', label: '3 Days', desc: 'Impact after 72 hours of disruption' },
  { key: 'w1', label: '1 Week', desc: 'Impact after one full week without recovery' },
];

const LEVELS = ['Low', 'Medium', 'High', 'Critical'];
const SEVERITIES = ['None', 'Low', 'Medium', 'High', 'Critical'];
const LIKELIHOOD_LABELS = ['', 'Very Unlikely', 'Unlikely', 'Possible', 'Likely', 'Very Likely'];

const DEP_SECTIONS = [
  { key: 'systems', label: 'IT Systems', fields: [['name', 'System Name'], ['notes', 'Description / Notes']] },
  { key: 'people', label: 'Key People', fields: [['name', 'Full Name'], ['role', 'Role / Title']] },
  { key: 'vendors', label: 'External Vendors', fields: [['name', 'Vendor Name'], ['service', 'Service Provided']] },
  { key: 'thirdParties', label: 'Third Parties', fields: [['name', 'Party Name'], ['service', 'Service / Relationship']] },
];

function blankForm(initial) {
  const base = {
    name: '', description: '', owner: '', department: '', criticality: 'Medium',
    financialImpact: 'Low', operationalImpact: 'Low', legalImpact: 'Low', reputationalImpact: 'Low',
    timeImpact: {
      h4: { severity: 'None', description: '' },
      h24: { severity: 'None', description: '' },
      d3: { severity: 'None', description: '' },
      w1: { severity: 'None', description: '' },
    },
    rto: '', rpo: '', mtd: '', likelihood: 3,
    systems: [], people: [], vendors: [], thirdParties: [],
  };
  if (!initial) return base;
  return { ...base, ...initial, timeImpact: { ...base.timeImpact, ...(initial.timeImpact || {}) } };
}

export default function ProcessForm({ initial, companies, activeCompanyId, onSave, onCancel }) {
  const [tab, setTab] = useState(() => {
    if (initial) return 0;
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null')?.tab ?? 0; } catch { return 0; }
  });
  const [form, setForm] = useState(() => {
    if (initial) return blankForm(initial);
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      return d?.form ? blankForm(d.form) : blankForm(null);
    } catch { return blankForm(null); }
  });

  useEffect(() => {
    if (initial) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, tab }));
  }, [form, tab, initial]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const setTime = (key, field, value) =>
    setForm(f => ({ ...f, timeImpact: { ...f.timeImpact, [key]: { ...f.timeImpact[key], [field]: value } } }));

  function addDep(type) {
    const item = type === 'systems'
      ? { id: uuidv4(), name: '', notes: '', criticality: 'Medium' }
      : type === 'people'
      ? { id: uuidv4(), name: '', role: '', criticality: 'Medium' }
      : { id: uuidv4(), name: '', service: '', criticality: 'Medium' };
    setForm(f => ({ ...f, [type]: [...(f[type] || []), item] }));
  }

  function updateDep(type, id, field, value) {
    setForm(f => ({ ...f, [type]: f[type].map(d => d.id === id ? { ...d, [field]: value } : d) }));
  }

  function removeDep(type, id) {
    setForm(f => ({ ...f, [type]: f[type].filter(d => d.id !== id) }));
  }

  const riskScore = calcRiskScore(form);
  const riskLevel = getRiskLevel(riskScore);
  const isCorporate = !activeCompanyId;
  const canSave = form.name.trim().length > 0 && (!isCorporate || form.companyId);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{initial ? 'Edit Process' : 'New Business Process'}</h1>
          <p className={styles.subtitle}>{initial ? `Editing: ${initial.name}` : 'Document a business process for your BIA'}</p>
        </div>
        <div className={styles.riskPill} style={{ background: getRiskBg(riskLevel), color: getRiskColor(riskLevel) }}>
          Risk Score: <strong>{riskScore}</strong> — {riskLevel}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.tabBar}>
          {TABS.map((t, i) => (
            <button
              key={t.label}
              className={`${styles.tab} ${tab === i ? styles.tabActive : ''}`}
              onClick={() => setTab(i)}
            >
              <span className={`${styles.tabNum} ${tab === i ? styles.tabNumActive : ''}`}>{i + 1}</span>
              <span className={styles.tabLabel}>{t.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          <div className={styles.tabHint}>{TABS[tab].desc}</div>

          {tab === 0 && <BasicTab form={form} set={set} companies={companies} isCorporate={isCorporate} />}
          {tab === 1 && <ImpactTab form={form} set={set} />}
          {tab === 2 && <TimeTab form={form} setTime={setTime} />}
          {tab === 3 && <RecoveryTab form={form} set={set} />}
          {tab === 4 && <DepsTab form={form} addDep={addDep} updateDep={updateDep} removeDep={removeDep} />}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerNav}>
            {tab > 0 && (
              <button className={styles.btnSecondary} onClick={() => setTab(t => t - 1)}>
                &larr; {TABS[tab - 1].label}
              </button>
            )}
            {tab < TABS.length - 1 && (
              <button className={styles.btnSecondary} onClick={() => setTab(t => t + 1)}>
                {TABS[tab + 1].label} &rarr;
              </button>
            )}
          </div>
          <div className={styles.footerSave}>
            <button className={styles.btnCancel} onClick={onCancel}>Cancel</button>
            <button className={styles.btnSave} onClick={() => { if (!initial) localStorage.removeItem(DRAFT_KEY); onSave(form); }} disabled={!canSave}>
              {initial ? 'Save Changes' : 'Create Process'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BasicTab({ form, set, companies, isCorporate }) {
  return (
    <div className={styles.formGrid}>
      <div className={styles.span2}>
        <label>Process Name <span className={styles.req}>*</span></label>
        <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g., Customer Order Processing" />
      </div>
      <div className={styles.span2}>
        <label>Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Describe what this process does and why it matters to the organization..." />
      </div>
      <div>
        <label>Process Owner</label>
        <input value={form.owner} onChange={e => set('owner', e.target.value)} placeholder="e.g., Jane Smith" />
      </div>
      <div>
        <label>Department</label>
        <input value={form.department} onChange={e => set('department', e.target.value)} placeholder="e.g., Finance, Operations" />
      </div>
      <div>
        <label>Criticality Level</label>
        <select value={form.criticality} onChange={e => set('criticality', e.target.value)}>
          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <p className={styles.hint}>Overall importance of this process to the organization.</p>
      </div>
      {isCorporate && (
        <div>
          <label>Company <span className={styles.req}>*</span></label>
          <select value={form.companyId || ''} onChange={e => set('companyId', e.target.value || undefined)}>
            <option value="">— Select a company —</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}{c.type ? ` (${c.type})` : ''}</option>)}
          </select>
          <p className={styles.hint}>Assign this process to a sub-company.</p>
        </div>
      )}
    </div>
  );
}

function ImpactTab({ form, set }) {
  return (
    <div className={styles.impactGrid}>
      {IMPACT_OPTIONS.map(({ key, label, hint }) => (
        <ImpactCard key={key} label={label} hint={hint} value={form[key]} onChange={v => set(key, v)} />
      ))}
    </div>
  );
}

function ImpactCard({ label, hint, value, onChange }) {
  return (
    <div className={styles.impactCard}>
      <div className={styles.impactCardTop}>
        <span className={styles.impactLabel}>{label}</span>
        <span className={styles.impactCurrent} style={{ background: getRiskBg(value), color: getRiskColor(value) }}>
          {value}
        </span>
      </div>
      <p className={styles.impactHint}>{hint}</p>
      <div className={styles.impactBtns}>
        {LEVELS.map(l => (
          <button
            key={l}
            className={`${styles.impactBtn} ${value === l ? styles.impactBtnActive : ''}`}
            style={value === l ? { background: getRiskColor(l), color: '#fff', borderColor: getRiskColor(l) } : {}}
            onClick={() => onChange(l)}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

function TimeTab({ form, setTime }) {
  return (
    <div>
      <p className={styles.sectionNote}>
        Describe the severity and effects of this process being unavailable over increasing time periods.
        This helps determine RTO priorities.
      </p>
      <div className={styles.timeGrid}>
        {TIME_FRAMES.map(({ key, label, desc }) => {
          const val = form.timeImpact?.[key] || { severity: 'None', description: '' };
          return (
            <div key={key} className={styles.timeCard}>
              <div className={styles.timeHeader}>
                <strong className={styles.timeLabel}>{label}</strong>
                <select
                  value={val.severity}
                  onChange={e => setTime(key, 'severity', e.target.value)}
                  className={styles.timeSeverity}
                  style={{ color: val.severity !== 'None' ? getRiskColor(val.severity) : undefined, fontWeight: val.severity !== 'None' ? 600 : undefined }}
                >
                  {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <p className={styles.timeDesc}>{desc}</p>
              <textarea
                value={val.description}
                onChange={e => setTime(key, 'description', e.target.value)}
                rows={3}
                placeholder={`Describe specific impacts after ${label.toLowerCase()}...`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecoveryTab({ form, set }) {
  return (
    <div className={styles.formGrid}>
      <div>
        <label>RTO — Recovery Time Objective</label>
        <input value={form.rto} onChange={e => set('rto', e.target.value)} placeholder="e.g., 4 hours" />
        <p className={styles.hint}>Maximum acceptable time to restore this process after a disruption.</p>
      </div>
      <div>
        <label>RPO — Recovery Point Objective</label>
        <input value={form.rpo} onChange={e => set('rpo', e.target.value)} placeholder="e.g., 1 hour" />
        <p className={styles.hint}>Maximum acceptable amount of data loss measured in time.</p>
      </div>
      <div>
        <label>MTD — Maximum Tolerable Downtime</label>
        <input value={form.mtd} onChange={e => set('mtd', e.target.value)} placeholder="e.g., 24 hours" />
        <p className={styles.hint}>Absolute maximum time the organization can survive without this process.</p>
      </div>
      <div>
        <label>Likelihood of Disruption</label>
        <div className={styles.likelihoodRow}>
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              className={`${styles.likelihoodBtn} ${form.likelihood === n ? styles.likelihoodActive : ''}`}
              onClick={() => set('likelihood', n)}
            >
              {n}
            </button>
          ))}
        </div>
        <p className={styles.hint}>
          Current: <strong>{LIKELIHOOD_LABELS[form.likelihood]}</strong> ({form.likelihood}/5)
          &nbsp;— Affects overall risk score.
        </p>
      </div>
    </div>
  );
}

function DepsTab({ form, addDep, updateDep, removeDep }) {
  return (
    <div className={styles.depsContainer}>
      {DEP_SECTIONS.map(({ key, label, fields }) => (
        <div key={key} className={styles.depSection}>
          <div className={styles.depSectionHeader}>
            <h3 className={styles.depSectionTitle}>{label}</h3>
            <span className={styles.depCount}>{(form[key] || []).length}</span>
            <button className={styles.btnAddDep} onClick={() => addDep(key)}>+ Add</button>
          </div>
          {(form[key] || []).length === 0 ? (
            <p className={styles.depEmpty}>No {label.toLowerCase()} added. Click "+ Add" to add one.</p>
          ) : (
            <div className={styles.depRows}>
              {(form[key] || []).map(dep => (
                <div key={dep.id} className={styles.depRow}>
                  {fields.map(([f, ph]) => (
                    <input
                      key={f}
                      placeholder={ph}
                      value={dep[f] || ''}
                      onChange={e => updateDep(key, dep.id, f, e.target.value)}
                    />
                  ))}
                  <select
                    value={dep.criticality || 'Medium'}
                    onChange={e => updateDep(key, dep.id, 'criticality', e.target.value)}
                  >
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <button className={styles.btnRemove} onClick={() => removeDep(key, dep.id)}>&times;</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
