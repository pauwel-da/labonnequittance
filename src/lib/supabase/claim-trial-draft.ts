import type { SupabaseClient } from '@supabase/supabase-js'
import type { TrialPayload } from '@/app/quittance-en-ligne/actions'

export async function claimTrialDrafts(supabase: SupabaseClient, userId: string, userEmail: string) {
  const { data: drafts } = await supabase
    .from('trial_drafts')
    .select('id, payload')
    .eq('email', userEmail)

  if (!drafts || drafts.length === 0) return false

  const { data: existing } = await supabase
    .from('proprietaire')
    .select('signature')
    .eq('user_id', userId)
    .maybeSingle()

  for (const draft of drafts) {
    const payload = draft.payload as TrialPayload
    const signature = payload.signature?.startsWith('data:image')
      ? payload.signature
      : existing?.signature || ''

    await supabase.from('proprietaire').upsert(
      {
        user_id: userId,
        nom: payload.bailleur.nom,
        prenom: payload.bailleur.prenom,
        adresse: payload.bailleur.adresse,
        code_postal: payload.bailleur.code_postal,
        ville: payload.bailleur.ville,
        signature,
        optin_marketing: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    const bienNom = payload.bien.adresse.slice(0, 40) || 'Mon bien'
    const { data: bienRow } = await supabase
      .from('biens')
      .insert({
        user_id: userId,
        nom: bienNom,
        adresse: payload.bien.adresse,
        code_postal: payload.bien.code_postal,
        ville: payload.bien.ville,
        type_location: payload.bien.type_location,
      })
      .select('id')
      .single()

    if (bienRow) {
      const { data: locataireRow } = await supabase
        .from('locataires')
        .insert({
          user_id: userId,
          bien_id: bienRow.id,
          nom_prenom: payload.locataire.nom_prenom,
          email: '',
          copie_email: false,
          loyer: payload.locataire.montant_loyer,
          charges: payload.locataire.montant_charges,
          date_debut: payload.locataire.date_debut_periode,
        })
        .select('id')
        .single()

      // La quittance a été vue dans l'aperçu de l'essai : on l'enregistre comme visionnée,
      // pour que la checklist d'onboarding ne redemande pas « Générer ma première quittance ».
      // (Rappel mensuel et popup LMNP ne comptent que téléchargées / envoyées : inchangés.)
      if (locataireRow) {
        await supabase.from('quittances').insert({
          user_id: userId,
          locataire_id: locataireRow.id,
          bien_id: bienRow.id,
          locataire_nom_prenom: payload.locataire.nom_prenom,
          bien_nom: bienNom,
          periode: payload.locataire.date_debut_periode,
          date_paiement: payload.locataire.date_paiement,
          montant_loyer: payload.locataire.montant_loyer,
          montant_charges: payload.locataire.montant_charges,
          action: 'visionne',
        })
      }
    }

    await supabase.from('trial_drafts').delete().eq('id', draft.id)
  }

  return true
}
