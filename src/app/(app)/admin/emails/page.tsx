import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createAdminClient, getAdminUser } from '@/lib/admin'
import { getListesEmails } from '@/lib/admin-data'
import { CLE_PIED_DE_PAGE, PIED_DE_PAGE_DEFAUT, estContenu, type Contenu } from '@/lib/admin-email'
import AdminTabs from '../AdminTabs'
import EmailComposer from './EmailComposer'

export const metadata: Metadata = { title: 'Emails — Admin — La Bonne Quittance' }

// Délai des Server Actions de la page : un lot de 10 emails envoyés en parallèle.
export const maxDuration = 60

async function lirePiedDePage(): Promise<{ pied: Contenu; enregistreLe: string | null; erreur: string | null }> {
  try {
    const { data, error } = await createAdminClient()
      .from('admin_settings')
      .select('value, updated_at')
      .eq('key', CLE_PIED_DE_PAGE)
      .maybeSingle()
    if (error) return { pied: PIED_DE_PAGE_DEFAUT, enregistreLe: null, erreur: `${error.message} (supabase/emails.sql exécuté ?)` }
    if (data && estContenu(data.value)) return { pied: data.value, enregistreLe: data.updated_at, erreur: null }
    return { pied: PIED_DE_PAGE_DEFAUT, enregistreLe: null, erreur: null }
  } catch (e) {
    return { pied: PIED_DE_PAGE_DEFAUT, enregistreLe: null, erreur: e instanceof Error ? e.message : String(e) }
  }
}

export default async function AdminEmailsPage({ searchParams }: { searchParams: Promise<{ liste?: string }> }) {
  const admin = await getAdminUser()
  if (!admin) redirect('/dashboard')

  const { liste } = await searchParams
  const [listes, pied] = await Promise.all([getListesEmails(), lirePiedDePage()])
  const listeChoisie = listes.ok ? listes.data.find(l => l.id === liste) ?? null : null

  return (
    <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-6xl mx-auto space-y-5">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Admin</h1>
        <AdminTabs active="emails" />
      </div>
      <EmailComposer
        // Une autre liste dans l'URL (bouton « Écrire ») repart d'un formulaire neuf.
        key={listeChoisie?.id ?? 'vide'}
        listes={listes.ok ? listes.data : []}
        erreurListes={listes.ok ? null : listes.error}
        listeInitiale={listeChoisie}
        piedDePage={pied.pied}
        piedEnregistreLe={pied.enregistreLe}
        erreurPied={pied.erreur}
        emailAdmin={admin.email ?? ''}
      />
    </div>
  )
}
