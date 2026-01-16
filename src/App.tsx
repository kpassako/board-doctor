import { useState } from 'react';
import { Wrench, History, Info } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <PWAUpdateNotification />
      <PWAInstallPrompt />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Board Doctor</h1>
                <p className="text-sm text-gray-500">Diagnostic de cartes électroniques</p>
              </div>
            </div>
            
           <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Wrench className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'history'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-blue-600" />
                Analyser une carte
              </h2>
              
              <ImageUploader onImageSelect={handleImageSelect} maxSizeMB={10} />
              
              {isAnalyzing && (
                <div className="mt-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-600">Analyse en cours...</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div>
            {currentResult && !isAnalyzing && (
              <DiagnosticReport result={currentResult} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
          <p>Board Doctor v1.0.0 - PWA Ready 📱</p>
          <p className="mt-1">Diagnostic intelligent de cartes électroniques</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
