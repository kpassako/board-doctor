import { Link } from 'react-router-dom'
import { Camera, Zap, Shield, TrendingUp, Wrench, ArrowRight } from 'lucide-react'

export default function Home() {
  const mockDefects = [
    {
      type: 'Condensateur bombé',
      severity: 'critical' as const,
      description: 'Condensateur électrolytique C12 présentant un bombement',
      location: 'C12',
      confidence: 0.92
    },
    {
      type: 'Trace brûlée',
      severity: 'warning' as const,
      description: 'Trace de circuit imprimé avec décoloration',
      location: 'Zone U3',
      confidence: 0.78
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-2xl">
              <Camera className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Board Doctor
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Diagnostiquez vos cartes électroniques défectueuses grâce à l'intelligence artificielle.
            Identifiez rapidement les composants endommagés et obtenez des recommandations de réparation.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/new"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 text-lg font-semibold shadow-lg"
            >
              Commencer un diagnostic
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/history"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors border-2 border-blue-600 text-lg font-semibold"
            >
              Voir l'historique
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Exemple de diagnostic
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <Camera className="w-24 h-24 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Image de carte électronique analysée
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Défauts détectés
              </h3>
              <div className="space-y-4">
                {mockDefects.map((defect, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-semibold text-gray-900">
                        {defect.type}
                      </span>
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          defect.severity === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : defect.severity === 'warning'
                            ? 'text-orange-500'
                            : 'text-blue-500'
                        }`}
                      >
                        {defect.severity === 'critical' ? 'Critique' : 'Attention'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {defect.description}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>📍 {defect.location}</span>
                      <span>Confiance: {Math.round(defect.confidence * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Analyse instantanée
            </h3>
            <p className="text-gray-600">
              Téléchargez une photo et obtenez un diagnostic complet en quelques secondes
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Détection précise
            </h3>
            <p className="text-gray-600">
              Algorithmes de détection précis pour identifier composants défectueux et traces endommagées
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Recommandations experts
            </h3>
            <p className="text-gray-600">
              Suggestions de réparation détaillées avec références de composants et procédures
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-start gap-6">
            <Wrench className="w-12 h-12 text-blue-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Comment ça marche ?
              </h2>
              <ol className="space-y-4 text-gray-600">
                <li className="flex gap-3">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">1</span>
                  <span>Prenez une photo claire de votre carte électronique</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">2</span>
                  <span>L'IA analyse l'image et détecte les anomalies</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">3</span>
                  <span>Recevez un rapport détaillé avec recommandations de réparation</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}