import { z } from 'zod'

// Contrat partagé entre l'application (src/) et la fonction serveur (netlify/functions/).
// Le client n'importe que les types : zod n'est pas embarqué dans le bundle du navigateur.

export const MEASUREMENT_KINDS = ['tension', 'diode', 'resistance', 'courant'] as const

export const MAX_IMAGE_BASE64_LENGTH = 5_000_000

export const MeasurementSchema = z.object({
  point: z.string().trim().min(1).max(80),
  kind: z.enum(MEASUREMENT_KINDS),
  value: z.string().trim().min(1).max(40),
  reference: z.string().trim().max(40).default(''),
})

export const DiagnoseRequestSchema = z
  .object({
    device: z.string().trim().max(200).default(''),
    symptom: z.string().trim().max(2000).default(''),
    supplyCurrent: z.string().trim().max(200).default(''),
    measurements: z.array(MeasurementSchema).max(40).default([]),
    notes: z.string().trim().max(2000).default(''),
    image: z
      .object({
        mediaType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
        data: z.string().min(1).max(MAX_IMAGE_BASE64_LENGTH),
      })
      .nullable()
      .default(null),
  })
  .refine((r) => r.image !== null || r.symptom !== '' || r.measurements.length > 0, {
    message: 'Ajoutez au moins une photo, un symptôme ou une mesure.',
  })

// Le SDK ne transmet les énumérations à l'API que comme indication : une valeur hors liste
// retombe sur une valeur prudente au lieu de faire échouer tout le diagnostic.
const Level = z.enum(['high', 'medium', 'low']).catch('low')

export const DiagnosisSchema = z.object({
  summary: z.string().describe('Synthèse en 1 à 3 phrases.'),
  overallStatus: z.enum(['critical', 'warning', 'good', 'inconclusive']).catch('inconclusive'),
  photoQuality: z.enum(['good', 'fair', 'poor', 'none']).catch('fair'),
  photoAdvice: z.string().describe('Conseil pour une meilleure photo, ou chaîne vide.'),
  findings: z.array(
    z.object({
      title: z.string(),
      severity: z.enum(['critical', 'warning', 'info']).catch('warning'),
      description: z.string(),
      location: z.string().describe('Repère lisible ou position décrite ; chaîne vide si inconnue.'),
      confidence: Level,
    }),
  ),
  probableCauses: z.array(
    z.object({
      cause: z.string(),
      likelihood: Level,
      reasoning: z.string(),
    }),
  ),
  nextSteps: z.array(
    z.object({
      action: z.string(),
      interpretation: z.string().describe('Ce que chaque résultat possible indiquerait.'),
    }),
  ),
  safetyWarnings: z.array(z.string()),
  toVerify: z.array(z.string()).describe('Affirmations à confirmer sur schéma ou boardview.'),
})

export type Measurement = z.infer<typeof MeasurementSchema>
export type MeasurementKind = (typeof MEASUREMENT_KINDS)[number]
export type DiagnoseRequest = z.input<typeof DiagnoseRequestSchema>
export type Diagnosis = z.infer<typeof DiagnosisSchema>

export interface DiagnoseResponse {
  diagnosis: Diagnosis
  model: string
}

export interface DiagnoseErrorBody {
  error: string
  code: 'invalid_request' | 'unauthorized' | 'not_configured' | 'rate_limited' | 'timeout' | 'refused' | 'upstream'
}
