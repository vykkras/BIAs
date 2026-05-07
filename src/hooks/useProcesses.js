import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getProcesses, saveProcesses } from '../utils/storage';
import { calcImpactScore, calcRiskScore, getRiskLevel } from '../utils/scoring';

function enrich(p) {
  const impactScore = calcImpactScore(p);
  const riskScore = calcRiskScore(p);
  return { ...p, impactScore, riskScore, riskLevel: getRiskLevel(riskScore) };
}

export function useProcesses() {
  const [processes, setProcesses] = useState(() => getProcesses().map(enrich));

  const persist = useCallback((procs) => {
    saveProcesses(procs);
    setProcesses(procs.map(enrich));
  }, []);

  const addProcess = useCallback((data) => {
    const p = { ...data, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    persist([...processes, p]);
    return p;
  }, [processes, persist]);

  const updateProcess = useCallback((id, data) => {
    persist(processes.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p));
  }, [processes, persist]);

  const deleteProcess = useCallback((id) => {
    persist(processes.filter(p => p.id !== id));
  }, [processes, persist]);

  return { processes, addProcess, updateProcess, deleteProcess };
}
