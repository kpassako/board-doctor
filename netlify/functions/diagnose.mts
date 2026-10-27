import { createHash, timingSafeEqual } from 'node:crypto'
import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import type { BetaContentBlockParam } from '@anthropic-ai/sdk/resources/beta/messages/messages'
import {
  DiagnoseRequestSchema,
  DiagnosisSchema,
  type DiagnoseErrorBody,
  type DiagnoseResponse,
  type Measurement,
} from '../../shared/diagnosis.ts'

// Netlify coupe une fonction synchrone à 30 s : on garde une marge pour répondre proprement.
const UPSTREAM_TIMEOUT_MS = 26_000

const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max'] as const
type Effort = (typeof EFFORTS)[number]

// Modèles qui acceptent le repli serveur `fallbacks: "default"` en cas de refus.
const FALLBACK_MODELS = new Set(['claude-opus-5-5', 'claude-opus-5', 'claude-fable-5-1', 'claude-sonnet-5-5'])

const SYSTEM_PROMPT = `Tu es l'assistant de diagnostic de l'atelier de réparation électronique Thor Technologie. Tu aides des techniciens en microsoudure à dépanner des cartes électroniques : smartphones, ordinateurs portables, alimentations, cartes industrielles.

Comment travailler :
- Distingue toujours ce que tu observes réellement (sur la photo ou dans les mesures fournies) de ce que tu en déduis. Si une photo est floue, trop sombre ou trop éloignée, dis-le dans photoQuality et photoAdvice plutôt que de deviner.
- N'invente jamais un repère de composant (C12, U3…), une valeur ou une référence de puce que tu ne lis pas clairement. Décris plutôt la position (« condensateur près du connecteur de charge »).
- Les valeurs en mode diode et les tensions attendues dépendent de la carte : si aucune référence n'est fournie, présente-les comme des ordres de grandeur et ajoute dans toVerify ce qui doit être confirmé sur le schéma ou le boardview.
- Classe les causes probables de la plus à la moins vraisemblable, en tenant compte des pannes fréquentes sur ce type d'appareil.
- Propose des étapes concrètes, des moins destructives aux plus invasives : inspection, mesures à froid, mesures sous tension, injection de tension, remplacement. Pour chaque étape, explique ce que chaque résultat possible indiquerait.
- Signale les risques réels dans safetyWarnings : condensateurs haute tension chargés, secteur, batteries lithium, chaleur sur les puces sous underfill.
- Une carte sans défaut visible n'est pas forcément saine : utilise overallStatus « inconclusive » quand les éléments ne suffisent pas.

Réponds en français, de façon précise et concise, comme un technicien expérimenté qui forme un collègue.`

const KIND_LABELS: Record<Measurement['kind'], string> = {
  tension: 'tension',
  diode: 'mode diode',
  resistance: 'résistance',
  courant: 'courant',
}

function json(body: DiagnoseResponse | DiagnoseErrorBody, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

function fail(status: number, code: DiagnoseErrorBody['code'], error: string): Response {
  return json({ error, code }, status)
}

function sameSecret(provided: string, expected: string): boolean {
  const a = createHash('sha256').update(provided).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

function readEffort(): Effort {
  const value = process.env.BOARD_DOCTOR_EFFORT
  return EFFORTS.includes(value as Effort) ? (value as Effort) : 'low'
}

function describeCase(input: ReturnType<typeof DiagnoseRequestSchema.parse>): string {
  const lines: string[] = []
  lines.push(`Appareil : ${input.device || 'non précisé'}`)
  if (input.symptom) lines.push(`Symptôme : ${input.symptom}`)
  if (input.supplyCurrent) lines.push(`Consommation sur alimentation de labo : ${input.supplyCurrent}`)
  if (input.measurements.length > 0) {
    lines.push('Mesures relevées :')
    for (const m of input.measurements) {
      const reference = m.reference ? ` (référence carte saine : ${m.reference})` : ''
      lines.push(`- ${m.point}, ${KIND_LABELS[m.kind]} : ${m.value}${reference}`)
    }
  }
  if (input.notes) lines.push(`Notes du technicien : ${input.notes}`)
  lines.push('')
  lines.push(
    input.image
      ? 'Analyse la photo jointe en tenant compte de ces informations, puis établis le diagnostic.'
      : "Aucune photo n'est fournie (photoQuality = none). Établis le diagnostic à partir des informations ci-dessus.",
  )
  return lines.join('\n')
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return fail(405, 'invalid_request', 'Méthode non autorisée.')
  }

  const accessCode = process.env.BOARD_DOCTOR_ACCESS_CODE
  if (accessCode && !sameSecret(req.headers.get('x-access-code') ?? '', accessCode)) {
    return fail(401, 'unauthorized', "Code d'accès atelier manquant ou incorrect.")
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return fail(500, 'not_configured', "Le serveur n'est pas configuré : variable ANTHROPIC_API_KEY absente sur Netlify.")
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return fail(400, 'invalid_request', 'Requête illisible.')
  }
  const parsedInput = DiagnoseRequestSchema.safeParse(raw)
  if (!parsedInput.success) {
    return fail(400, 'invalid_request', parsedInput.error.issues[0]?.message ?? 'Requête invalide.')
  }
  const input = parsedInput.data

  const content: BetaContentBlockParam[] = []
  if (input.image) {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: input.image.mediaType, data: input.image.data },
    })
  }
  content.push({ type: 'text', text: describeCase(input) })

  const model = process.env.BOARD_DOCTOR_MODEL || 'claude-opus-5-5'
  const useFallbacks = FALLBACK_MODELS.has(model)
  const client = new Anthropic({ timeout: UPSTREAM_TIMEOUT_MS, maxRetries: 0 })

  try {
    const message = await client.beta.messages.parse({
      model,
      max_tokens: 8000,
      thinking: { type: 'adaptive' },
      output_config: { effort: readEffort(), format: betaZodOutputFormat(DiagnosisSchema) },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content }],
      ...(useFallbacks ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
    })

    if (message.stop_reason === 'refusal') {
      return fail(422, 'refused', "L'IA a refusé d'analyser cette demande. Reformulez ou changez de photo.")
    }
    if (message.stop_reason === 'max_tokens' || !message.parsed_output) {
      return fail(502, 'upstream', "La réponse de l'IA est incomplète. Réessayez.")
    }
    return json({ diagnosis: message.parsed_output, model: message.model }, 200)
  } catch (error) {
    if (error instanceof Anthropic.APIConnectionTimeoutError) {
      return fail(504, 'timeout', "L'analyse a pris trop de temps. Réessayez, si possible avec une photo plus nette et cadrée.")
    }
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
      console.error('Clé API Anthropic refusée', error.status)
      return fail(500, 'not_configured', 'La clé API Anthropic configurée sur le serveur est refusée.')
    }
    if (error instanceof Anthropic.RateLimitError) {
      return fail(429, 'rate_limited', 'Trop de demandes en cours. Patientez une minute puis réessayez.')
    }
    if (error instanceof Anthropic.BadRequestError) {
      console.error('Requête refusée par l’API Anthropic', error.message)
      return fail(400, 'invalid_request', "La demande a été refusée par le service d'IA (photo trop lourde ou format invalide).")
    }
    if (error instanceof Anthropic.APIError) {
      console.error('Erreur API Anthropic', error.status, error.message)
      return fail(502, 'upstream', "Le service d'IA est momentanément indisponible. Réessayez dans un instant.")
    }
    if (error instanceof Anthropic.AnthropicError) {
      console.error('Réponse structurée invalide', error.message)
      return fail(502, 'upstream', "La réponse de l'IA est illisible. Réessayez.")
    }
    console.error('Erreur inattendue', error)
    return fail(502, 'upstream', "Erreur inattendue pendant l'analyse.")
  }
}

export const config = { path: '/api/diagnose' }
