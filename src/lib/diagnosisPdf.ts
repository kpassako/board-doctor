import { jsPDF } from 'jspdf'
import type { Diagnosis, DiagnosisRecord } from '../services/diagnosticService'
import { KIND_LABELS, LEVEL_LABELS, STATUS_LABELS } from './diagnosisLabels'

// Rapport PDF A4 remis au client ou archivé à l'atelier. Chargé à la demande (import dynamique)
// pour ne pas alourdir l'application au démarrage.

type RGB = [number, number, number]

const BLUE: RGB = [37, 99, 235]
const INK: RGB = [17, 24, 39]
const TEXT: RGB = [55, 65, 81]
const MUTED: RGB = [107, 114, 128]
const BORDER: RGB = [229, 231, 235]
const SOFT: RGB = [249, 250, 251]
const WHITE: RGB = [255, 255, 255]

const STATUS_COLORS: Record<Diagnosis['overallStatus'], { fg: RGB; bg: RGB }> = {
  critical: { fg: [185, 28, 28], bg: [254, 226, 226] },
  warning: { fg: [194, 65, 12], bg: [255, 237, 213] },
  good: { fg: [21, 128, 61], bg: [220, 252, 231] },
  inconclusive: { fg: [55, 65, 81], bg: [243, 244, 246] },
}

const SEVERITY_COLORS: Record<Diagnosis['findings'][number]['severity'], RGB> = {
  critical: [220, 38, 38],
  warning: [234, 88, 12],
  info: [37, 99, 235],
}

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 18
const CONTENT_W = PAGE_W - 2 * MARGIN
const FOOTER_H = 14
const BOTTOM = PAGE_H - MARGIN - FOOTER_H + 6

const LOGO_URL = '/icones/android/android-launchericon-192-192.png'

// Les polices standard du PDF ne couvrent que le jeu WinAnsi (latin + accents français).
// Les symboles techniques courants sont transcrits, les autres caractères remplacés par « ? ».
const REPLACEMENTS: [RegExp, string][] = [
  [/[ΩΩ]/g, 'ohm'],
  [/≈/g, '~'],
  [/→/g, '->'],
  [/←/g, '<-'],
  [/≥/g, '>='],
  [/≤/g, '<='],
  [/≠/g, '!='],
  [/[✓✔]/g, 'OK'],
  [/[✗✘]/g, 'X'],
  [/Δ/g, 'delta '],
  [/[   ]/g, ' '],
  [/[‐‑]/g, '-'],
  [/\t/g, ' '],
]
const WIN_ANSI_EXTRA = new Set('€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ')

export function toPdfText(text: string): string {
  let out = text
  for (const [pattern, replacement] of REPLACEMENTS) out = out.replace(pattern, replacement)
  return Array.from(out)
    .map((ch) => {
      const code = ch.codePointAt(0) ?? 0
      const supported =
        code === 10 || (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || WIN_ANSI_EXTRA.has(ch)
      return supported ? ch : '?'
    })
    .join('')
}

const lineHeight = (size: number) => size * 0.3528 * 1.4

interface TextStyle {
  size?: number
  color?: RGB
  bold?: boolean
}

class PdfWriter {
  readonly doc = new jsPDF({ unit: 'mm', format: 'a4' })
  y = MARGIN

  ensure(height: number) {
    if (this.y + height > BOTTOM) {
      this.doc.addPage()
      this.y = MARGIN
    }
  }

  style({ size = 10, color = TEXT, bold = false }: TextStyle) {
    this.doc.setFont('helvetica', bold ? 'bold' : 'normal')
    this.doc.setFontSize(size)
    this.doc.setTextColor(...color)
  }

  lines(text: string, width: number, style: TextStyle): string[] {
    this.style(style)
    return this.doc.splitTextToSize(toPdfText(text), width) as string[]
  }

  textHeight(text: string, width: number, style: TextStyle): number {
    return this.lines(text, width, style).length * lineHeight(style.size ?? 10)
  }

  // Écrit un paragraphe à partir de this.y, ligne par ligne, avec saut de page si nécessaire.
  paragraph(text: string, style: TextStyle = {}, x = MARGIN, width = CONTENT_W) {
    const size = style.size ?? 10
    for (const line of this.lines(text, width, style)) {
      this.ensure(lineHeight(size))
      this.style(style)
      this.doc.text(line, x, this.y, { baseline: 'top' })
      this.y += lineHeight(size)
    }
  }

  section(title: string) {
    this.y += 5
    this.ensure(16)
    this.style({ size: 12, color: BLUE, bold: true })
    this.doc.text(toPdfText(title), MARGIN, this.y, { baseline: 'top' })
    this.y += 6.5
    this.doc.setDrawColor(...BORDER)
    this.doc.setLineWidth(0.3)
    this.doc.line(MARGIN, this.y, MARGIN + CONTENT_W, this.y)
    this.y += 3.5
  }
}

async function loadLogo(): Promise<string | null> {
  try {
    const response = await fetch(LOGO_URL)
    if (!response.ok) return null
    const blob = await response.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function reference(record: DiagnosisRecord): string {
  return `BD-${record.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`
}

function fileName(record: DiagnosisRecord): string {
  const device = record.input.device
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  const date = record.createdAt.slice(0, 10)
  return `Diagnostic_${device || 'carte'}_${date}.pdf`
}

function drawHeader(w: PdfWriter, record: DiagnosisRecord, logo: string | null) {
  const { doc } = w
  const textX = logo ? MARGIN + 20 : MARGIN
  if (logo) doc.addImage(logo, 'PNG', MARGIN, MARGIN - 1, 16, 16)

  w.style({ size: 15, color: INK, bold: true })
  doc.text('THOR TECHNOLOGIE', textX, MARGIN, { baseline: 'top' })
  w.style({ size: 9.5, color: MUTED })
  doc.text('Rapport de diagnostic électronique', textX, MARGIN + 7.5, { baseline: 'top' })

  const right = MARGIN + CONTENT_W
  w.style({ size: 9.5, color: INK, bold: true })
  doc.text(`Réf. ${reference(record)}`, right, MARGIN + 0.5, { baseline: 'top', align: 'right' })
  w.style({ size: 9, color: MUTED })
  const date = new Date(record.createdAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })
  doc.text(toPdfText(date), right, MARGIN + 7.5, { baseline: 'top', align: 'right' })

  w.y = MARGIN + 19
  doc.setDrawColor(...BLUE)
  doc.setLineWidth(0.7)
  doc.line(MARGIN, w.y, right, w.y)
  w.y += 7

  // Appareil + état général.
  const status = STATUS_LABELS[record.diagnosis.overallStatus]
  const colors = STATUS_COLORS[record.diagnosis.overallStatus]
  w.style({ size: 9, bold: true })
  const pillW = doc.getTextWidth(toPdfText(status)) + 8
  const pillX = right - pillW
  doc.setFillColor(...colors.bg)
  doc.roundedRect(pillX, w.y, pillW, 7, 3.5, 3.5, 'F')
  w.style({ size: 9, color: colors.fg, bold: true })
  doc.text(toPdfText(status), pillX + pillW / 2, w.y + 3.5, { baseline: 'middle', align: 'center' })

  const deviceLines = w.lines(record.input.device || 'Appareil non précisé', CONTENT_W - pillW - 6, {
    size: 14,
    bold: true,
  })
  w.style({ size: 14, color: INK, bold: true })
  doc.text(deviceLines, MARGIN, w.y, { baseline: 'top' })
  w.y += Math.max(7, deviceLines.length * lineHeight(14))

  if (record.input.symptom) {
    w.y += 1.5
    w.paragraph(`Symptôme : ${record.input.symptom}`, { size: 10, color: TEXT })
  }
}

function drawSummary(w: PdfWriter, record: DiagnosisRecord) {
  const { doc } = w
  w.section('Synthèse')
  const thumb = record.thumbnail
  if (!thumb) {
    w.paragraph(record.diagnosis.summary, { size: 10.5, color: INK })
    return
  }
  const props = doc.getImageProperties(thumb)
  const imgW = 38
  const imgH = Math.min(50, (imgW * props.height) / props.width)
  const textW = CONTENT_W - imgW - 6
  const textH = w.textHeight(record.diagnosis.summary, textW, { size: 10.5 })
  w.ensure(Math.max(imgH, textH))
  const top = w.y
  doc.addImage(thumb, 'JPEG', MARGIN + CONTENT_W - imgW, top, imgW, imgH)
  doc.setDrawColor(...BORDER)
  doc.setLineWidth(0.3)
  doc.rect(MARGIN + CONTENT_W - imgW, top, imgW, imgH)
  w.paragraph(record.diagnosis.summary, { size: 10.5, color: INK }, MARGIN, textW)
  w.y = Math.max(w.y, top + imgH)
}

function drawSafety(w: PdfWriter, warnings: string[]) {
  if (warnings.length === 0) return
  const { doc } = w
  const red: RGB = [185, 28, 28]
  const innerW = CONTENT_W - 10
  const bodyH = warnings.reduce((h, item) => h + w.textHeight(`• ${item}`, innerW, { size: 9.5 }), 0)
  const boxH = bodyH + 13
  w.y += 5
  w.ensure(boxH)
  doc.setFillColor(254, 242, 242)
  doc.setDrawColor(254, 202, 202)
  doc.setLineWidth(0.3)
  doc.roundedRect(MARGIN, w.y, CONTENT_W, boxH, 2, 2, 'FD')
  w.style({ size: 10.5, color: red, bold: true })
  doc.text('Consignes de sécurité', MARGIN + 5, w.y + 4, { baseline: 'top' })
  w.y += 10
  for (const item of warnings) w.paragraph(`• ${item}`, { size: 9.5, color: red }, MARGIN + 5, innerW)
  w.y += 3
}

function drawFindings(w: PdfWriter, findings: Diagnosis['findings']) {
  if (findings.length === 0) return
  const { doc } = w
  w.section(`Constats (${findings.length})`)
  const innerX = MARGIN + 5
  const innerW = CONTENT_W - 5
  findings.forEach((finding, i) => {
    const title = `${finding.title}  —  confiance ${LEVEL_LABELS[finding.confidence]}`
    const height =
      w.textHeight(title, innerW, { size: 10.5, bold: true }) +
      w.textHeight(finding.description, innerW, { size: 9.5 }) +
      (finding.location ? w.textHeight(`Position : ${finding.location}`, innerW, { size: 8.5 }) + 1 : 0)
    if (i > 0) w.y += 3
    w.ensure(height)
    doc.setFillColor(...SEVERITY_COLORS[finding.severity])
    doc.rect(MARGIN, w.y, 1.4, height, 'F')
    w.paragraph(title, { size: 10.5, color: INK, bold: true }, innerX, innerW)
    w.paragraph(finding.description, { size: 9.5, color: TEXT }, innerX, innerW)
    if (finding.location) {
      w.y += 1
      w.paragraph(`Position : ${finding.location}`, { size: 8.5, color: MUTED }, innerX, innerW)
    }
  })
}

function drawCauses(w: PdfWriter, causes: Diagnosis['probableCauses']) {
  if (causes.length === 0) return
  w.section('Causes probables')
  causes.forEach((cause, i) => {
    const title = `${i + 1}. ${cause.cause}`
    const likelihood = `Probabilité ${LEVEL_LABELS[cause.likelihood]}`
    const height =
      w.textHeight(title, CONTENT_W, { size: 10.5, bold: true }) +
      lineHeight(8.5) +
      w.textHeight(cause.reasoning, CONTENT_W - 5, { size: 9.5 })
    if (i > 0) w.y += 3
    w.ensure(height)
    w.paragraph(title, { size: 10.5, color: INK, bold: true })
    w.paragraph(likelihood, { size: 8.5, color: MUTED, bold: true }, MARGIN + 5, CONTENT_W - 5)
    w.paragraph(cause.reasoning, { size: 9.5, color: TEXT }, MARGIN + 5, CONTENT_W - 5)
  })
}

function drawSteps(w: PdfWriter, steps: Diagnosis['nextSteps']) {
  if (steps.length === 0) return
  const { doc } = w
  w.section('Démarche conseillée')
  const textX = MARGIN + 10
  const textW = CONTENT_W - 10
  steps.forEach((step, i) => {
    const height =
      w.textHeight(step.action, textW, { size: 10.5, bold: true }) +
      w.textHeight(step.interpretation, textW, { size: 9.5 })
    if (i > 0) w.y += 3
    w.ensure(Math.max(height, 7))
    doc.setFillColor(...BLUE)
    doc.circle(MARGIN + 3.2, w.y + 2.4, 3.2, 'F')
    w.style({ size: 9, color: WHITE, bold: true })
    doc.text(String(i + 1), MARGIN + 3.2, w.y + 2.5, { baseline: 'middle', align: 'center' })
    w.paragraph(step.action, { size: 10.5, color: INK, bold: true }, textX, textW)
    w.paragraph(step.interpretation, { size: 9.5, color: TEXT }, textX, textW)
  })
}

function drawToVerify(w: PdfWriter, items: string[]) {
  if (items.length === 0) return
  w.section('À vérifier sur schéma / boardview')
  for (const item of items) w.paragraph(`• ${item}`, { size: 9.5, color: TEXT }, MARGIN + 2, CONTENT_W - 2)
}

function drawInputs(w: PdfWriter, record: DiagnosisRecord) {
  const { input } = record
  if (!input.supplyCurrent && input.measurements.length === 0 && !input.notes) return
  const { doc } = w
  w.section('Données relevées par le technicien')
  if (input.supplyCurrent) {
    w.paragraph(`Consommation sur alimentation de labo : ${input.supplyCurrent}`, { size: 9.5, color: TEXT })
    w.y += 2
  }

  if (input.measurements.length > 0) {
    const columns = [
      { title: 'Point de mesure', width: 64 },
      { title: 'Type', width: 30 },
      { title: 'Valeur', width: 40 },
      { title: 'Référence carte saine', width: CONTENT_W - 134 },
    ]
    const rowH = 7
    const drawRow = (cells: string[], header: boolean) => {
      w.ensure(rowH)
      if (header) {
        doc.setFillColor(...SOFT)
        doc.rect(MARGIN, w.y, CONTENT_W, rowH, 'F')
      }
      let x = MARGIN
      cells.forEach((cell, i) => {
        const style: TextStyle = header ? { size: 8.5, color: MUTED, bold: true } : { size: 9.5, color: INK }
        const [first = ''] = w.lines(cell || '—', columns[i].width - 4, style)
        w.style(style)
        doc.text(first, x + 2, w.y + rowH / 2, { baseline: 'middle' })
        x += columns[i].width
      })
      doc.setDrawColor(...BORDER)
      doc.setLineWidth(0.3)
      doc.line(MARGIN, w.y + rowH, MARGIN + CONTENT_W, w.y + rowH)
      w.y += rowH
    }
    drawRow(
      columns.map((c) => c.title),
      true,
    )
    for (const m of input.measurements) drawRow([m.point, KIND_LABELS[m.kind], m.value, m.reference], false)
    w.y += 2
  }

  if (input.notes) {
    w.y += 1
    w.paragraph(`Notes : ${input.notes}`, { size: 9.5, color: TEXT })
  }
}

function drawSignature(w: PdfWriter) {
  const { doc } = w
  const boxH = 20
  w.y += 6
  w.ensure(boxH)
  const half = (CONTENT_W - 6) / 2
  doc.setDrawColor(...BORDER)
  doc.setLineWidth(0.3)
  doc.roundedRect(MARGIN, w.y, half, boxH, 2, 2)
  doc.roundedRect(MARGIN + half + 6, w.y, half, boxH, 2, 2)
  w.style({ size: 8.5, color: MUTED })
  doc.text('Technicien', MARGIN + 4, w.y + 4, { baseline: 'top' })
  doc.text("Cachet et signature de l'atelier", MARGIN + half + 10, w.y + 4, { baseline: 'top' })
  w.y += boxH
}

function drawFooters(w: PdfWriter) {
  const { doc } = w
  const pages = doc.getNumberOfPages()
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page)
    const y = PAGE_H - MARGIN + 2
    doc.setDrawColor(...BORDER)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, y - 3, MARGIN + CONTENT_W, y - 3)
    w.style({ size: 7.5, color: MUTED })
    doc.text(
      toPdfText('Board Doctor · Thor Technologie — Analyse assistée par IA, à confirmer par la mesure et le schéma.'),
      MARGIN,
      y,
      { baseline: 'top' },
    )
    doc.text(`Page ${page} / ${pages}`, MARGIN + CONTENT_W, y, { baseline: 'top', align: 'right' })
  }
}

export async function buildDiagnosisPdf(record: DiagnosisRecord): Promise<{ blob: Blob; fileName: string }> {
  const w = new PdfWriter()
  const { diagnosis } = record
  w.doc.setProperties({
    title: `Rapport de diagnostic ${reference(record)}`,
    subject: toPdfText(record.input.device || 'Diagnostic de carte électronique'),
    author: 'Thor Technologie',
    creator: 'Board Doctor',
  })

  drawHeader(w, record, await loadLogo())
  drawSummary(w, record)
  drawSafety(w, diagnosis.safetyWarnings)
  drawFindings(w, diagnosis.findings)
  drawCauses(w, diagnosis.probableCauses)
  drawSteps(w, diagnosis.nextSteps)
  drawToVerify(w, diagnosis.toVerify)
  drawInputs(w, record)
  drawSignature(w)
  drawFooters(w)

  return { blob: w.doc.output('blob'), fileName: fileName(record) }
}
