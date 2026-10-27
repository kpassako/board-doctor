import { ChevronRight, Cpu, Trash2 } from 'lucide-react';
import type { DiagnosisRecord } from '../services/diagnosticService';

interface HistoryListProps {
  records: DiagnosisRecord[];
  selectedId: string | null;
  onSelect: (record: DiagnosisRecord) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

const STATUS_DOT: Record<DiagnosisRecord['diagnosis']['overallStatus'], string> = {
  critical: 'bg-red-500',
  warning: 'bg-orange-500',
  good: 'bg-green-500',
  inconclusive: 'bg-gray-400',
};

export default function HistoryList({ records, selectedId, onSelect, onDelete, onClear }: HistoryListProps) {
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
        <Cpu className="w-10 h-10 mx-auto mb-3 text-gray-300" />
        <p>Aucun diagnostic pour l'instant.</p>
        <p className="text-sm mt-1">Les diagnostics sont conservés sur cet appareil.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Historique ({records.length})</h2>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Effacer tout l'historique de cet appareil ?")) onClear();
          }}
          className="text-sm text-gray-500 hover:text-red-600"
        >
          Tout effacer
        </button>
      </div>
      <ul className="divide-y divide-gray-100">
        {records.map((record) => (
          <li key={record.id} className={record.id === selectedId ? 'bg-blue-50' : ''}>
            <div className="flex items-center gap-3 px-5 py-3">
              <button
                type="button"
                onClick={() => onSelect(record)}
                className="flex flex-1 items-center gap-3 min-w-0 text-left"
              >
                {record.thumbnail ? (
                  <img src={record.thumbnail} alt="" className="w-12 h-12 rounded-md object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                    <Cpu className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[record.diagnosis.overallStatus]}`} />
                    {record.input.device || 'Appareil non précisé'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{record.input.symptom || record.diagnosis.summary}</p>
                  <p className="text-xs text-gray-400">{new Date(record.createdAt).toLocaleString('fr-FR')}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(record.id)}
                className="p-2 text-gray-400 hover:text-red-600 shrink-0"
                title="Supprimer ce diagnostic"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
