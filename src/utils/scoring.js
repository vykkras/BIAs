export const IMPACT_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

export const IMPACT_SCORES = { Low: 1, Medium: 2, High: 3, Critical: 4 };

const RISK_COLORS = {
  Low: '#16a34a',
  Medium: '#d97706',
  High: '#ea580c',
  Critical: '#dc2626',
};

const RISK_BG = {
  Low: '#dcfce7',
  Medium: '#fef3c7',
  High: '#ffedd5',
  Critical: '#fee2e2',
};

export function calcImpactScore(process) {
  const scores = [
    IMPACT_SCORES[process.financialImpact] || 0,
    IMPACT_SCORES[process.operationalImpact] || 0,
    IMPACT_SCORES[process.legalImpact] || 0,
    IMPACT_SCORES[process.reputationalImpact] || 0,
  ];
  return Math.max(...scores);
}

export function calcRiskScore(process) {
  const impact = calcImpactScore(process);
  return impact * (process.likelihood || 1);
}

export function getRiskLevel(riskScore) {
  if (riskScore <= 4) return 'Low';
  if (riskScore <= 8) return 'Medium';
  if (riskScore <= 12) return 'High';
  return 'Critical';
}

export function getRiskColor(level) {
  return RISK_COLORS[level] || RISK_COLORS.Low;
}

export function getRiskBg(level) {
  return RISK_BG[level] || RISK_BG.Low;
}
