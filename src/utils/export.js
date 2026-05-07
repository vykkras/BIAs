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

export function exportPDF(processes) {
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
    head: [['#', 'Process', 'Dept', 'Owner', 'Financial', 'Operational', 'Legal', 'Reputational', 'RTO', 'RPO', 'MTD', 'Likelihood', 'Risk Score', 'Risk Level']],
    body: sorted.map((p, i) => {
      const rs = calcRiskScore(p);
      const rl = getRiskLevel(rs);
      return [
        i + 1, p.name, p.department || '', p.owner || '',
        p.financialImpact || '', p.operationalImpact || '',
        p.legalImpact || '', p.reputationalImpact || '',
        p.rto || '', p.rpo || '', p.mtd || '',
        p.likelihood || 1, rs, rl,
      ];
    }),
    styles: { fontSize: 7.5, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 32 } },
    didParseCell(data) {
      if (data.column.index === 13 && data.section === 'body') {
        const rgb = RISK_RGB[data.cell.raw];
        if (rgb) {
          data.cell.styles.fillColor = rgb;
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  if (finalY < 180) {
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text('Process Details', 14, finalY);

    let y = finalY + 8;
    for (const p of sorted) {
      if (y > 185) { doc.addPage(); y = 14; }
      const rs = calcRiskScore(p);
      const rl = getRiskLevel(rs);
      const rgb = RISK_RGB[rl] || [22, 163, 74];

      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`${p.name}`, 14, y);
      doc.setFontSize(8);
      doc.setTextColor(...rgb);
      doc.text(`Risk: ${rl} (${rs})`, 180, y, { align: 'right' });
      y += 5;

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      if (p.description) {
        const lines = doc.splitTextToSize(p.description, 250);
        doc.text(lines, 14, y);
        y += lines.length * 4 + 2;
      }

      const details = [
        p.rto && `RTO: ${p.rto}`,
        p.rpo && `RPO: ${p.rpo}`,
        p.mtd && `MTD: ${p.mtd}`,
        p.likelihood && `Likelihood: ${p.likelihood}/5`,
      ].filter(Boolean).join('   |   ');

      if (details) {
        doc.text(details, 14, y);
        y += 6;
      }
      y += 3;
    }
  }

  doc.save('BIA_Report.pdf');
}

export function exportExcel(processes) {
  const sorted = [...processes].sort((a, b) => b.riskScore - a.riskScore);

  const summaryData = sorted.map((p, i) => ({
    '#': i + 1,
    'Process Name': p.name,
    'Description': p.description || '',
    'Department': p.department || '',
    'Owner': p.owner || '',
    'Criticality': p.criticality || '',
    'Financial Impact': p.financialImpact || '',
    'Operational Impact': p.operationalImpact || '',
    'Legal Impact': p.legalImpact || '',
    'Reputational Impact': p.reputationalImpact || '',
    'Impact 0–4h': p.timeImpact?.h4?.severity || '',
    'Impact 24h': p.timeImpact?.h24?.severity || '',
    'Impact 3 Days': p.timeImpact?.d3?.severity || '',
    'Impact 1 Week': p.timeImpact?.w1?.severity || '',
    'RTO': p.rto || '',
    'RPO': p.rpo || '',
    'MTD': p.mtd || '',
    'Likelihood (1–5)': p.likelihood || '',
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
    { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
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
