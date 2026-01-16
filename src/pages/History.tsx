import { Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export default function History() {
  const diagnostics = [
    {
      id: 1,
      date: '2024-01-15 08:30',
      board: 'Carte mère Asus',
      status: 'defect',
      issue: 'Condensateur C47 gonflé',
      confidence: 94
    },
    {
      id: 2,
      date: '2024-01-14 15:22',
      board: 'Alimentation ATX',
      status: 'healthy',
      issue: 'Aucun problème détecté',
      confidence: 98
    },
    {
      id: 3,
      date: '2024-01-14 10:15',
      board: 'Carte graphique',
      status: 'warning',
      issue: 'Traces de corrosion légères',
      confidence: 87
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'defect':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      healthy: 'bg-green-100 text-green-800',
      warning: 'bg-orange-100 text-orange-800',
      defect: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      healthy: 'Sain',
      warning: 'Attention',
      defect: 'Défectueux'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Historique des Diagnostics</h1>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="w-5 h-5" />
            <span className="text-sm">{diagnostics.length} diagnostics</span>
          </div>
        </div>

        <div className="space-y-4">
          {diagnostics.map((diag) => (
            <div 
              key={diag.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="mt-1">
                    {getStatusIcon(diag.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{diag.board}</h3>
                      {getStatusBadge(diag.status)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{diag.issue}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{diag.date}</span>
                      </span>
                      <span>Confiance: {diag.confidence}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {diagnostics.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun diagnostic</h3>
          <p className="text-gray-600">Commencez par analyser votre première carte électronique</p>
        </div>
      )}
    </div>
  );
}