import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { NextRequest, NextResponse } from 'next/server'

const lambda = new LambdaClient({ region: process.env.AWS_REGION ?? 'eu-west-1' })

export async function POST(request: NextRequest) {
  const body = await request.json()

  const command = new InvokeCommand({
    FunctionName: 'labonnequittance-generate-v2',
    Payload: JSON.stringify({
      requestContext: { http: { method: 'POST' } },
      body: JSON.stringify(body),
      isBase64Encoded: false,
    }),
  })

  const response = await lambda.send(command)

  const result = JSON.parse(new TextDecoder().decode(response.Payload))

  if (result.statusCode !== 200) {
    return NextResponse.json({ error: 'Erreur génération PDF' }, { status: 500 })
  }

  const pdfBuffer = Buffer.from(result.body, 'base64')

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="quittance.pdf"',
    },
  })
}
