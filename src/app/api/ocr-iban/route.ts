import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { logAdminEvent } from '@/lib/admin-events'
import { NextRequest, NextResponse } from 'next/server'

const lambda = new LambdaClient({ region: process.env.AWS_REGION ?? 'eu-west-1' })
const SOURCE = 'api/ocr-iban'

export async function POST(request: NextRequest) {
  const { image_b64 } = await request.json()
  if (!image_b64) {
    return NextResponse.json({ error: 'image_b64 requis' }, { status: 400 })
  }

  const command = new InvokeCommand({
    FunctionName: 'labonnequittance-ocr-iban',
    Payload: JSON.stringify({
      requestContext: { http: { method: 'POST' } },
      body: JSON.stringify({ image_b64 }),
      isBase64Encoded: false,
    }),
  })

  let result: { statusCode?: number; body?: unknown }
  try {
    const lambdaResponse = await lambda.send(command)
    result = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload))
  } catch (e) {
    await logAdminEvent({
      source: SOURCE,
      message: `Invocation Lambda ocr-iban : ${e instanceof Error ? e.message : String(e)}`,
    })
    return NextResponse.json({ error: 'Erreur OCR' }, { status: 500 })
  }

  if (result.statusCode !== 200) {
    // Pas de contenu image dans le journal : uniquement le statut.
    await logAdminEvent({
      source: SOURCE,
      message: `Lambda ocr-iban statusCode ${result.statusCode}`,
      meta: { statusCode: result.statusCode },
    })
    return NextResponse.json({ error: 'Erreur OCR' }, { status: 500 })
  }

  const data = typeof result.body === 'string' ? JSON.parse(result.body) : result.body
  return NextResponse.json(data)
}
