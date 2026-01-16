import { BarChart3, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Statistics() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total diagnostics</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">127</p>
            </div>
            <BarChart3 className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Problèmes détectés</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">42</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cartes saines</p>
              <p className="text-3xl font-bold text-green-600 mt-2">85</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Précision moyenne</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">93%</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Composants les plus analysés</h2>
        <div className="space-y-4">
          {['Condensateurs', 'Résistances', 'Circuits intégrés', 'Transistors'].map((comp, i) => (
            <div key={comp} className="flex items-center justify-between">
              <span className="text-gray-700">{comp}</span>
              <div className="flex items-center space-x-3">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${85 - i * 15}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{85 - i * 15}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}