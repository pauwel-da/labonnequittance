import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { createClient } from '@/lib/supabase/server'
import { logAdminEvent } from '@/lib/admin-events'
import { NextRequest, NextResponse } from 'next/server'

const lambda = new LambdaClient({ region: process.env.AWS_REGION ?? 'eu-west-1' })
const SOURCE = 'api/envoyer-quittance'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { locataire_email, copie_email, periode_label, proprietaire_prenom_nom, ...pdfPayload } = body

  if (!locataire_email) {
    return NextResponse.json({ error: 'Email locataire manquant.' }, { status: 400 })
  }

  // Récupérer l'email du propriétaire depuis l'auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const proprietaire_email = user?.email

  // Générer le PDF via Lambda
  const command = new InvokeCommand({
    FunctionName: 'labonnequittance-generate-v2',
    Payload: JSON.stringify({
      requestContext: { http: { method: 'POST' } },
      body: JSON.stringify({ ...pdfPayload, proprietaire_prenom_nom }),
      isBase64Encoded: false,
    }),
  })

  let result: { statusCode?: number; body?: string }
  try {
    const lambdaResponse = await lambda.send(command)
    result = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload))
  } catch (e) {
    await logAdminEvent({
      source: SOURCE,
      message: `Invocation Lambda generate-v2 : ${e instanceof Error ? e.message : String(e)}`,
      userId: user?.id,
    })
    return NextResponse.json({ error: 'Erreur génération PDF.' }, { status: 500 })
  }

  if (result.statusCode !== 200) {
    await logAdminEvent({
      source: SOURCE,
      message: `Lambda generate-v2 statusCode ${result.statusCode}`,
      userId: user?.id,
      meta: { statusCode: result.statusCode, body: String(result.body ?? '').slice(0, 500) },
    })
    return NextResponse.json({ error: 'Erreur génération PDF.' }, { status: 500 })
  }

  // Envoyer via Brevo
  const filename = body._filename || 'quittance.pdf'
  const brevoPayload: Record<string, unknown> = {
    sender: { name: 'La Bonne Quittance', email: 'noreply@notify.labonnequittance.fr' },
    to: [{ email: locataire_email }],
    subject: `Votre quittance de loyer — ${periode_label}`,
    htmlContent: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#222">
        <p>Bonjour,</p>
        <p>Veuillez trouver ci-joint votre quittance de loyer pour la période <strong>${periode_label}</strong>.</p>
        <p>Cordialement,<br/>${proprietaire_prenom_nom}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="font-size:12px;color:#999">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
      </div>
    `,
    attachment: [{ content: result.body, name: filename }],
  }

  if (copie_email && proprietaire_email) {
    brevoPayload.cc = [{ email: proprietaire_email }]
  }

  let brevoRes: Response
  try {
    brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(brevoPayload),
    })
  } catch (e) {
    await logAdminEvent({
      source: SOURCE,
      message: `Brevo injoignable : ${e instanceof Error ? e.message : String(e)}`,
      userId: user?.id,
    })
    return NextResponse.json({ error: 'Erreur envoi email.' }, { status: 500 })
  }

  if (!brevoRes.ok) {
    const err = await brevoRes.json().catch(() => ({}))
    await logAdminEvent({
      source: SOURCE,
      message: `Brevo ${brevoRes.status} : ${err.message || 'Erreur envoi email'}`,
      userId: user?.id,
      meta: { status: brevoRes.status, code: err.code ?? null },
    })
    return NextResponse.json({ error: err.message || 'Erreur envoi email.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
