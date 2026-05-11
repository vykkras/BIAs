import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { calcRiskScore, getRiskLevel } from './scoring';

const RISK_RGB = {
  Low: [22, 163, 74],
  Medium: [217, 119, 6],
  High: [234, 88, 12],
  Critical: [220, 38, 38],
};

export function exportPDF(processes, companies = []) {
  const companyMap = Object.fromEntries(companies.map(c => [c.id, c]));
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text('Business Impact Analysis Report', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleDateString()}  |  Total Processes: ${processes.length}`, 14, 28);

  const sorted = [...processes].sort((a, b) => b.riskScore - a.riskScore);

  autoTable(doc, {
    startY: 35,
    head: [['#', 'Process', 'Area', 'Sub-area', 'Dept', 'Owner', 'Owner Substitute', 'Priority', 'Financial', 'Operational', 'Legal', 'Reputational', 'RTO', 'RPO', 'MTPD', 'Risk Score', 'Risk Level']],
    body: sorted.map((p, i) => {
      const rs = calcRiskScore(p);
      const rl = getRiskLevel(rs);
      return [
        i + 1, p.name, p.area || '', p.subArea || '',
        p.department || '', p.owner || '', p.ownerSubstitute || '',
        p.criticality || '',
        p.financialImpact || '', p.operationalImpact || '',
        p.legalImpact || '', p.reputationalImpact || '',
        p.rto || '', p.rpo || '', p.mtpd || p.mtd || '',
        rs, rl,
      ];
    }),
    styles: { fontSize: 7, cellPadding: 2.5 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 7 }, 1: { cellWidth: 28 } },
    didParseCell(data) {
      if (data.column.index === 16 && data.section === 'body') {
        const rgb = RISK_RGB[data.cell.raw];
        if (rgb) {
          data.cell.styles.fillColor = rgb;
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // ── Process Details (grouped by company) ──────────────────
  doc.addPage();
  let y = 14;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Process Details', 14, y);
  y += 10;

  // Group processes by company, preserving sort order
  const groups = [];
  const seen = new Set();
  for (const p of sorted) {
    const key = p.companyId || '__none__';
    if (!seen.has(key)) { seen.add(key); groups.push(key); }
  }
  const byCompany = {};
  for (const p of sorted) {
    const key = p.companyId || '__none__';
    if (!byCompany[key]) byCompany[key] = [];
    byCompany[key].push(p);
  }

  for (const key of groups) {
    const procs = byCompany[key];
    const co = key !== '__none__' ? companyMap[key] : null;

    // ── Company section header ──
    if (co) {
      if (y > 175) { doc.addPage(); y = 14; }

      const logoH = 14;
      const logoW = 14;
      let headerH = logoH;

      if (co.logo) {
        try {
          doc.addImage(co.logo, 'AUTO', 14, y, logoW, logoH);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          doc.text(co.name, 32, y + 6);
          if (co.type || co.location) {
            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text([co.type, co.location].filter(Boolean).join(' · '), 32, y + 11.5);
          }
        } catch {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          doc.text(co.name, 14, y + 6);
        }
      } else {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(co.name, 14, y + 6);
        if (co.type || co.location) {
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 116, 139);
          doc.text([co.type, co.location].filter(Boolean).join(' · '), 14, y + 11.5);
        }
      }

      y += headerH + 4;
      doc.setDrawColor(226, 232, 240);
      doc.line(14, y, 283, y);
      y += 5;
    }

    // ── Processes under this company ──
    for (const p of procs) {
      const rs = calcRiskScore(p);
      const rl = getRiskLevel(rs);
      const rgb = RISK_RGB[rl] || [22, 163, 74];

      const blockEstimate = 8 + (p.description ? 10 : 0) + 8;
      if (y + blockEstimate > 195) { doc.addPage(); y = 14; }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(p.name, 18, y);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...rgb);
      doc.text(`${rl}  (${rs})`, 283, y, { align: 'right' });
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);

      if (p.description) {
        const lines = doc.splitTextToSize(p.description, 255);
        doc.text(lines, 18, y);
        y += lines.length * 4 + 2;
      }

      const details = [
        p.rto && `RTO: ${p.rto}`,
        p.rpo && `RPO: ${p.rpo}`,
        (p.mtpd || p.mtd) && `MTPD: ${p.mtpd || p.mtd}`,
      ].filter(Boolean).join('   ·   ');

      if (details) {
        doc.text(details, 18, y);
        y += 5;
      }
      y += 5;
    }

    y += 6; // space between company sections
  }

  doc.save('BIA_Report.pdf');
}

export function exportExcel(processes) {
  const sorted = [...processes].sort((a, b) => b.riskScore - a.riskScore);

  const summaryData = sorted.map((p, i) => ({
    '#': i + 1,
    'Process Name': p.name,
    'Description': p.description || '',
    'Area': p.area || '',
    'Sub-area': p.subArea || '',
    'Department': p.department || '',
    'Owner': p.owner || '',
    'Owner Substitute': p.ownerSubstitute || '',
    'Priority': p.criticality || '',
    'Financial Impact': p.financialImpact || '',
    'Financial Impact Reason': p.financialImpactDesc || '',
    'Operational Impact': p.operationalImpact || '',
    'Operational Impact Reason': p.operationalImpactDesc || '',
    'Legal Impact': p.legalImpact || '',
    'Legal Impact Reason': p.legalImpactDesc || '',
    'Reputational Impact': p.reputationalImpact || '',
    'Reputational Impact Reason': p.reputationalImpactDesc || '',
    'Impact 0–4h': p.timeImpact?.h4?.severity || '',
    'Impact 24h': p.timeImpact?.h24?.severity || '',
    'Impact 3 Days': p.timeImpact?.d3?.severity || '',
    'Impact 1 Week': p.timeImpact?.w1?.severity || '',
    'RTO': p.rto || '',
    'RPO': p.rpo || '',
    'MTPD': p.mtpd || p.mtd || '',
    'Risk Score': calcRiskScore(p),
    'Risk Level': getRiskLevel(calcRiskScore(p)),
    'Systems': (p.systems || []).map(s => s.name).join(', '),
    'Key People': (p.people || []).map(x => `${x.name}${x.role ? ` (${x.role})` : ''}`).join(', '),
    'Vendors': (p.vendors || []).map(v => v.name).join(', '),
    'Third Parties': (p.thirdParties || []).map(v => v.name).join(', '),
  }));

  const wb = XLSX.utils.book_new();

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [
    { wch: 4 }, { wch: 30 }, { wch: 40 }, { wch: 18 }, { wch: 18 },
    { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 12 },
    { wch: 14 }, { wch: 35 }, { wch: 14 }, { wch: 35 },
    { wch: 14 }, { wch: 35 }, { wch: 14 }, { wch: 35 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 14 }, { wch: 14 }, { wch: 14 },
    { wch: 12 }, { wch: 12 },
    { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'BIA Summary');

  const depsData = sorted.flatMap(p => {
    const rows = [];
    (p.systems || []).forEach(d => rows.push({ Process: p.name, Type: 'System', Name: d.name, Detail: d.notes || '', Criticality: d.criticality || '' }));
    (p.people || []).forEach(d => rows.push({ Process: p.name, Type: 'Person', Name: d.name, Detail: d.role || '', Criticality: d.criticality || '' }));
    (p.vendors || []).forEach(d => rows.push({ Process: p.name, Type: 'Vendor', Name: d.name, Detail: d.service || '', Criticality: d.criticality || '' }));
    (p.thirdParties || []).forEach(d => rows.push({ Process: p.name, Type: 'Third Party', Name: d.name, Detail: d.service || '', Criticality: d.criticality || '' }));
    return rows;
  });

  if (depsData.length > 0) {
    const wsDeps = XLSX.utils.json_to_sheet(depsData);
    wsDeps['!cols'] = [{ wch: 30 }, { wch: 14 }, { wch: 25 }, { wch: 30 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsDeps, 'Dependencies');
  }

  XLSX.writeFile(wb, 'BIA_Report.xlsx');
}
