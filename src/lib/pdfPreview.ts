// Renders the first page of a PDF blob to a JPEG data URL using pdf.js (client-side only)
export async function renderPdfFirstPage(blob: Blob, scale = 1.8): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist')

  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString()
  }

  const arrayBuffer = await blob.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) })
  const pdf = await loadingTask.promise
  const page = await pdf.getPage(1)

  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D non disponible')

  await page.render({ canvasContext: ctx, viewport }).promise

  return canvas.toDataURL('image/jpeg', 0.88)
}
