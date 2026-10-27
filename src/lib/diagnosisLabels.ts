import type { Diagnosis, Measurement } from '../services/diagnosticService'

// Libellés partagés par le rapport à l'écran et l'export PDF.

export const STATUS_LABELS: Record<Diagnosis['overallStatus'], string> = {
  critical: 'Critique',
  warning: 'Attention',
  good: 'Bon état apparent',
  inconclusive: 'Non concluant',
}

export const LEVEL_LABELS = { high: 'élevée', medium: 'moyenne', low: 'faible' } as const

export const PHOTO_QUALITY_LABELS: Record<Diagnosis['photoQuality'], string> = {
  good: 'bonne',
  fair: 'moyenne',
  poor: 'insuffisante',
  none: '',
}

export const KIND_LABELS: Record<Measurement['kind'], string> = {
  tension: 'Tension',
  diode: 'Diode',
  resistance: 'Résistance',
  courant: 'Courant',
}
