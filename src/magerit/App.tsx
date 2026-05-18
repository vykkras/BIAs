import { useState } from 'react';
import RisksPage from './components/risks/RisksPage';
import SafeguardsPage from './components/safeguards/SafeguardsPage';
import MappingsPage from './components/mappings/MappingsPage';

type Tab = 'dashboard' | 'assets' | 'risks' | 'safeguards' | 'mappings' | 'analysis' | 'reports';

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard',  label: 'Dashboard'   },
  { id: 'assets',     label: 'Activos'     },
  { id: 'risks',      label: 'Riesgos'     },
  { id: 'safeguards', label: 'Salvaguardas'},
  { id: 'mappings',   label: 'Mapeos'      },
  { id: 'analysis',   label: 'Análisis'    },
  { id: 'reports',    label: 'Informes'    },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('risks');

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* ── Topbar ── */}
      <header className="bg-slate-900 text-white shrink-0 flex items-stretch">
        {/* Back to portal */}
        <a
          href="/"
          className="flex items-center gap-2 px-4 border-r border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors shrink-0 text-xs font-medium"
          title="Team Tools"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Team Tools
        </a>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 border-r border-slate-700 shrink-0">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-sm font-black">M</div>
          <div>
            <p className="text-sm font-bold leading-tight tracking-tight">MAGERIT Risk</p>
            <p className="text-[11px] text-slate-400 leading-tight">Libro II · Catálogo de Elementos v3</p>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex flex-1 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-4 text-[13px] font-semibold tracking-wide transition-all border-b-[3px] whitespace-nowrap ${
                tab === t.id
                  ? 'border-red-500 text-white bg-slate-800'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* ── Contenido ── */}
      <main className="flex-1 overflow-hidden">
        {tab === 'risks'      && <RisksPage />}
        {tab === 'safeguards' && <SafeguardsPage />}
        {tab === 'mappings'   && <MappingsPage />}
        {tab !== 'risks' && tab !== 'safeguards' && tab !== 'mappings' && (
          <div className="flex items-center justify-center h-full flex-col gap-2">
            <p className="text-base font-semibold text-slate-400">
              {TABS.find(t => t.id === tab)?.label}
            </p>
            <p className="text-sm text-slate-300">Próximamente</p>
          </div>
        )}
      </main>
    </div>
  );
}
