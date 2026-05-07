import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getRiskColor, getRiskBg } from '../../utils/scoring';
import styles from './Dashboard.module.css';

const LEVELS = ['Low', 'Medium', 'High', 'Critical'];

export default function Dashboard({ processes, allProcesses, companies, activeCompany, onNavigate, onNew, onSwitchCompany }) {
  if (!activeCompany) {
    return (
      <CorporateDashboard
        allProcesses={allProcesses}
        companies={companies}
        onNavigate={onNavigate}
        onNew={onNew}
        onSwitchCompany={onSwitchCompany}
      />
    );
  }
  return (
    <CompanyDashboard
      processes={processes}
      company={activeCompany}
      onNavigate={onNavigate}
      onNew={onNew}
    />
  );
}

/* ── Corporate Overview ─────────────────────────────────────── */

function CorporateDashboard({ allProcesses, companies, onNavigate, onNew, onSwitchCompany }) {
  const byRisk = LEVELS.reduce((acc, l) => ({ ...acc, [l]: allProcesses.filter(p => p.riskLevel === l).length }), {});
  const chartData = LEVELS.map(l => ({ name: l, count: byRisk[l] }));

  const companyRows = companies.map(c => {
    const procs = allProcesses.filter(p => p.companyId === c.id);
    const byL = LEVELS.reduce((acc, l) => ({ ...acc, [l]: procs.filter(p => p.riskLevel === l).length }), {});
    const avgRisk = procs.length ? (procs.reduce((s, p) => s + p.riskScore, 0) / procs.length).toFixed(1) : 0;
    const topProc = [...procs].sort((a, b) => b.riskScore - a.riskScore)[0];
    return { ...c, procs, byL, avgRisk, topProc };
  }).sort((a, b) => parseFloat(b.avgRisk) - parseFloat(a.avgRisk));

  const unassigned = allProcesses.filter(p => !p.companyId);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Corporate Overview</h1>
          <p className={styles.subtitle}>{companies.length} compan{companies.length !== 1 ? 'ies' : 'y'} · {allProcesses.length} total processes</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={() => onNavigate('companies')}>Manage Companies</button>
          <button className={styles.btnPrimary} onClick={onNew}>+ New Process</button>
        </div>
      </div>

      <div className={styles.stats}>
        <StatCard label="Companies" value={companies.length} accent="#2563eb" />
        <StatCard label="Total Processes" value={allProcesses.length} accent="#7c3aed" />
        <StatCard label="Critical Risk" value={byRisk.Critical} accent="#dc2626" />
        <StatCard label="High Risk" value={byRisk.High} accent="#ea580c" />
      </div>

      {unassigned.length > 0 && (
        <div className={styles.notice}>
          {unassigned.length} process{unassigned.length !== 1 ? 'es are' : ' is'} not assigned to any company.
          <button onClick={() => onNavigate('processes')}>View processes</button>
        </div>
      )}

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Risk Distribution — All Companies</h2>
          {allProcesses.length === 0 ? (
            <div className={styles.emptyChart}>No processes yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={60}>
                  {chartData.map(e => <Cell key={e.name} fill={getRiskColor(e.name)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Companies by Risk</h2>
          {companies.length === 0 ? (
            <div className={styles.emptyChart}>
              <p>No companies yet.</p>
              <button className={styles.linkBtn} onClick={() => onNavigate('companies')}>Add a company</button>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Processes</th>
                  <th>Avg Risk</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {companyRows.map(c => (
                  <tr key={c.id}>
                    <td className={styles.processCell}>{c.name}</td>
                    <td className={styles.secondary}>{c.type || '—'}</td>
                    <td>{c.procs.length}</td>
                    <td>
                      {c.topProc ? (
                        <span className={styles.badge} style={{ background: getRiskBg(c.topProc.riskLevel), color: getRiskColor(c.topProc.riskLevel) }}>
                          {c.avgRisk}
                        </span>
                      ) : <span className={styles.secondary}>—</span>}
                    </td>
                    <td>
                      <button className={styles.switchBtn} onClick={() => onSwitchCompany(c.id)}>Open</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Company Dashboard ──────────────────────────────────────── */

function CompanyDashboard({ processes, company, onNavigate, onNew }) {
  const byRisk = LEVELS.reduce((acc, l) => ({ ...acc, [l]: processes.filter(p => p.riskLevel === l).length }), {});
  const chartData = LEVELS.map(l => ({ name: l, count: byRisk[l] }));
  const topRisk = [...processes].sort((a, b) => b.riskScore - a.riskScore).slice(0, 6);
  const avgRisk = processes.length
    ? (processes.reduce((s, p) => s + p.riskScore, 0) / processes.length).toFixed(1)
    : '—';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.companyBadge}>
            {company.type && <span className={styles.companyType}>{company.type}</span>}
            {company.location && <span className={styles.companyLoc}>{company.location}</span>}
          </div>
          <h1 className={styles.title}>{company.name}</h1>
          <p className={styles.subtitle}>{processes.length} process{processes.length !== 1 ? 'es' : ''} documented</p>
        </div>
        <button className={styles.btnPrimary} onClick={onNew}>+ New Process</button>
      </div>

      <div className={styles.stats}>
        <StatCard label="Total Processes" value={processes.length} accent="#2563eb" />
        <StatCard label="Critical Risk" value={byRisk.Critical} accent="#dc2626" />
        <StatCard label="High Risk" value={byRisk.High} accent="#ea580c" />
        <StatCard label="Avg Risk Score" value={avgRisk} accent="#7c3aed" />
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Risk Distribution</h2>
          {processes.length === 0 ? (
            <div className={styles.emptyChart}>
              <p>No processes yet.</p>
              <button className={styles.linkBtn} onClick={onNew}>Add first process</button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={60}>
                  {chartData.map(e => <Cell key={e.name} fill={getRiskColor(e.name)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Highest Risk Processes</h2>
          {topRisk.length === 0 ? (
            <div className={styles.emptyChart}>
              <p>No processes yet.</p>
              <button className={styles.linkBtn} onClick={onNew}>Add your first process</button>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr><th>Process</th><th>Dept</th><th>Risk</th></tr>
              </thead>
              <tbody>
                {topRisk.map(p => (
                  <tr key={p.id}>
                    <td className={styles.processCell}>{p.name}</td>
                    <td className={styles.secondary}>{p.department || '—'}</td>
                    <td>
                      <span className={styles.badge} style={{ background: getRiskBg(p.riskLevel), color: getRiskColor(p.riskLevel) }}>
                        {p.riskLevel} ({p.riskScore})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className={styles.bottomGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Risk Breakdown</h2>
          <div className={styles.quickStats}>
            {LEVELS.map(l => <QuickStat key={l} label={l} value={byRisk[l]} color={getRiskColor(l)} />)}
          </div>
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Actions</h2>
          <div className={styles.actions}>
            <ActionBtn label="Add New Process" desc="Document a business process" onClick={onNew} primary />
            <ActionBtn label="View All Processes" desc="Manage existing processes" onClick={() => onNavigate('processes')} />
            <ActionBtn label="Generate Report" desc="Export PDF or Excel" onClick={() => onNavigate('report')} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statValue} style={{ color: accent }}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

function QuickStat({ label, value, color }) {
  return (
    <div className={styles.quickStat}>
      <div className={styles.quickDot} style={{ background: color }} />
      <span>{label}</span>
      <strong style={{ color }}>{value}</strong>
    </div>
  );
}

function ActionBtn({ label, desc, onClick, primary }) {
  return (
    <button className={`${styles.actionBtn} ${primary ? styles.actionPrimary : ''}`} onClick={onClick}>
      <span className={styles.actionLabel}>{label}</span>
      <span className={styles.actionDesc}>{desc}</span>
    </button>
  );
}
