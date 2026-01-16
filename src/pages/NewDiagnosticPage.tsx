import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ImageUploader from '../components/ImageUploader'
import DiagnosticReport from '../components/DiagnosticReport'
import diagnosticService, { DiagnosticResult } from '../services/diagnosticService'

export default function NewDiagnosticPage() {
  const navigate = useNavigate()
  const [currentResult, setCurrentResult] = useState<DiagnosticResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleImageSelect = async (file: File, preview: string) => {
    setIsAnalyzing(true)
    try {
      const result = await diagnosticService.analyzeBoardImage(preview, file.name)
      setCurrentResult(result)
    } catch (error) {
      console.error('Erreur d\'analyse:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Nouveau diagnostic</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ImageUploader onImageSelect={handleImageSelect} maxSizeMB={10} />
            
            {isAnalyzing && (
              <div className="mt-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-600">Analyse en cours...</p>
              </div>
            )}
          </div>

          <div>
            {currentResult && !isAnalyzing && (
              <>
                <DiagnosticReport result={currentResult} />
                <button
                  onClick={() => navigate('/history')}
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Voir l'historique
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
