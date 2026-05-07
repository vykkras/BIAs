import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const KEY = 'bia_companies';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

function persist(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function useCompanies() {
  const [companies, setCompanies] = useState(load);

  const save = useCallback((list) => { persist(list); setCompanies(list); }, []);

  const addCompany = useCallback((data) => {
    const c = { ...data, id: uuidv4(), createdAt: new Date().toISOString() };
    save([...companies, c]);
    return c;
  }, [companies, save]);

  const updateCompany = useCallback((id, data) => {
    save(companies.map(c => c.id === id ? { ...c, ...data } : c));
  }, [companies, save]);

  const deleteCompany = useCallback((id) => {
    save(companies.filter(c => c.id !== id));
  }, [companies, save]);

  return { companies, addCompany, updateCompany, deleteCompany };
}
