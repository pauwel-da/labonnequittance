import { NextRequest, NextResponse } from 'next/server'

const FUNCTION_URL = 'https://x2mwf6adko4xkbninaedvruqfq0rspmm.lambda-url.us-east-1.on.aws/'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Erreur génération attestation CAF' }, { status: 500 })
  }

  const pdfBuffer = await response.arrayBuffer()

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="attestation-caf.pdf"',
    },
  })
}
