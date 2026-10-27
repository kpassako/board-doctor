import {
  AlertTriangle,
  CheckCircle,
  ClipboardCheck,
  HelpCircle,
  Info,
  ListOrdered,
  Search,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { Diagnosis, DiagnosisRecord } from '../services/diagnosticService';

interface DiagnosticReportProps {
  record: DiagnosisRecord;
}

const STATUS: Record<Diagnosis['overallStatus'], { label: string; className: string }> = {
  critical: { label: 'Critique', className: 'bg-red-100 text-red-700' },
  warning: { label: 'Attention', className: 'bg-orange-100 text-orange-700' },
  good: { label: 'Bon état apparent', className: 'bg-green-100 text-green-700' },
  inconclusive: { label: 'Non concluant', className: 'bg-gray-100 text-gray-700' },
};

const LEVEL_LABELS = { high: 'élevée', medium: 'moyenne', low: 'faible' } as const;

const LEVEL_CLASSES = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-orange-100 text-orange-700',
  low: 'bg-gray-100 text-gray-600',
} as const;

const PHOTO_QUALITY = { good: 'bonne', fair: 'moyenne', poor: 'insuffisante', none: '' } as const;

const KIND_LABELS = { tension: 'Tension', diode: 'Diode', resistance: 'Résistance', courant: 'Courant' } as const;

function severityStyle(severity: Diagnosis['findings'][number]['severity']) {
  switch (severity) {
    case 'critical':
      return { icon: <XCircle className="w-5 h-5 text-red-500 shrink-0" />, box: 'bg-red-50 border-red-200' };
    case 'warning':
      return { icon: <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />, box: 'bg-orange-50 border-orange-200' };
    default:
      return { icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />, box: 'bg-blue-50 border-blue-200' };
  }
}

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function DiagnosticReport({ record }: DiagnosticReportProps) {
  const { diagnosis, input } = record;
  const status = STATUS[diagnosis.overallStatus];
  const showPhotoAdvice =
    (diagnosis.photoQuality === 'fair' || diagnosis.photoQuality === 'poor') && diagnosis.photoAdvice;

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-gray-900">Rapport de diagnostic</h2>
          {input.device && <p className="text-sm text-gray-500 mt-0.5 break-words">{input.device}</p>}
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${status.className}`}>
          {status.label}
        </span>
      </header>

      <div className="flex gap-4">
        {record.thumbnail && (
          <img
            src={record.thumbnail}
            alt="Photo analysée"
            className="w-20 h-20 object-cover rounded-lg border border-gray-200 shrink-0"
          />
        )}
        <p className="text-gray-800 leading-relaxed">{diagnosis.summary}</p>
      </div>

      {showPhotoAdvice && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <strong>Photo de qualité {PHOTO_QUALITY[diagnosis.photoQuality]} :</strong> {diagnosis.photoAdvice}
        </div>
      )}

      {diagnosis.safetyWarnings.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-800 flex items-center gap-2 mb-2">
            <ShieldAlert className="w-5 h-5" />
            Sécurité
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-red-800">
            {diagnosis.safetyWarnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {diagnosis.findings.length > 0 && (
        <Section icon={<Search className="w-5 h-5 text-blue-600" />} title={`Constats (${diagnosis.findings.length})`}>
          <div className="space-y-3">
            {diagnosis.findings.map((finding, i) => {
              const style = severityStyle(finding.severity);
              return (
                <div key={i} className={`border rounded-lg p-4 ${style.box}`}>
                  <div className="flex items-start gap-3">
                    {style.icon}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{finding.title}</h4>
                        <span className="text-xs text-gray-500">confiance {LEVEL_LABELS[finding.confidence]}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{finding.description}</p>
                      {finding.location && <p className="text-xs text-gray-500 mt-2">📍 {finding.location}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {diagnosis.probableCauses.length > 0 && (
        <Section icon={<HelpCircle className="w-5 h-5 text-blue-600" />} title="Causes probables">
          <ol className="space-y-3">
            {diagnosis.probableCauses.map((cause, i) => (
              <li key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {i + 1}. {cause.cause}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${LEVEL_CLASSES[cause.likelihood]}`}>
                    probabilité {LEVEL_LABELS[cause.likelihood]}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{cause.reasoning}</p>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {diagnosis.nextSteps.length > 0 && (
        <Section icon={<ListOrdered className="w-5 h-5 text-blue-600" />} title="Démarche conseillée">
          <ol className="space-y-3">
            {diagnosis.nextSteps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-semibold shrink-0">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{step.action}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{step.interpretation}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {diagnosis.toVerify.length > 0 && (
        <Section icon={<ClipboardCheck className="w-5 h-5 text-amber-600" />} title="À vérifier sur schéma / boardview">
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            {diagnosis.toVerify.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Section>
      )}

      {diagnosis.findings.length === 0 && diagnosis.probableCauses.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-500" />
          <p>Aucun défaut identifié avec les éléments fournis.</p>
        </div>
      )}

      {(input.symptom || input.supplyCurrent || input.measurements.length > 0 || input.notes) && (
        <details className="rounded-lg border border-gray-200 p-4 text-sm">
          <summary className="cursor-pointer font-medium text-gray-700">Données saisies</summary>
          <dl className="mt-3 space-y-2 text-gray-700">
            {input.symptom && (
              <div>
                <dt className="font-medium">Symptôme</dt>
                <dd className="whitespace-pre-wrap">{input.symptom}</dd>
              </div>
            )}
            {input.supplyCurrent && (
              <div>
                <dt className="font-medium">Consommation</dt>
                <dd>{input.supplyCurrent}</dd>
              </div>
            )}
            {input.measurements.length > 0 && (
              <div>
                <dt className="font-medium">Mesures</dt>
                <dd>
                  <ul className="mt-1 space-y-0.5">
                    {input.measurements.map((m, i) => (
                      <li key={i}>
                        {m.point} — {KIND_LABELS[m.kind]} : {m.value}
                        {m.reference && <span className="text-gray-500"> (réf. {m.reference})</span>}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            {input.notes && (
              <div>
                <dt className="font-medium">Notes</dt>
                <dd className="whitespace-pre-wrap">{input.notes}</dd>
              </div>
            )}
          </dl>
        </details>
      )}

      <footer className="pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
        <p>
          Analyse générée par IA : confirmez chaque conclusion par vos mesures et le schéma avant toute intervention.
        </p>
        <p>
          {new Date(record.createdAt).toLocaleString('fr-FR')}
          {record.imageName && ` · ${record.imageName}`}
        </p>
      </footer>
    </article>
  );
}
