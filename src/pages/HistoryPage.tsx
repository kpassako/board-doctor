import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import { getDiagnosticHistory, deleteDiagnostic, DiagnosticResult } from '../services/diagnosticService'

export default function HistoryPage() {
  const [history, setHistory] = useState<DiagnosticResult[]>([])

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = () => {
    const data = getDiagnosticHistory()
    setHistory(data)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce diagnostic ?')) {
      deleteDiagnostic(id)
      loadHistory()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Historique des diagnostics</h1>
        <Link
            to="/new"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Nouveau diagnostic
          </Link>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun diagnostic</h2>
            <p className="text-gray-600 mb-6">Commencez par créer votre premier diagnostic de carte électronique.</p>
            <Link
              to="/new"
              className="text-blue-600 hover:underline"
            >
              Créer votre premier diagnostic
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((diag) => (
              <div
                key={diag.id}
                className="white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <img
                  src={diag.imageData}
                  alt={diag.imageName}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(diag.timestamp).toLocaleDateString('fr-FR')}
                    </span>
                    {diag.overallStatus === 'critical' ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">
                    {diag.imageName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {diag.defects.length} défaut(s) détecté(s)
                  </p>
                  <div className="flex gap-2">
                    <Link
                      to={`/diagnostic/${diag.id}`}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                    >
                      Voir détails
                    </Link>
                    <button
                      onClick={() => handleDelete(diag.id)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
