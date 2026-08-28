import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { logAdminEvent } from '@/lib/admin-events'
import { NextRequest, NextResponse } from 'next/server'

const lambda = new LambdaClient({ region: process.env.AWS_REGION ?? 'eu-west-1' })
const SOURCE = 'api/generer-attestation-caf'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const command = new InvokeCommand({
    FunctionName: 'labonnequittance-attestation-caf',
    Payload: JSON.stringify({
      requestContext: { http: { method: 'POST' } },
      body: JSON.stringify(body),
      isBase64Encoded: false,
    }),
  })

  let result: { statusCode?: number; body?: string }
  try {
    const response = await lambda.send(command)
    result = JSON.parse(new TextDecoder().decode(response.Payload))
  } catch (e) {
    await logAdminEvent({
      source: SOURCE,
      message: `Invocation Lambda attestation-caf : ${e instanceof Error ? e.message : String(e)}`,
    })
    return NextResponse.json({ error: 'Erreur génération attestation CAF' }, { status: 500 })
  }

  if (result.statusCode !== 200) {
    console.error('[attestation-caf] Lambda error:', result.statusCode, result.body)
    await logAdminEvent({
      source: SOURCE,
      message: `Lambda attestation-caf statusCode ${result.statusCode}`,
      meta: { statusCode: result.statusCode, body: String(result.body ?? '').slice(0, 500) },
    })
    return NextResponse.json({ error: 'Erreur génération attestation CAF' }, { status: 500 })
  }

  const pdfBuffer = Buffer.from(result.body ?? '', 'base64')

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="attestation-caf.pdf"',
    },
  })
}
