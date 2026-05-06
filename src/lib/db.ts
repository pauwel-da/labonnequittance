import { createClient } from '@/lib/supabase/client'
import type { Bien, Locataire, Proprietaire } from './types'

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
    adresse: r.adresse,
    codePostal: r.code_postal,
    ville: r.ville,
    type: r.type,
  }))
}

export async function addBien(bien: Omit<Bien, 'id'>): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('biens').insert({
    adresse: bien.adresse,
    code_postal: bien.codePostal,
    ville: bien.ville,
    type: bien.type,
  })
  if (error) throw error
}

export async function updateBien(id: string, bien: Omit<Bien, 'id'>): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('biens').update({
    adresse: bien.adresse,
    code_postal: bien.codePostal,
    ville: bien.ville,
    type: bien.type,
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
    nom: r.nom,
    prenom: r.prenom,
    bienId: r.bien_id,
    loyer: Number(r.loyer),
    charges: Number(r.charges),
    dateDebut: r.date_debut,
  }))
}

export async function addLocataire(l: Omit<Locataire, 'id'>): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('locataires').insert({
    nom: l.nom,
    prenom: l.prenom,
    bien_id: l.bienId,
    loyer: l.loyer,
    charges: l.charges,
    date_debut: l.dateDebut,
  })
  if (error) throw error
}

export async function updateLocataire(id: string, l: Omit<Locataire, 'id'>): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('locataires').update({
    nom: l.nom,
    prenom: l.prenom,
    bien_id: l.bienId,
    loyer: l.loyer,
    charges: l.charges,
    date_debut: l.dateDebut,
  }).eq('id', id)
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
  if (!data) return { nom: '', prenom: '', adresse: '', codePostal: '', ville: '', signature: '' }
  return {
    nom: data.nom,
    prenom: data.prenom,
    adresse: data.adresse,
    codePostal: data.code_postal,
    ville: data.ville,
    signature: data.signature,
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
