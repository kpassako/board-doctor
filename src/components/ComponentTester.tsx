import { useState } from 'react'
import { Component } from '../types'

interface ComponentTesterProps {
  component: Component
  onTestComplete: (status: 'ok' | 'faulty') => void
}

export default function ComponentTester({ component, onTestComplete }: ComponentTesterProps) {
  const [testResult, setTestResult] = useState<'ok' | 'faulty' | null>(null)

  const handleTest = (result: 'ok' | 'faulty') => {
    setTestResult(result)
    onTestComplete(result)
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Test: {component.name}</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type: {component.type}
          </label>
          {component.value && (
            <p className="text-sm text-gray-600">Valeur: {component.value}</p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => handleTest('ok')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
              testResult === 'ok'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 hover:bg-green-50 text-gray-700'
            }`}
          >
            ✓ OK
          </button>
          <button
            onClick={() => handleTest('faulty')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
              testResult === 'faulty'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 hover:bg-red-50 text-gray-700'
            }`}
          >
            Défectueux
          </button>
        </div>
      </div>
    </div>
  )
}
