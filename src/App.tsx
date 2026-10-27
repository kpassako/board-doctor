import { useEffect, useRef, useState } from 'react';
import { History, Microscope, Wrench } from 'lucide-react';
import DiagnosisForm from './components/DiagnosisForm';
import DiagnosticReport from './components/DiagnosticReport';
import HistoryList from './components/HistoryList';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import PWAUpdateNotification from './components/PWAUpdateNotification';
import {
  clearDiagnosisHistory,
  deleteDiagnosis,
  getDiagnosisHistory,
  type DiagnosisRecord,
} from './services/diagnosticService';

type Tab = 'diagnostic' | 'history';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('diagnostic');
  const [currentRecord, setCurrentRecord] = useState<DiagnosisRecord | null>(null);
  const [history, setHistory] = useState<DiagnosisRecord[]>(getDiagnosisHistory);
  const [selectedRecord, setSelectedRecord] = useState<DiagnosisRecord | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const shownRecord = activeTab === 'diagnostic' ? currentRecord : selectedRecord;

  // Sur mobile, le rapport s'affiche sous le formulaire : on le fait défiler à l'écran.
  useEffect(() => {
    if (shownRecord && window.matchMedia('(max-width: 1023px)').matches) {
      reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [shownRecord]);

  const handleResult = (record: DiagnosisRecord) => {
    setCurrentRecord(record);
    setHistory(getDiagnosisHistory());
  };

  const handleDelete = (id: string) => {
    deleteDiagnosis(id);
    setHistory(getDiagnosisHistory());
    if (selectedRecord?.id === id) setSelectedRecord(null);
    if (currentRecord?.id === id) setCurrentRecord(null);
  };

  const handleClear = () => {
    clearDiagnosisHistory();
    setHistory([]);
    setSelectedRecord(null);
    setCurrentRecord(null);
  };

  const tabClass = (tab: Tab) =>
    `inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <PWAUpdateNotification />
      <PWAInstallPrompt />

      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="bg-blue-600 p-2 rounded-lg shrink-0">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-gray-900">Board Doctor</h1>
                <p className="text-sm text-gray-500 truncate">Diagnostic de cartes électroniques par IA</p>
              </div>
            </div>

            <nav className="flex space-x-2 shrink-0" aria-label="Sections">
              <button type="button" onClick={() => setActiveTab('diagnostic')} className={tabClass('diagnostic')}>
                <Microscope className="w-5 h-5" />
                <span className="hidden sm:inline">Diagnostic</span>
              </button>
              <button type="button" onClick={() => setActiveTab('history')} className={tabClass('history')}>
                <History className="w-5 h-5" />
                <span className="hidden sm:inline">Historique</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            {activeTab === 'diagnostic' ? (
              <DiagnosisForm onResult={handleResult} />
            ) : (
              <HistoryList
                records={history}
                selectedId={selectedRecord?.id ?? null}
                onSelect={setSelectedRecord}
                onDelete={handleDelete}
                onClear={handleClear}
              />
            )}
          </div>

          <div ref={reportRef} className="scroll-mt-4">
            {shownRecord ? (
              <DiagnosticReport record={shownRecord} />
            ) : (
              <div className="hidden lg:block rounded-xl border-2 border-dashed border-gray-200 p-10 text-center text-gray-400">
                {activeTab === 'diagnostic'
                  ? 'Le rapport de diagnostic apparaîtra ici.'
                  : 'Sélectionnez un diagnostic pour le revoir.'}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
          <p>Board Doctor v1.1.0 · Thor Technologie</p>
          <p className="mt-1">L'IA assiste le technicien : chaque conclusion se confirme par la mesure.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
