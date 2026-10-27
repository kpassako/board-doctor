import type {
  DiagnoseErrorBody,
  DiagnoseRequest,
  DiagnoseResponse,
  Diagnosis,
  Measurement,
} from '../../shared/diagnosis';
import type { PreparedImage } from '../lib/image';

export type { Diagnosis, Measurement };

export interface DiagnosisInput {
  device: string;
  symptom: string;
  supplyCurrent: string;
  measurements: Measurement[];
  notes: string;
}

export interface DiagnosisRecord {
  id: string;
  createdAt: string;
  input: DiagnosisInput;
  imageName: string | null;
  thumbnail: string | null;
  diagnosis: Diagnosis;
  model: string;
}

export class DiagnosisError extends Error {
  constructor(
    message: string,
    readonly code: DiagnoseErrorBody['code'] | 'network',
  ) {
    super(message);
  }
}

const HISTORY_KEY = 'board-doctor:diagnostics';
const ACCESS_CODE_KEY = 'board-doctor:access-code';
const HISTORY_LIMIT = 50;

// Netlify coupe la fonction à 30 s : on abandonne côté client un peu après.
const REQUEST_TIMEOUT_MS = 35_000;

export function getAccessCode(): string {
  try {
    return localStorage.getItem(ACCESS_CODE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setAccessCode(code: string): void {
  try {
    localStorage.setItem(ACCESS_CODE_KEY, code.trim());
  } catch {
    // Stockage indisponible (navigation privée) : le code sera redemandé.
  }
}

export async function requestDiagnosis(
  input: DiagnosisInput,
  image: (PreparedImage & { name: string }) | null,
): Promise<DiagnosisRecord> {
  const body: DiagnoseRequest = {
    ...input,
    image: image ? { mediaType: image.mediaType, data: image.data } : null,
  };

  let response: Response;
  try {
    response = await fetch('/api/diagnose', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-access-code': getAccessCode() },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === 'TimeoutError';
    throw new DiagnosisError(
      timedOut
        ? "L'analyse a pris trop de temps. Réessayez."
        : 'Pas de connexion au serveur. Vérifiez votre accès internet.',
      timedOut ? 'timeout' : 'network',
    );
  }

  const payload = (await response.json().catch(() => null)) as DiagnoseResponse | DiagnoseErrorBody | null;
  if (!response.ok || !payload || !('diagnosis' in payload)) {
    const error = payload && 'error' in payload ? payload : null;
    throw new DiagnosisError(
      error?.error ?? `Le serveur a répondu avec une erreur (${response.status}).`,
      error?.code ?? 'upstream',
    );
  }

  const record: DiagnosisRecord = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    input,
    imageName: image?.name ?? null,
    thumbnail: image?.thumbnail ?? null,
    diagnosis: payload.diagnosis,
    model: payload.model,
  };
  saveDiagnosis(record);
  return record;
}

export function getDiagnosisHistory(): DiagnosisRecord[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? (JSON.parse(data) as DiagnosisRecord[]) : [];
  } catch {
    return [];
  }
}

function writeHistory(history: DiagnosisRecord[]): void {
  // Quota du navigateur atteint : on retire les plus anciens jusqu'à ce que l'écriture passe.
  for (let kept = history.length; kept >= 0; kept--) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, kept)));
      return;
    } catch {
      // On réessaie avec un diagnostic de moins.
    }
  }
}

function saveDiagnosis(record: DiagnosisRecord): void {
  writeHistory([record, ...getDiagnosisHistory()].slice(0, HISTORY_LIMIT));
}

export function deleteDiagnosis(id: string): void {
  writeHistory(getDiagnosisHistory().filter((d) => d.id !== id));
}

export function clearDiagnosisHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // Rien à effacer si le stockage est indisponible.
  }
}
