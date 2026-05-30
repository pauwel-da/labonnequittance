import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { NextRequest, NextResponse } from 'next/server'

const lambda = new LambdaClient({ region: process.env.AWS_REGION ?? 'eu-west-1' })

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

  const lambdaResponse = await lambda.send(command)
  const result = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload))

  if (result.statusCode !== 200) {
    return NextResponse.json({ error: 'Erreur OCR' }, { status: 500 })
  }

  const data = typeof result.body === 'string' ? JSON.parse(result.body) : result.body
  return NextResponse.json(data)
}
