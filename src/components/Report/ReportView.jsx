import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { getRiskColor, getRiskBg } from '../../utils/scoring';
import { exportPDF, exportExcel } from '../../utils/export';
import styles from './ReportView.module.css';

const LEVELS = ['Low', 'Medium', 'High', 'Critical'];

const TIME_FRAMES = [
  { key: 'h4', label: '0–4 Hours' },
  { key: 'h24', label: '24 Hours' },
  { key: 'd3', label: '3 Days' },
  { key: 'w1', label: '1 Week' },
];

export default function ReportView({ processes, allProcesses, companies, activeCompany }) {
  const [corpView, setCorpView] = useState(!activeCompany);

  const showCorp = corpView || !activeCompany;
  const reportProcesses = showCorp ? allProcesses : processes;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          {!showCorp && activeCompany?.logo && (
            <img src={activeCompany.logo} className={styles.reportLogo} alt={`${activeCompany.name} logo`} />
          )}
          <div>
            <h1 className={styles.title}>{showCorp ? 'Corporate BIA Report' : `${activeCompany?.name} — BIA Report`}</h1>
            <p className={styles.subtitle}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          {activeCompany && companies.length > 0 && (
            <div className={styles.viewToggle}>
              <button className={`${styles.toggleBtn} ${!corpView ? styles.toggleActive : ''}`} onClick={() => setCorpView(false)}>
                Company
              </button>
              <button className={`${styles.toggleBtn} ${corpView ? styles.toggleActive : ''}`} onClick={() => setCorpView(true)}>
                Corporate
              </button>
            </div>
          )}
          <div className={styles.exportBtns}>
            <button className={styles.btnExcel} onClick={() => exportExcel(reportProcesses)} disabled={reportProcesses.length === 0}>Excel</button>
            <button className={styles.btnPdf} onClick={() => exportPDF(reportProcesses, companies)} disabled={reportProcesses.length === 0}>PDF</button>
          </div>
        </div>
      </div>

      {reportProcesses.length === 0 ? (
        <div className={styles.empty}><p>No processes to report.</p></div>
      ) : showCorp ? (
        <CorporateReport processes={allProcesses} companies={companies} />
      ) : (
        <CompanyReport processes={processes} company={activeCompany} />
      )}
    </div>
  );
}

/* ── Corporate Report ──────────────────────────────────────── */

function CorporateReport({ processes, companies }) {
  const byRisk = LEVELS.reduce((acc, l) => ({ ...acc, [l]: processes.filter(p => p.riskLevel === l).length }), {});
  const chartData = LEVELS.map(l => ({ name: l, count: byRisk[l] }));
  const pieData = LEVELS.filter(l => byRisk[l] > 0).map(l => ({ name: l, value: byRisk[l], fill: getRiskColor(l) }));
  const avgRisk = processes.length ? (processes.reduce((s, p) => s + p.riskScore, 0) / processes.length).toFixed(1) : 0;

  const companyRows = companies.map(c => {
    const procs = processes.filter(p => p.companyId === c.id);
    const byL = LEVELS.reduce((acc, l) => ({ ...acc, [l]: procs.filter(p => p.riskLevel === l).length }), {});
    const avg = procs.length ? (procs.reduce((s, p) => s + p.riskScore, 0) / procs.length).toFixed(1) : 0;
    const top = [...procs].sort((a, b) => b.riskScore - a.riskScore)[0];
    return { ...c, procs, byL, avg, top };
  }).sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg));

  return (
    <>
      <div className={styles.summaryRow}>
        <StatBox label="Companies" value={companies.length} color="#2563eb" />
        <StatBox label="Total Processes" value={processes.length} color="#7c3aed" />
        <StatBox label="Critical" value={byRisk.Critical} color="#dc2626" />
        <StatBox label="High" value={byRisk.High} color="#ea580c" />
        <StatBox label="Medium" value={byRisk.Medium} color="#d97706" />
        <StatBox label="Avg Risk Score" value={avgRisk} color="#0891b2" />
      </div>

      <div className={styles.chartRow}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Risk Distribution — All Companies</h2>
          <ResponsiveContainer width="100%" height={200}>
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
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Risk Breakdown</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {pieData.map(e => <Cell key={e.name} fill={e.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Companies Risk Ranking</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Company</th>
                <th>Type</th>
                <th>Processes</th>
                <th>Critical</th>
                <th>High</th>
                <th>Medium</th>
                <th>Low</th>
                <th>Avg Risk</th>
                <th>Highest Risk Process</th>
              </tr>
            </thead>
            <tbody>
              {companyRows.map((c, i) => (
                <tr key={c.id}>
                  <td className={styles.num}>{i + 1}</td>
                  <td><strong>{c.name}</strong></td>
                  <td className={styles.dim}>{c.type || '—'}</td>
                  <td>{c.procs.length}</td>
                  <td>{c.byL.Critical > 0 ? <span style={{ color: '#dc2626', fontWeight: 700 }}>{c.byL.Critical}</span> : '—'}</td>
                  <td>{c.byL.High > 0 ? <span style={{ color: '#ea580c', fontWeight: 700 }}>{c.byL.High}</span> : '—'}</td>
                  <td>{c.byL.Medium > 0 ? <span style={{ color: '#d97706', fontWeight: 600 }}>{c.byL.Medium}</span> : '—'}</td>
                  <td>{c.byL.Low > 0 ? <span style={{ color: '#16a34a', fontWeight: 600 }}>{c.byL.Low}</span> : '—'}</td>
                  <td>
                    {c.top ? (
                      <span className={styles.riskBadge} style={{ background: getRiskBg(c.top.riskLevel), color: getRiskColor(c.top.riskLevel) }}>
                        {c.avg}
                      </span>
                    ) : <span className={styles.dim}>—</span>}
                  </td>
                  <td className={styles.dim}>{c.top ? c.top.name : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {companyRows.map(c => c.procs.length > 0 && (
        <div key={c.id} className={styles.card}>
          <div className={styles.companySectionHeader}>
            <div className={styles.companySectionLeft}>
              {c.logo && <img src={c.logo} className={styles.sectionLogo} alt={`${c.name} logo`} />}
              <div>
                <h2 className={styles.cardTitle}>{c.name}</h2>
                {c.type && <span className={styles.sectionType}>{c.type}</span>}
                {c.location && <span className={styles.dim}> · {c.location}</span>}
              </div>
            </div>
            <span className={styles.riskBadge} style={c.top ? { background: getRiskBg(c.top.riskLevel), color: getRiskColor(c.top.riskLevel) } : {}}>
              {c.procs.length} processes · avg {c.avg}
            </span>
          </div>
          <MiniSummaryTable processes={c.procs} />
        </div>
      ))}
    </>
  );
}

/* ── Company Report ────────────────────────────────────────── */

function CompanyReport({ processes, company }) {
  const sorted = [...processes].sort((a, b) => b.riskScore - a.riskScore);
  const byRisk = LEVELS.reduce((acc, l) => ({ ...acc, [l]: processes.filter(p => p.riskLevel === l).length }), {});
  const chartData = LEVELS.map(l => ({ name: l, count: byRisk[l] }));
  const pieData = LEVELS.filter(l => byRisk[l] > 0).map(l => ({ name: l, value: byRisk[l], fill: getRiskColor(l) }));
  const avgRisk = processes.length ? (processes.reduce((s, p) => s + p.riskScore, 0) / processes.length).toFixed(1) : 0;

  return (
    <>
      <div className={styles.summaryRow}>
        <StatBox label="Total Processes" value={processes.length} color="#2563eb" />
        <StatBox label="Critical" value={byRisk.Critical} color="#dc2626" />
        <StatBox label="High" value={byRisk.High} color="#ea580c" />
        <StatBox label="Medium" value={byRisk.Medium} color="#d97706" />
        <StatBox label="Low" value={byRisk.Low} color="#16a34a" />
        <StatBox label="Avg Risk Score" value={avgRisk} color="#7c3aed" />
      </div>

      <div className={styles.chartRow}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Risk Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
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
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Risk Level Breakdown</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {pieData.map(e => <Cell key={e.name} fill={e.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Process Summary Table</h2>
        <MiniSummaryTable processes={sorted} showAll />
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Detailed Process Analysis</h2>
        <div className={styles.processDetails}>
          {sorted.map(p => <ProcessDetail key={p.id} process={p} />)}
        </div>
      </div>
    </>
  );
}

/* ── Shared Components ─────────────────────────────────────── */

function MiniSummaryTable({ processes, showAll }) {
  const sorted = [...processes].sort((a, b) => b.riskScore - a.riskScore);
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Process</th>
            <th>Dept</th>
            <th>Owner</th>
            {showAll && <>
              <th>Financial</th>
              <th>Operational</th>
              <th>Legal</th>
              <th>Reputational</th>
            </>}
            <th>RTO</th>
            <th>RPO</th>
            <th>MTD</th>
            <th>Risk</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => (
            <tr key={p.id}>
              <td className={styles.num}>{i + 1}</td>
              <td><strong>{p.name}</strong></td>
              <td className={styles.dim}>{p.department || '—'}</td>
              <td className={styles.dim}>{p.owner || '—'}</td>
              {showAll && <>
                <td><LevelBadge level={p.financialImpact} /></td>
                <td><LevelBadge level={p.operationalImpact} /></td>
                <td><LevelBadge level={p.legalImpact} /></td>
                <td><LevelBadge level={p.reputationalImpact} /></td>
              </>}
              <td className={styles.mono}>{p.rto || '—'}</td>
              <td className={styles.mono}>{p.rpo || '—'}</td>
              <td className={styles.mono}>{p.mtd || '—'}</td>
              <td>
                <span className={styles.riskBadge} style={{ background: getRiskBg(p.riskLevel), color: getRiskColor(p.riskLevel) }}>
                  <strong>{p.riskScore}</strong> {p.riskLevel}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className={styles.statBox}>
      <div className={styles.statVal} style={{ color }}>{value}</div>
      <div className={styles.statLbl}>{label}</div>
    </div>
  );
}

function LevelBadge({ level }) {
  if (!level) return <span className={styles.dim}>—</span>;
  return (
    <span style={{ background: getRiskBg(level), color: getRiskColor(level), padding: '1px 7px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
      {level}
    </span>
  );
}

function ProcessDetail({ process: p }) {
  const depsCount = (p.systems?.length || 0) + (p.people?.length || 0) + (p.vendors?.length || 0) + (p.thirdParties?.length || 0);
  return (
    <div className={styles.processDetail}>
      <div className={styles.detailHeader}>
        <div className={styles.detailTitle}>
          <h3>{p.name}</h3>
          <span className={styles.detailMeta}>{[p.department, p.owner].filter(Boolean).join(' · ')}</span>
        </div>
        <span className={styles.riskBadge} style={{ background: getRiskBg(p.riskLevel), color: getRiskColor(p.riskLevel) }}>
          Risk {p.riskScore} — {p.riskLevel}
        </span>
      </div>

      {p.description && <p className={styles.description}>{p.description}</p>}

      <div className={styles.detailGrid}>
        <div className={styles.detailSection}>
          <h4 className={styles.sectionTitle}>Impact by Category</h4>
          <div className={styles.impactRow}>
            {[['Financial', p.financialImpact], ['Operational', p.operationalImpact], ['Legal', p.legalImpact], ['Reputational', p.reputationalImpact]].map(([name, val]) => (
              <div key={name} className={styles.impactCell}>
                <span className={styles.impactName}>{name}</span>
                <LevelBadge level={val} />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.detailSection}>
          <h4 className={styles.sectionTitle}>Recovery Metrics</h4>
          <table className={styles.miniTable}>
            <tbody>
              <tr><td>RTO</td><td><strong>{p.rto || '—'}</strong></td></tr>
              <tr><td>RPO</td><td><strong>{p.rpo || '—'}</strong></td></tr>
              <tr><td>MTD</td><td><strong>{p.mtd || '—'}</strong></td></tr>
              <tr><td>Likelihood</td><td><strong>{p.likelihood || 1}/5</strong></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.detailSection}>
        <h4 className={styles.sectionTitle}>Time-Based Impact</h4>
        <div className={styles.timeRow}>
          {TIME_FRAMES.map(({ key, label }) => {
            const ti = p.timeImpact?.[key];
            const sev = ti?.severity;
            return (
              <div key={key} className={styles.timeCell}>
                <span className={styles.timeLabel}>{label}</span>
                {sev && sev !== 'None' ? (
                  <span style={{ background: getRiskBg(sev), color: getRiskColor(sev), padding: '1px 7px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{sev}</span>
                ) : <span className={styles.dim}>—</span>}
                {ti?.description && <p className={styles.timeNote}>{ti.description}</p>}
              </div>
            );
          })}
        </div>
      </div>

      {depsCount > 0 && (
        <div className={styles.detailSection}>
          <h4 className={styles.sectionTitle}>Dependencies ({depsCount})</h4>
          <div className={styles.depsGrid}>
            {p.systems?.length > 0 && <DepGroup title="IT Systems" items={p.systems} extra="notes" />}
            {p.people?.length > 0 && <DepGroup title="Key People" items={p.people} extra="role" />}
            {p.vendors?.length > 0 && <DepGroup title="Vendors" items={p.vendors} extra="service" />}
            {p.thirdParties?.length > 0 && <DepGroup title="Third Parties" items={p.thirdParties} extra="service" />}
          </div>
        </div>
      )}
    </div>
  );
}

function DepGroup({ title, items, extra }) {
  return (
    <div className={styles.depGroup}>
      <p className={styles.depGroupTitle}>{title}</p>
      <ul className={styles.depList}>
        {items.map(item => (
          <li key={item.id} className={styles.depItem}>
            <strong>{item.name}</strong>
            {item[extra] && <span className={styles.dim}> — {item[extra]}</span>}
            {item.criticality && (
              <span style={{ background: getRiskBg(item.criticality), color: getRiskColor(item.criticality), marginLeft: 6, padding: '0 5px', borderRadius: 3, fontSize: 11, fontWeight: 700 }}>
                {item.criticality}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
