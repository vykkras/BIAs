import { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import CompanyList from './components/Companies/CompanyList';
import ProcessList from './components/Processes/ProcessList';
import ProcessForm from './components/Processes/ProcessForm';
import ReportView from './components/Report/ReportView';
import HelpPage from './components/Help/HelpPage';
import { useProcesses } from './hooks/useProcesses';
import { useCompanies } from './hooks/useCompanies';
import styles from './App.module.css';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [editing, setEditing] = useState(null);
  const [activeCompanyId, setActiveCompanyId] = useState(null); // null = corporate view

  const { processes: allProcesses, addProcess, updateProcess, deleteProcess } = useProcesses();
  const { companies, addCompany, updateCompany, deleteCompany } = useCompanies();

  const activeCompany = companies.find(c => c.id === activeCompanyId) || null;
  const scopedProcesses = activeCompanyId
    ? allProcesses.filter(p => p.companyId === activeCompanyId)
    : allProcesses;

  function handleEdit(process) { setEditing(process); setPage('form'); }
  function handleNew() { setEditing(null); setPage('form'); }

  function handleSave(data) {
    const payload = activeCompanyId ? { ...data, companyId: activeCompanyId } : data;
    if (editing) updateProcess(editing.id, payload);
    else addProcess(payload);
    setEditing(null);
    setPage('processes');
  }

  function handleCancel() { setEditing(null); setPage('processes'); }

  function handleDeleteCompany(id) {
    const count = allProcesses.filter(p => p.companyId === id).length;
    const msg = count > 0
      ? `Delete this company and its ${count} process${count !== 1 ? 'es' : ''}?`
      : 'Delete this company?';
    if (!confirm(msg)) return;
    if (count > 0) {
      allProcesses.filter(p => p.companyId === id).forEach(p => deleteProcess(p.id));
    }
    deleteCompany(id);
    if (activeCompanyId === id) setActiveCompanyId(null);
  }

  function handleSwitchCompany(id) {
    setActiveCompanyId(id);
    setPage('dashboard');
  }

  return (
    <div className={styles.app}>
      <Sidebar
        activePage={page}
        onNavigate={setPage}
        companies={companies}
        activeCompanyId={activeCompanyId}
        onSwitchCompany={setActiveCompanyId}
      />
      <main className={styles.main}>
        {page === 'dashboard' && (
          <Dashboard
            processes={scopedProcesses}
            allProcesses={allProcesses}
            companies={companies}
            activeCompany={activeCompany}
            onNavigate={setPage}
            onNew={handleNew}
            onSwitchCompany={handleSwitchCompany}
          />
        )}
        {page === 'companies' && (
          <CompanyList
            companies={companies}
            allProcesses={allProcesses}
            activeCompanyId={activeCompanyId}
            onAdd={addCompany}
            onUpdate={updateCompany}
            onDelete={handleDeleteCompany}
            onSwitch={handleSwitchCompany}
          />
        )}
        {page === 'processes' && (
          <ProcessList
            processes={scopedProcesses}
            companies={companies}
            activeCompanyId={activeCompanyId}
            onNew={handleNew}
            onEdit={handleEdit}
            onDelete={deleteProcess}
          />
        )}
        {page === 'form' && (
          <ProcessForm
            initial={editing}
            companies={companies}
            activeCompanyId={activeCompanyId}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
        {page === 'report' && (
          <ReportView
            processes={scopedProcesses}
            allProcesses={allProcesses}
            companies={companies}
            activeCompany={activeCompany}
          />
        )}
        {page === 'help' && <HelpPage />}
      </main>
    </div>
  );
}
