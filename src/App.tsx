import { useState } from 'react';
import { Wrench, History, Info, ScanLine } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import DiagnosticReport from './components/DiagnosticReport';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import PWAUpdateNotification from './components/PWAUpdateNotification';
import { analyzeBoardImage, DiagnosticResult } from './services/diagnosticService';

function App() {
  const [currentResult, setCurrentResult] = useState<DiagnosticResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');

  const handleImageSelect = async (file: File, preview: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeBoardImage(preview, file.name);
      setCurrentResult(result);
    } catch (error) {
      console.error('Erreur d\'analyse:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const tabClasses = (tab: 'upload' | 'history') =>
    `px-4 py-2 rounded-lg press transition-all duration-300 ${
      activeTab === tab
        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 bg-[length:200%_200%] animate-gradient-pan">
      <PWAUpdateNotification />
      <PWAInstallPrompt />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 animate-fade-in-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {isAnalyzing && (
                  <span className="absolute inset-0 rounded-lg bg-blue-500 animate-pulse-ring" />
                )}
                <div className="relative bg-blue-600 p-2 rounded-lg transition-transform duration-500 hover:rotate-12 hover:scale-110">
                  <Wrench
                    className={`w-6 h-6 text-white ${isAnalyzing ? 'animate-spin' : ''}`}
                  />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Board Doctor</h1>
                <p className="text-sm text-gray-500">Diagnostic de cartes électroniques</p>
              </div>
            </div>

           <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('upload')}
                className={tabClasses('upload')}
              >
                <Wrench className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={tabClasses('history')}
              >
                <History className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel */}
          <div className="space-y-6">
            <div className="relative overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200 p-6 card-hover animate-fade-in-up">
              {/* Ligne de scan pendant l'analyse */}
              {isAnalyzing && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="h-24 w-full bg-gradient-to-b from-transparent via-blue-400/25 to-transparent animate-scan" />
                </div>
              )}

              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-blue-600" />
                Analyser une carte
              </h2>

              <ImageUploader onImageSelect={handleImageSelect} maxSizeMB={10} />

              {isAnalyzing && (
                <div className="mt-6 text-center animate-fade-in">
                  <div className="relative inline-flex items-center justify-center">
                    <span className="absolute h-10 w-10 rounded-full bg-blue-400/40 animate-pulse-ring" />
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-100 border-b-blue-600"></div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 flex items-center justify-center gap-2">
                    <ScanLine className="w-4 h-4 text-blue-600 animate-pulse" />
                    Analyse en cours...
                  </p>
                  {/* Barre de progression indéterminée */}
                  <div className="relative mt-3 mx-auto h-1 w-40 overflow-hidden rounded-full bg-blue-100">
                    <div className="shimmer-overlay" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div>
            {currentResult && !isAnalyzing && (
              <DiagnosticReport key={currentResult.id} result={currentResult} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-gray-200 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
          <p>Board Doctor v1.0.0 - PWA Ready 📱</p>
          <p className="mt-1">Diagnostic intelligent de cartes électroniques</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
