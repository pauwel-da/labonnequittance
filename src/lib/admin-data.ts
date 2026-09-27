import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from './admin'
import { PROMO_LMNP } from './promo-config'

// ── Types ─────────────────────────────────────────────────────────────────────

export type Result<T> = { ok: true; data: T } | { ok: false; error: string }

export interface UserOverview {
  userId: string
  email: string
  createdAt: string
  lastSignInAt: string | null
  profilComplet: boolean
  optinMarketing: boolean
  optinRappelMensuel: boolean
  nbBiens: number
  nbLocataires: number
  nbQuittances: number
  lastQuittanceAt: string | null
}

export interface DailyPoint { day: string; inscrits: number; quittances: number }
export interface MonthlyPoint { month: string; actifs: number; quittances: number }
export interface RappelStat { periode: string; envoyes: number; convertis: number; lastSentAt: string | null }

export type ActionKey = 'telecharge' | 'envoye' | 'visionne' | 'caf'
export type ActionCounts = Record<ActionKey, number>

export interface TrialDrafts {
  count: number
  recent: { id: string; email: string; createdAt: string | null }[]
}

export interface AdminEvent {
  id: number
  createdAt: string
  level: 'error' | 'warning' | 'info'
  source: string
  message: string
  userId: string | null
  meta: unknown
}

export interface PromoStats {
  shown: number
  closed: number
  discover: number
  notify: number
}

export interface AdminData {
  /** ISO — instant de génération (heure serveur). */
  generatedAt: string
  users: Result<UserOverview[]>
  daily: Result<DailyPoint[]>
  monthly: Result<MonthlyPoint[]>
  rappels: Result<RappelStat[]>
  actions: Result<{ total: ActionCounts; today: ActionCounts }>
  trialDrafts: Result<TrialDrafts>
  events: Result<AdminEvent[]>
  promo: Result<PromoStats>
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function safe<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await fn() }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// PostgREST plafonne les réponses (1000 lignes par défaut) : on pagine.
async function rpcAll<T>(client: SupabaseClient, fn: string, args?: Record<string, unknown>): Promise<T[]> {
  const PAGE = 1000
  const all: T[] = []
  let from = 0
  for (;;) {
    const { data, error } = await client.rpc(fn, args).range(from, from + PAGE - 1)
    if (error) throw new Error(`${fn} : ${error.message}`)
    const rows = (data ?? []) as T[]
    all.push(...rows)
    if (rows.length < PAGE) break
    from += PAGE
  }
  return all
}

function emptyCounts(): ActionCounts {
  return { telecharge: 0, envoye: 0, visionne: 0, caf: 0 }
}

// ── Requêtes ──────────────────────────────────────────────────────────────────

async function fetchUsers(client: SupabaseClient): Promise<UserOverview[]> {
  type Row = {
    user_id: string; email: string; created_at: string; last_sign_in_at: string | null
    profil_complet: boolean; optin_marketing: boolean; optin_rappel_mensuel: boolean
    nb_biens: number | string; nb_locataires: number | string; nb_quittances: number | string
    last_quittance_at: string | null
  }
  const rows = await rpcAll<Row>(client, 'admin_users_overview')
  return rows.map(r => ({
    userId: r.user_id,
    email: r.email ?? '',
    createdAt: r.created_at,
    lastSignInAt: r.last_sign_in_at,
    profilComplet: !!r.profil_complet,
    optinMarketing: !!r.optin_marketing,
    optinRappelMensuel: r.optin_rappel_mensuel !== false,
    nbBiens: Number(r.nb_biens),
    nbLocataires: Number(r.nb_locataires),
    nbQuittances: Number(r.nb_quittances),
    lastQuittanceAt: r.last_quittance_at,
  }))
}

async function fetchDaily(client: SupabaseClient, days: number): Promise<DailyPoint[]> {
  const { data, error } = await client.rpc('admin_daily_series', { days })
  if (error) throw new Error(`admin_daily_series : ${error.message}`)
  return (data ?? []).map((r: { day: string; inscrits: number | string; quittances: number | string }) => ({
    day: r.day,
    inscrits: Number(r.inscrits),
    quittances: Number(r.quittances),
  }))
}

async function fetchMonthly(client: SupabaseClient, months: number): Promise<MonthlyPoint[]> {
  const { data, error } = await client.rpc('admin_monthly_actives', { months })
  if (error) throw new Error(`admin_monthly_actives : ${error.message}`)
  return (data ?? []).map((r: { month: string; actifs: number | string; quittances: number | string }) => ({
    month: r.month,
    actifs: Number(r.actifs),
    quittances: Number(r.quittances),
  }))
}

async function fetchRappels(client: SupabaseClient): Promise<RappelStat[]> {
  const { data, error } = await client.rpc('admin_rappel_stats')
  if (error) throw new Error(`admin_rappel_stats : ${error.message}`)
  return (data ?? []).map((r: { periode: string; envoyes: number | string; convertis: number | string; last_sent_at: string | null }) => ({
    periode: r.periode,
    envoyes: Number(r.envoyes),
    convertis: Number(r.convertis),
    lastSentAt: r.last_sent_at,
  }))
}

// Réutilise les RPC déjà en place (ex-route /api/admin/stats).
async function fetchActions(client: SupabaseClient): Promise<{ total: ActionCounts; today: ActionCounts }> {
  const [{ data: totalRows, error: e1 }, { data: todayRows, error: e2 }] = await Promise.all([
    client.rpc('get_quittance_stats'),
    client.rpc('get_quittance_stats_today'),
  ])
  if (e1) throw new Error(`get_quittance_stats : ${e1.message}`)
  if (e2) throw new Error(`get_quittance_stats_today : ${e2.message}`)
  const total = emptyCounts()
  const today = emptyCounts()
  for (const row of (totalRows ?? []) as { action: string; count: number | string }[]) {
    if (row.action in total) total[row.action as ActionKey] = Number(row.count)
  }
  for (const row of (todayRows ?? []) as { action: string; count: number | string }[]) {
    if (row.action in today) today[row.action as ActionKey] = Number(row.count)
  }
  return { total, today }
}

async function fetchTrialDrafts(client: SupabaseClient): Promise<TrialDrafts> {
  const { data, error, count } = await client
    .from('trial_drafts')
    .select('id, email, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(10)
  if (error) throw new Error(`trial_drafts : ${error.message}`)
  return {
    count: count ?? 0,
    recent: (data ?? []).map(r => ({ id: String(r.id), email: r.email, createdAt: r.created_at ?? null })),
  }
}

async function fetchEvents(client: SupabaseClient, limit: number): Promise<AdminEvent[]> {
  const { data, error } = await client
    .from('admin_events')
    .select('id, created_at, level, source, message, user_id, meta')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(`admin_events : ${error.message}`)
  return (data ?? []).map(r => ({
    id: Number(r.id),
    createdAt: r.created_at,
    level: r.level,
    source: r.source,
    message: r.message,
    userId: r.user_id,
    meta: r.meta,
  }))
}

// Popup LMNP Simple du dashboard (supabase/promo.sql).
async function fetchPromo(client: SupabaseClient): Promise<PromoStats> {
  const count = () => client
    .from('promo_campaign_views')
    .select('user_id', { count: 'exact', head: true })
    .eq('campaign_id', PROMO_LMNP.id)
  const [shown, closed, discover, notify] = await Promise.all([
    count(),
    count().not('closed_at', 'is', null),
    count().not('discover_clicked_at', 'is', null),
    count().not('notify_optin_at', 'is', null),
  ])
  const error = shown.error ?? closed.error ?? discover.error ?? notify.error
  if (error) throw new Error(`promo_campaign_views : ${error.message} (supabase/promo.sql exécuté ?)`)
  return {
    shown: shown.count ?? 0,
    closed: closed.count ?? 0,
    discover: discover.count ?? 0,
    notify: notify.count ?? 0,
  }
}

// ── Point d'entrée ────────────────────────────────────────────────────────────

/**
 * Charge toutes les données de la page /admin. Chaque bloc est indépendant :
 * si une RPC manque (SQL pas encore exécuté), seule sa section affiche l'erreur.
 */
export async function getAdminData(): Promise<AdminData> {
  const client = createAdminClient()
  const [users, daily, monthly, rappels, actions, trialDrafts, events, promo] = await Promise.all([
    safe(() => fetchUsers(client)),
    safe(() => fetchDaily(client, 30)),
    safe(() => fetchMonthly(client, 6)),
    safe(() => fetchRappels(client)),
    safe(() => fetchActions(client)),
    safe(() => fetchTrialDrafts(client)),
    safe(() => fetchEvents(client, 50)),
    safe(() => fetchPromo(client)),
  ])
  return { generatedAt: new Date().toISOString(), users, daily, monthly, rappels, actions, trialDrafts, events, promo }
}
