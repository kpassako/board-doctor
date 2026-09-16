import { AlertTriangle, CheckCircle, XCircle, Wrench } from 'lucide-react';
import { DiagnosticResult } from '../services/diagnosticService';

interface DiagnosticReportProps {
  result: DiagnosticResult;
}

export default function DiagnosticReport({ result }: DiagnosticReportProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6 card-hover animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Rapport de diagnostic</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium animate-pop-in ${
          result.overallStatus === 'critical' ? 'bg-red-100 text-red-700' :
          result.overallStatus === 'warning' ? 'bg-orange-100 text-orange-700' :
          'bg-green-100 text-green-700'
        }`}>
          {result.overallStatus === 'critical' ? 'Critique' :
           result.overallStatus === 'warning' ? 'Attention' : 'Bon état'}
        </span>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Défauts détectés ({result.defects.length})
        </h3>
        <div className="space-y-3">
      {result.defects.map((defect, index) => (
            <div
              key={index}
              style={{ animationDelay: `${120 + index * 110}ms` }}
              className={`border rounded-lg p-4 animate-fade-in-up transition-all duration-300
                hover:-translate-y-0.5 hover:shadow-md ${getSeverityColor(defect.severity)}`}
            >
              <div className="flex items-start space-x-3">
                <span className="mt-0.5 animate-pop-in" style={{ animationDelay: `${220 + index * 110}ms` }}>
                  {getSeverityIcon(defect.severity)}
                </span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{defect.type}</h4>
                  <p className="text-sm text-gray-600 mt-1">{defect.description}</p>
                  {defect.location && (
                    <p className="text-xs text-gray-500 mt-2">
                      📍 Position: {defect.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {result.defects.length === 0 && (
            <div className="text-center py-8 text-gray-500 animate-fade-in">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500 animate-pop-in" />
              <p>Aucun défaut détecté</p>
            </div>
          )}
        </div>
      </div>

      {result.recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Wrench className="w-5 h-5 mr-2 text-blue-600" />
            Recommandations
          </h3>
          <ul className="space-y-2">
            {result.recommendations.map((rec, index) => (
              <li
                key={index}
                style={{ animationDelay: `${300 + index * 90}ms` }}
                className="flex items-start space-x-2 animate-fade-in-up"
              >
                <span className="text-blue-600 font-bold">•</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
        <p>📅 {new Date(result.timestamp).toLocaleString('fr-FR')}</p>
        <p>📎 {result.imageName}</p>
      </div>
    </div>
  );
}
