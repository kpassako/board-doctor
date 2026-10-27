import { useState, type FormEvent } from 'react';
import { KeyRound, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import ImageUploader from './ImageUploader';
import { prepareImage } from '../lib/image';
import {
  DiagnosisError,
  getAccessCode,
  requestDiagnosis,
  setAccessCode,
  type DiagnosisRecord,
  type Measurement,
} from '../services/diagnosticService';

interface DiagnosisFormProps {
  onResult: (record: DiagnosisRecord) => void;
}

interface MeasurementRow extends Measurement {
  key: number;
}

const KIND_OPTIONS: { value: Measurement['kind']; label: string; placeholder: string }[] = [
  { value: 'diode', label: 'Diode', placeholder: '0,412' },
  { value: 'tension', label: 'Tension', placeholder: '3,8 V' },
  { value: 'resistance', label: 'Résistance', placeholder: '12 Ω' },
  { value: 'courant', label: 'Courant', placeholder: '120 mA' },
];

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200';

let nextRowKey = 1;
const emptyRow = (): MeasurementRow => ({ key: nextRowKey++, point: '', kind: 'diode', value: '', reference: '' });

export default function DiagnosisForm({ onResult }: DiagnosisFormProps) {
  const [device, setDevice] = useState('');
  const [symptom, setSymptom] = useState('');
  const [supplyCurrent, setSupplyCurrent] = useState('');
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState<MeasurementRow[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [uploaderKey, setUploaderKey] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsCode, setNeedsCode] = useState(false);
  const [code, setCode] = useState(getAccessCode);

  const updateRow = (key: number, patch: Partial<Measurement>) =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const resetForm = () => {
    setDevice('');
    setSymptom('');
    setSupplyCurrent('');
    setNotes('');
    setRows([]);
    setPhoto(null);
    setUploaderKey((k) => k + 1);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const filled = rows.filter((r) => r.point.trim() || r.value.trim() || r.reference.trim());
    if (filled.some((r) => !r.point.trim() || !r.value.trim())) {
      setError('Chaque mesure doit avoir un point de mesure et une valeur.');
      return;
    }
    if (!photo && !symptom.trim() && filled.length === 0) {
      setError('Ajoutez au moins une photo, un symptôme ou une mesure.');
      return;
    }

    if (needsCode) setAccessCode(code);
    setIsAnalyzing(true);
    try {
      const image = photo ? { ...(await prepareImage(photo)), name: photo.name } : null;
      const record = await requestDiagnosis(
        {
          device: device.trim(),
          symptom: symptom.trim(),
          supplyCurrent: supplyCurrent.trim(),
          measurements: filled.map(({ point, kind, value, reference }) => ({
            point: point.trim(),
            kind,
            value: value.trim(),
            reference: reference.trim(),
          })),
          notes: notes.trim(),
        },
        image,
      );
      setNeedsCode(false);
      onResult(record);
    } catch (err) {
      if (err instanceof DiagnosisError && err.code === 'unauthorized') setNeedsCode(true);
      setError(err instanceof Error ? err.message : "Erreur inattendue pendant l'analyse.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Nouveau diagnostic</h2>
        <p className="text-sm text-gray-500 mt-1">
          Photo seule, symptôme seul ou les deux avec vos mesures : plus vous donnez d'éléments, plus le diagnostic est
          précis.
        </p>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Appareil</span>
        <input
          className={`${inputClass} mt-1`}
          value={device}
          onChange={(e) => setDevice(e.target.value)}
          placeholder="Ex. iPhone 11, carte mère A2159, variateur ABB ACS355…"
          maxLength={200}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Symptôme</span>
        <textarea
          className={`${inputClass} mt-1 min-h-[88px]`}
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          placeholder="Ex. Ne s'allume plus après chute dans l'eau, chauffe près du connecteur de charge…"
          maxLength={2000}
        />
      </label>

      <div>
        <span className="text-sm font-medium text-gray-700">Photo de la carte (facultatif)</span>
        <div className="mt-1">
          <ImageUploader
            key={uploaderKey}
            onImageSelect={(file) => setPhoto(file)}
            onClear={() => setPhoto(null)}
            maxSizeMB={20}
          />
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Consommation sur alimentation de labo (facultatif)</span>
        <input
          className={`${inputClass} mt-1`}
          value={supplyCurrent}
          onChange={(e) => setSupplyCurrent(e.target.value)}
          placeholder="Ex. 0,05 A à 5 V puis retombe à 0"
          maxLength={200}
        />
      </label>

      <fieldset>
        <legend className="text-sm font-medium text-gray-700">Mesures (facultatif)</legend>
        <div className="mt-2 space-y-3">
          {rows.map((row) => {
            const kind = KIND_OPTIONS.find((k) => k.value === row.kind) ?? KIND_OPTIONS[0];
            return (
              <div key={row.key} className="grid grid-cols-2 sm:grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-2 items-center">
                <input
                  className={`${inputClass} col-span-2 sm:col-span-1`}
                  value={row.point}
                  onChange={(e) => updateRow(row.key, { point: e.target.value })}
                  placeholder="Point (PP_VDD_MAIN, C1234…)"
                  aria-label="Point de mesure"
                  maxLength={80}
                />
                <select
                  className={inputClass}
                  value={row.kind}
                  onChange={(e) => updateRow(row.key, { kind: e.target.value as Measurement['kind'] })}
                  aria-label="Type de mesure"
                >
                  {KIND_OPTIONS.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </select>
                <input
                  className={inputClass}
                  value={row.value}
                  onChange={(e) => updateRow(row.key, { value: e.target.value })}
                  placeholder={kind.placeholder}
                  aria-label="Valeur mesurée"
                  maxLength={40}
                />
                <input
                  className={inputClass}
                  value={row.reference}
                  onChange={(e) => updateRow(row.key, { reference: e.target.value })}
                  placeholder="Réf. saine"
                  aria-label="Valeur de référence sur carte saine"
                  maxLength={40}
                />
                <button
                  type="button"
                  onClick={() => setRows((current) => current.filter((r) => r.key !== row.key))}
                  className="justify-self-end p-2 text-gray-400 hover:text-red-600"
                  title="Supprimer la mesure"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
          {rows.length < 40 && (
            <button
              type="button"
              onClick={() => setRows((current) => [...current, emptyRow()])}
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              Ajouter une mesure
            </button>
          )}
        </div>
      </fieldset>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Notes (facultatif)</span>
        <textarea
          className={`${inputClass} mt-1 min-h-[64px]`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Interventions déjà faites, historique de la panne…"
          maxLength={2000}
        />
      </label>

      {needsCode && (
        <label className="block rounded-lg border border-blue-200 bg-blue-50 p-3">
          <span className="text-sm font-medium text-blue-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4" />
            Code d'accès atelier
          </span>
          <input
            className={`${inputClass} mt-2`}
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="current-password"
          />
        </label>
      )}

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <button
          type="button"
          onClick={resetForm}
          disabled={isAnalyzing}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          Effacer
        </button>
        <button
          type="submit"
          disabled={isAnalyzing}
          className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70"
        >
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isAnalyzing ? 'Analyse en cours… (jusqu’à 30 s)' : 'Lancer le diagnostic'}
        </button>
      </div>
    </form>
  );
}
