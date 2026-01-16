import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { VoltageRail } from '../types'

interface VoltageRailManagerProps {
  rails: VoltageRail[]
  onAdd: (rail: Omit<VoltageRail, 'id'>) => void
  onDelete: (id: string) => void
}

export default function VoltageRailManager({ rails, onAdd, onDelete }: VoltageRailManagerProps) {
  const [name, setName] = useState('')
  const [voltage, setVoltage] = useState('')
  const [tolerance, setTolerance] = useState('5')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      name,
      expectedVoltage: parseFloat(voltage),
      tolerance: parseFloat(tolerance),
      testPoints: []
    })
    setName('')
    setVoltage('')
    setTolerance('5')
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du rail</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Ex: VCC, 3.3V, 5V"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tension (V)</label>
            <input
              type="number"
              step="0.1"
              value={voltage}
              onChange={(e) => setVoltage(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Ex: 3.3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tolérance (%)</label>
            <input
              type="number"
              step="0.1"
              value={tolerance}
              onChange={(e) => setTolerance(e.target.value)}
             className="w-full border rounded px-3 py-2"
              placeholder="Ex: 5"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Ajouter rail
        </button>
      </form>

      <div className="grid gap-3">
        {rails.map((rail) => (
          <div key={rail.id} className="bg-white border rounded p-4 flex justify-between items-center">
            <div>
              <span className="font-bold text-lg">{rail.name}</span>
              <span className="text-gray-600 ml-3">{rail.expectedVoltage}V ±{rail.tolerance}%</span>
            </div>
            <button
              onClick={() => onDelete(rail.id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
     </div>
    </div>
  )
}
