import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { logAdminEvent } from '@/lib/admin-events'
import { NextRequest, NextResponse } from 'next/server'

const lambda = new LambdaClient({ region: process.env.AWS_REGION ?? 'eu-west-1' })
const SOURCE = 'api/generer-quittance'

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

  let result: { statusCode?: number; body?: string }
  try {
    const response = await lambda.send(command)
    result = JSON.parse(new TextDecoder().decode(response.Payload))
  } catch (e) {
    await logAdminEvent({
      source: SOURCE,
      message: `Invocation Lambda generate-v2 : ${e instanceof Error ? e.message : String(e)}`,
    })
    return NextResponse.json({ error: 'Erreur génération PDF' }, { status: 500 })
  }

  if (result.statusCode !== 200) {
    await logAdminEvent({
      source: SOURCE,
      message: `Lambda generate-v2 statusCode ${result.statusCode}`,
      meta: { statusCode: result.statusCode, body: String(result.body ?? '').slice(0, 500) },
    })
    return NextResponse.json({ error: 'Erreur génération PDF' }, { status: 500 })
  }

  const pdfBuffer = Buffer.from(result.body ?? '', 'base64')

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
    },
  })
}
