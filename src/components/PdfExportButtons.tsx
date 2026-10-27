import { useState } from 'react';
import { Download, Loader2, Share2 } from 'lucide-react';
import type { DiagnosisRecord } from '../services/diagnosticService';

interface PdfExportButtonsProps {
  record: DiagnosisRecord;
}

// Le partage de fichiers (WhatsApp, e-mail…) n'existe que sur certains navigateurs, surtout mobiles.
function canShareFiles(): boolean {
  try {
    const probe = new File([''], 'rapport.pdf', { type: 'application/pdf' });
    return typeof navigator.canShare === 'function' && navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

async function buildPdf(record: DiagnosisRecord) {
  const { buildDiagnosisPdf } = await import('../lib/diagnosisPdf');
  return buildDiagnosisPdf(record);
}

export default function PdfExportButtons({ record }: PdfExportButtonsProps) {
  const [busy, setBusy] = useState<'download' | 'share' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareSupported] = useState(canShareFiles);

  const handleDownload = async () => {
    setBusy('download');
    setError(null);
    try {
      const { blob, fileName } = await buildPdf(record);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (err) {
      console.error('Export PDF', err);
      setError("Impossible de générer le PDF. Réessayez.");
    } finally {
      setBusy(null);
    }
  };

  const handleShare = async () => {
    setBusy('share');
    setError(null);
    try {
      const { blob, fileName } = await buildPdf(record);
      const file = new File([blob], fileName, { type: 'application/pdf' });
      await navigator.share({
        files: [file],
        title: 'Rapport de diagnostic',
        text: `Rapport de diagnostic Thor Technologie${record.input.device ? ` – ${record.input.device}` : ''}`,
      });
    } catch (err) {
      // Fermer la feuille de partage n'est pas une erreur.
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        console.error('Partage PDF', err);
        setError('Le partage a échoué. Utilisez « Télécharger le PDF ».');
      }
    } finally {
      setBusy(null);
    }
  };

  const buttonClass =
    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60';

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={busy !== null}
          className={`${buttonClass} bg-blue-600 text-white hover:bg-blue-700`}
        >
          {busy === 'download' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Télécharger le PDF
        </button>
        {shareSupported && (
          <button
            type="button"
            onClick={handleShare}
            disabled={busy !== null}
            className={`${buttonClass} bg-gray-100 text-gray-800 hover:bg-gray-200`}
          >
            {busy === 'share' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            Partager
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
