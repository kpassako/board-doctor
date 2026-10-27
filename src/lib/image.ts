// Préparation des photos avant envoi : redimensionnement (l'IA n'exploite pas plus de
// ~1568 px sur le grand côté) et ré-encodage JPEG pour réduire le poids et le coût.

const ANALYSIS_MAX_EDGE = 1568
const THUMBNAIL_MAX_EDGE = 240

export interface PreparedImage {
  mediaType: 'image/jpeg'
  data: string
  thumbnail: string
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(
        new Error(
          "Format de photo non pris en charge. Sur iPhone, réglez Appareil photo › Formats sur « Le plus compatible » (JPEG).",
        ),
      )
    }
    img.src = url
  })
}

function render(img: HTMLImageElement, maxEdge: number, quality: number): string {
  const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error("Impossible de préparer la photo sur cet appareil.")
  // Fond blanc pour les PNG transparents, que le JPEG ne sait pas représenter.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', quality)
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  const img = await loadImage(file)
  const full = render(img, ANALYSIS_MAX_EDGE, 0.88)
  return {
    mediaType: 'image/jpeg',
    data: full.slice(full.indexOf(',') + 1),
    thumbnail: render(img, THUMBNAIL_MAX_EDGE, 0.7),
  }
}
