import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import diagnosticService, { DiagnosticResult } from '../services/diagnosticService'
import DiagnosticReport from '../components/DiagnosticReport'

export default function DiagnosticDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null)

  useEffect(() => {
    if (id) {
      const diag = diagnosticService.getDiagnosticById(id)
      if (diag) {
        setDiagnostic(diag)
      }
    }
  }, [id])

  if (!diagnostic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Diagnostic non trouvé</p>
          <Link to="/history" className="text-blue-600 hover:underline mt-4 inline-block">
            Retour à l'historique         </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/history"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'historique
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <img
              src={diagnostic.imageData}
              alt={diagnostic.imageName}
              className="w-full rounded-xl shadow-lg"
            />
          </div>
          <div>
            <DiagnosticReport result={diagnostic} />
          </div>
        </div>
      </div>
    </div>
  )
}
