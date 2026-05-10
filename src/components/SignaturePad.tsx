'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

interface Props {
  value: string
  onChange: (dataUrl: string) => void
}

export default function SignaturePad({ value, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const hasLoaded = useRef(false)
  const [isEmpty, setIsEmpty] = useState(!value)

  // Load saved signature when value arrives from DB (async)
  useEffect(() => {
    if (!value || !canvasRef.current || hasLoaded.current) return
    hasLoaded.current = true
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new window.Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      setIsEmpty(false)
    }
    img.src = value
  }, [value])

  function getXY(e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect()
    const src = 'touches' in e ? e.touches[0] : e
    return {
      x: (src.clientX - rect.left) * (canvas.width / rect.width),
      y: (src.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    drawing.current = true
    const canvas = canvasRef.current!
    lastPos.current = getXY(e.nativeEvent, canvas)
  }

  function doDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    if (!drawing.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const pos = getXY(e.nativeEvent, canvas)
    if (lastPos.current) {
      ctx.beginPath()
      ctx.moveTo(lastPos.current.x, lastPos.current.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.strokeStyle = '#111827'
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
      setIsEmpty(false)
    }
    lastPos.current = pos
  }

  const stopDraw = useCallback(() => {
    if (!drawing.current) return
    drawing.current = false
    lastPos.current = null
    const canvas = canvasRef.current
    if (canvas) onChange(canvas.toDataURL('image/png'))
  }, [onChange])

  function clear() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
    onChange('')
  }

  return (
    <div className="space-y-2">
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={600}
          height={160}
          className="w-full touch-none cursor-crosshair block"
          onMouseDown={startDraw}
          onMouseMove={doDraw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={doDraw}
          onTouchEnd={stopDraw}
        />
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-300 text-sm select-none">Signez ici</p>
          </div>
        )}
        <div className="absolute bottom-0 left-4 right-4 border-b border-gray-200 pointer-events-none" />
      </div>
      <button
        type="button"
        onClick={clear}
        className="text-sm text-gray-500 hover:text-red-500 transition-colors"
      >
        Effacer la signature
      </button>
    </div>
  )
}
