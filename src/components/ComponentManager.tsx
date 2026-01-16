import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Component } from '../types'

interface ComponentManagerProps {
  components: Component[]
  onAdd: (component: Omit<Component, 'id'>) => void
  onDelete: (id: string) => void
  onUpdateStatus: (id: string, status: Component['status']) => void
}

export default function ComponentManager({ components, onAdd, onDelete, onUpdateStatus }: ComponentManagerProps) {
  const [reference, setReference] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState<Component['type']>('resistor')
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      reference,
      name,
      type,
      value,
      status: 'unknown'
    })
    setReference('')
    setName('')
    setType('resistor')
    setValue('')
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded space-y-3">
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Ex: U1, C42"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Ex: MOSFET principal"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Component['type'])}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="resistor">Résistance</option>
              <option value="capacitor">Condensateur</option>
              <option value="ic">Circuit intégré</option>
              <option value="mosfet">MOSFET</option>
              <option value="diode">Diode</option>
              <option value="inductor">Inductance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valeur</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Ex: 10kΩ, 100µF"
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Ajouter composant
        </button>
      </form>

      <div className="space-y-2">
        {components.map((comp) => (
          <div key={comp.id} className="bg-white border rounded p-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold">{comp.reference}</span>
                <span className="text-gray-600 ml-2">{comp.name}</span>
                <div className="text-sm text-gray-500">
                  {comp.type} {comp.value && `- ${comp.value}`}
                </div>
              </div>
              <button
                onClick={() => onDelete(comp.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdateStatus(comp.id, 'good')}
                className={`px-3 py-1 rounded text-sm ${comp.status === 'good' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
              >
                ✓ OK
              </button>
              <button
                onClick={() => onUpdateStatus(comp.id, 'suspect')}
                className={`px-3 py-1 rounded text-sm ${comp.status === 'suspect' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
              >
                ⚠ Suspect
              </button>
              <button
                onClick={() => onUpdateStatus(comp.id, 'faulty')}
                className={`px-3 py-1 rounded text-sm ${comp.status === 'faulty' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
              >
                ✗ Défectueux
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}