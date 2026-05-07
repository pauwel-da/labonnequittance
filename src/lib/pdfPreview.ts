// Renders the first page of a PDF blob to a JPEG data URL using pdf.js (client-side only)
export async function renderPdfFirstPage(blob: Blob, scale = 1.8): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

  const arrayBuffer = await blob.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
  const pdf = await loadingTask.promise
  const page = await pdf.getPage(1)

  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({
    canvasContext: canvas.getContext('2d')!,
    viewport,
    canvas,
  }).promise

  return canvas.toDataURL('image/jpeg', 0.88)
}
