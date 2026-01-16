import { useEffect, useState } from 'react'
import { TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { db } from '../lib/db'
import { Diagnostic } from '../types'

export default function AnalyticsPage() {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([])

  useEffect(() => {
    loadDiagnostics()
  }, [])

  const loadDiagnostics = async () => {
    const allDiags = await db.diagnostics.toArray()
    setDiagnostics(allDiags)
  }

  const stats = {
    total: diagnostics.length,
    completed: diagnostics.filter(d => d.status === 'completed').length,
    inProgress: diagnostics.filter(d => d.status === 'in-progress').length,
    archived: diagnostics.filter(d => d.status === 'archived').length
  }

  const recentDiagnostics = diagnostics
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Terminés</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">En cours</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Échoués</p>
              <p className="text-3xl font-bold text-red-600">{stats.archived}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Diagnostics récents</h2>
        <div className="space-y-3">
          {recentDiagnostics.map(diag => (
            <div key={diag.id} className="border-b pb-3 last:border-0">
              <p className="font-medium">{diag.title || diag.deviceType}</p>
              <p className="text-sm text-gray-600">{new Date(diag.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}