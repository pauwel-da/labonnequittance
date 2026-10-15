import { createClient } from '@/lib/supabase/client'
import type { Bien, Foyer, Locataire, Proprietaire, QuittanceRecord } from './types'
import { parseColocataires, parseFoyer } from './colocation'

// ── Biens ─────────────────────────────────────────────────────────────────────

export async function getBiens(): Promise<Bien[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('biens')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(r => ({
    id: r.id,
    nom: r.nom,
    adresse: r.adresse,
    codePostal: r.code_postal,
    ville: r.ville,
    typeLocation: r.type_location,
  }))
}

export async function addBien(bien: Omit<Bien, 'id'>): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('biens').insert({
    nom: bien.nom,
    adresse: bien.adresse,
    code_postal: bien.codePostal,
    ville: bien.ville,
    type_location: bien.typeLocation,
  })
  if (error) throw error
}

export async function updateBien(id: string, bien: Omit<Bien, 'id'>): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('biens').update({
    nom: bien.nom,
    adresse: bien.adresse,
    code_postal: bien.codePostal,
    ville: bien.ville,
    type_location: bien.typeLocation,
  }).eq('id', id)
  if (error) throw error
}

export async function deleteBien(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('biens').delete().eq('id', id)
  if (error) throw error
}

// ── Locataires ────────────────────────────────────────────────────────────────

export async function getLocataires(): Promise<Locataire[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('locataires')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(r => ({
    id: r.id,
    nomPrenom: r.nom_prenom,
    email: r.email ?? '',
    copieEmail: r.copie_email ?? false,
    bienId: r.bien_id,
    loyer: Number(r.loyer),
    charges: Number(r.charges),
    dateDebut: r.date_debut,
    colocataires: parseColocataires(r.colocataires),
    foyer: parseFoyer(r.foyer),
  }))
}

/**
 * Colonnes de colocation (supabase/colocation.sql). Envoyées seulement quand elles
 * portent une valeur (ou en effacent une) : un locataire seul s'enregistre même si
 * la migration n'a pas encore été exécutée.
 */
function colocationColumns(l: Pick<Locataire, 'colocataires' | 'foyer'>, force = false) {
  if (!force && l.colocataires.length === 0 && !l.foyer) return {}
  return {
    colocataires: l.colocataires.map(c => ({ nom_prenom: c.nomPrenom.trim(), email: c.email.trim() })),
    foyer: l.foyer,
  }
}

export async function addLocataire(l: Omit<Locataire, 'id'>): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('locataires').insert({
    nom_prenom: l.nomPrenom,
    email: l.email || null,
    copie_email: l.copieEmail,
    bien_id: l.bienId,
    loyer: l.loyer,
    charges: l.charges,
    date_debut: l.dateDebut,
    ...colocationColumns(l),
  })
  if (error) throw error
}

/** `previous` : le locataire avant modification, pour effacer une colocation retirée. */
export async function updateLocataire(id: string, l: Omit<Locataire, 'id'>, previous?: Pick<Locataire, 'colocataires' | 'foyer'>): Promise<void> {
  const supabase = createClient()
  const hadColocation = !!previous && (previous.colocataires.length > 0 || !!previous.foyer)
  const { error } = await supabase.from('locataires').update({
    nom_prenom: l.nomPrenom,
    email: l.email || null,
    copie_email: l.copieEmail,
    bien_id: l.bienId,
    loyer: l.loyer,
    charges: l.charges,
    date_debut: l.dateDebut,
    ...colocationColumns(l, hadColocation),
  }).eq('id', id)
  if (error) throw error
}

/** Couple ou colocation, répondu au moment de l'attestation CAF. */
export async function setLocataireFoyer(id: string, foyer: Foyer): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('locataires').update({ foyer }).eq('id', id)
  if (error) throw error
}

export async function deleteLocataire(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('locataires').delete().eq('id', id)
  if (error) throw error
}

// ── Propriétaire ──────────────────────────────────────────────────────────────

export async function getProprietaire(): Promise<Proprietaire> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('proprietaire')
    .select('*')
    .maybeSingle()
  if (error) throw error
  if (!data) return { nom: '', prenom: '', adresse: '', codePostal: '', ville: '', signature: '', optinRappelMensuel: true }
  return {
    nom: data.nom,
    prenom: data.prenom,
    adresse: data.adresse,
    codePostal: data.code_postal,
    ville: data.ville,
    signature: data.signature,
    optinRappelMensuel: data.optin_rappel_mensuel,
  }
}

export async function saveProprietaire(p: Proprietaire): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')
  const { error } = await supabase.from('proprietaire').upsert(
    {
      user_id: user.id,
      nom: p.nom,
      prenom: p.prenom,
      adresse: p.adresse,
      code_postal: p.codePostal,
      ville: p.ville,
      signature: p.signature,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )
  if (error) throw error
}

// ── Quittances (historique) ───────────────────────────────────────────────────

export async function getQuittances(): Promise<QuittanceRecord[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('quittances')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(r => ({
    id: r.id,
    locataireId: r.locataire_id,
    bienId: r.bien_id,
    locataireNomPrenom: r.locataire_nom_prenom,
    bienNom: r.bien_nom,
    periode: r.periode,
    datePaiement: r.date_paiement,
    montantLoyer: Number(r.montant_loyer),
    montantCharges: Number(r.montant_charges),
    action: r.action,
    createdAt: r.created_at,
  }))
}

export async function addQuittance(q: Omit<QuittanceRecord, 'id' | 'createdAt'>): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')
  const { error } = await supabase.from('quittances').insert({
    user_id: user.id,
    locataire_id: q.locataireId,
    bien_id: q.bienId,
    locataire_nom_prenom: q.locataireNomPrenom,
    bien_nom: q.bienNom,
    periode: q.periode,
    date_paiement: q.datePaiement,
    montant_loyer: q.montantLoyer,
    montant_charges: q.montantCharges,
    action: q.action,
  })
  if (error) throw error
}
