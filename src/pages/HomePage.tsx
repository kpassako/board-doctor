import { Link } from 'react-router-dom'
import { PlusCircle, History, TrendingUp, Wrench } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Board Doctor
        </h1>
        <p className="text-xl text-gray-600">
          Assistant de diagnostic électronique professionnel
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link
          to="/new"
          className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-8 text-white hover:shadow-xl transition-all hover:scale-105"
        >
          <PlusCircle className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-2xl font-bold mb-2">Nouveau Diagnostic</h2>
          <p className="text-blue-100">
            Démarrer un nouveau diagnostic de carte ectronique
          </p>
        </Link>

        <Link
          to="/history"
          className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-8 text-white hover:shadow-xl transition-all hover:scale-105"
        >
          <History className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-2xl font-bold mb-2">Historique</h2>
          <p className="text-purple-100">
            Consulter les diagnostics précédents
          </p>
        </Link>

        <Link
          to="/analytics"
          className="group bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-8 text-white hover:shadow-xl transition-all hover:scale-105"
        >
          <TrendingUp className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-2xl font-bold mb-2">Statistiques</h2>
          <p className="text-green-100">
            Analyser les tendances de pannes
          </p>
        </Link>

        <div className="gup bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-8 text-white">
          <Wrench className="w-12 h-12 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Outils</h2>
          <p className="text-gray-100">
            Calculateurs et références techniques
          </p>
        </div>
      </div>

      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          💡 Fonctionnalités
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li>✓ Analyse photo de PCB avec détection de composants</li>
          <li>✓ Import de schémas PDF</li>
          <li>✓ Tests guidés par composant</li>
          <li>✓ Mesures multimètre intégrées</li>
          <li>✓ Export de rapports détaillés</li>
        </ul>
      </div>
    </div>
  )
}
