import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface PhotoManagerProps {
  photos: string[]
  onAdd: (photoUrl: string) => void
  onDelete: (photoUrl: string) => void
}

export default function PhotoManager({ photos, onAdd, onDelete }: PhotoManagerProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(url)
    setUrl('')
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded flex gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
          placeholder="URL de la photo"
          required
        />
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          Ajouter photo
        </button>
      </form>

      <div className="grid grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative group">
            <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-48 object-cover rounded" />
            <button
              onClick={() => onDelete(photo)}
              className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
