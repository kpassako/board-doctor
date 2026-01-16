import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Measurement } from '../types'

interface MeasurementManagerProps {
  measurements: Measurement[]
  onAdd: (measurement: Omit<Measurement, 'id' | 'timestamp'>) => void
  onDelete: (id: string) => void
}

export default function MeasurementManager({ measurements, onAdd, onDelete }: MeasurementManagerProps) {
  const [componentId, setComponentId] = useState('')
  const [point, setPoint] = useState('')
  const [value, setValue] = useState('')
  const [unit, setUnit] = useState('V')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      componentId,
      point,
      value: parseFloat(value),
      unit
    })
    setComponentId('')
    setPoint('')
    setValue('')
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded space-y-3">
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Composant ID</label>
            <input
              type="text"
              value={componentId}
              onChange={(e) => setComponentId(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Ex: U1, R12"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Point de test</label>
            <input
              type="text"
              value={point}
              onChange={(e) => setPoint(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Ex: TP1, VCC"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valeur</label>
            <input
              type="number"
              step="0.001"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Ex: 3.3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="V">V (Volt)</option>
              <option value="mV">mV (Millivolt)</option>
              <option value="A">A (Ampère)</option>
              <option value="mA">mA (Milliampère)</option>
              <option value="Ω">Ω (Ohm)</option>
              <option value="kΩ">kΩ (Kiloohm)</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded flex items-center gaer:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Ajouter mesure
        </button>
      </form>

      <div className="space-y-2">
        {measurements.map((m) => (
          <div key={m.id} className="bg-white border rounded p-3 flex justify-between items-center">
            <div>
              <span className="font-bold text-gray-800">{m.componentId}</span>
              <span className="text-gray-600 mx-2">→</span>
              <span className="font-medium">{m.point}</span>: {m.value.toFixed(3)} {m.unit}
              <span className="text-sm text-gray-500 ml-3">
                {new Date(m.timestamp).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => onDelete(m.id)}
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
