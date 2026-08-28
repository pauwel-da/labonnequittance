import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertTriangle, RefreshCw, Search, X } from 'lucide-react'
import { getAdminUser } from '@/lib/admin'
import { getAdminData, type Result, type UserOverview } from '@/lib/admin-data'
import { BarChart, Funnel } from './charts'
import DeleteUserButton from './DeleteUserButton'

export const metadata: Metadata = { title: 'Admin — La Bonne Quittance' }

// ── Formatage (heure de Paris) ────────────────────────────────────────────────

const TZ = 'Europe/Paris'
const dateFmt = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric' })
const dateTimeFmt = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const dayKeyFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
const shortDayFmt = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, day: '2-digit', month: '2-digit' })
const monthFmt = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, month: 'short', year: '2-digit' })

const fmtDate = (iso: string | null | undefined) => (iso ? dateFmt.format(new Date(iso)) : '—')
const fmtDateTime = (iso: string | null | undefined) => (iso ? dateTimeFmt.format(new Date(iso)) : '—')
const dayKey = (iso: string) => dayKeyFmt.format(new Date(iso))
const fromSqlDate = (d: string) => new Date(`${d}T12:00:00`)
const pct = (part: number, base: number) => (base > 0 ? Math.round((part / base) * 100) : 0)

// ── Briques d'UI ──────────────────────────────────────────────────────────────

function Card({ title, subtitle, children, className = '' }: {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}>
      <header className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </header>
      {children}
    </section>
  )
}

function SectionError({ error }: { error: string }) {
  return (
    <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
      <div>
        <p className="font-medium">Données indisponibles</p>
        <p className="mt-0.5 break-all">{error}</p>
        <p className="mt-1 text-amber-700">Vérifiez que <code>supabase/admin.sql</code> a été exécuté et que <code>SUPABASE_SERVICE_ROLE_KEY</code> est définie.</p>
      </div>
    </div>
  )
}

function Kpi({ label, value, delta, tone = 'text-gray-900' }: { label: string; value: number | string; delta?: string; tone?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-2xl font-bold tabular-nums mt-0.5 ${tone}`}>
        {value}
        {delta && <span className="text-sm font-medium text-gray-400 ml-1.5">{delta}</span>}
      </p>
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-400 py-4 text-center">{children}</p>
}

function Check({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      title={label}
      className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium ${on ? 'bg-green-50 text-[#008020]' : 'bg-gray-100 text-gray-400'}`}
    >
      {label}
    </span>
  )
}

const LEVEL_STYLE: Record<string, string> = {
  error: 'bg-red-50 text-red-700',
  warning: 'bg-amber-50 text-amber-700',
  info: 'bg-gray-100 text-gray-600',
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const admin = await getAdminUser()
  if (!admin) redirect('/dashboard')

  const { q: rawQ } = await searchParams
  const q = (rawQ ?? '').trim().toLowerCase()

  let data: Awaited<ReturnType<typeof getAdminData>>
  try {
    data = await getAdminData()
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e)
    return (
      <div className="px-4 lg:px-8 py-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Admin</h1>
        <SectionError error={error} />
      </div>
    )
  }

  // ── Dérivés ──
  const now = Date.parse(data.generatedAt)
  const todayKey = dayKeyFmt.format(new Date(now))
  const users: UserOverview[] = data.users.ok ? data.users.data : []
  const inscritsToday = users.filter(u => dayKey(u.createdAt) === todayKey).length

  const funnel = [
    { label: 'Inscrits', value: users.length },
    { label: 'Profil complet', value: users.filter(u => u.profilComplet).length, hint: 'nom, adresse, signature' },
    { label: '≥ 1 bien', value: users.filter(u => u.nbBiens > 0).length },
    { label: '≥ 1 locataire', value: users.filter(u => u.nbLocataires > 0).length },
    { label: '≥ 1 quittance', value: users.filter(u => u.nbQuittances > 0).length },
  ]

  const D60 = now - 60 * 86400_000
  const jamaisActifs = users.filter(u => u.nbQuittances === 0).length
  const dormants = users.filter(u => u.nbQuittances > 0 && u.lastQuittanceAt && Date.parse(u.lastQuittanceAt) < D60).length
  const desinscritsRappel = users.filter(u => !u.optinRappelMensuel).length
  const optinMarketing = users.filter(u => u.optinMarketing).length

  const actions = data.actions.ok ? data.actions.data : null
  const quittancesTotal = actions ? Object.values(actions.total).reduce((s, n) => s + n, 0) : null
  const quittancesToday = actions ? Object.values(actions.today).reduce((s, n) => s + n, 0) : null

  const monthly = data.monthly.ok ? data.monthly.data : []
  const currentMonth = monthly[monthly.length - 1]
  const previousMonth = monthly[monthly.length - 2]

  const rappels = data.rappels.ok ? data.rappels.data : []
  const lastRappel = rappels[0]

  const events = data.events.ok ? data.events.data : []
  const errors24h = events.filter(e => e.level === 'error' && now - Date.parse(e.createdAt) < 86400_000).length

  const emailById = new Map(users.map(u => [u.userId, u.email]))

  const matchedUsers = q
    ? users.filter(u => u.email.toLowerCase().includes(q) || u.userId === q).slice(0, 25)
    : users.slice(0, 10)

  const errorOf = (r: Result<unknown>) => (r.ok ? null : r.error)

  return (
    <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-5xl mx-auto space-y-5">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admin</h1>
          <p className="text-xs text-gray-400 mt-0.5">Mis à jour le {fmtDateTime(new Date(now).toISOString())} · heure de Paris</p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2"
        >
          <RefreshCw size={14} /> Actualiser
        </Link>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Inscrits" value={data.users.ok ? users.length : '—'} delta={data.users.ok ? `+${inscritsToday} auj.` : undefined} tone="text-[#008020]" />
        <Kpi label="Quittances générées" value={quittancesTotal ?? '—'} delta={quittancesToday !== null ? `+${quittancesToday} auj.` : undefined} />
        <Kpi
          label="Actifs ce mois"
          value={currentMonth ? currentMonth.actifs : '—'}
          delta={previousMonth ? `vs ${previousMonth.actifs} le mois dernier` : undefined}
        />
        <Kpi label="Erreurs (24 h)" value={data.events.ok ? errors24h : '—'} tone={errors24h > 0 ? 'text-red-600' : 'text-gray-900'} />
      </div>

      {/* Répartition par action */}
      <Card title="Quittances par action" subtitle="Total (aujourd'hui)">
        {actions ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              ['telecharge', 'Téléchargées'],
              ['envoye', 'Envoyées par email'],
              ['visionne', 'Visionnées'],
              ['caf', 'Attestations CAF'],
            ] as const).map(([key, label]) => (
              <div key={key} className="bg-gray-50 rounded-xl px-3 py-2.5">
                <p className="text-lg font-bold tabular-nums text-gray-900">
                  {actions.total[key]}
                  <span className="text-xs font-medium text-gray-400 ml-1">({actions.today[key]})</span>
                </p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        ) : (
          <SectionError error={errorOf(data.actions) ?? ''} />
        )}
      </Card>

      {/* Funnel + essai */}
      <div className="grid lg:grid-cols-5 gap-5">
        <Card title="Funnel d'activation" subtitle="Part des inscrits ayant franchi chaque étape" className="lg:col-span-3">
          {data.users.ok ? <Funnel steps={funnel} /> : <SectionError error={errorOf(data.users) ?? ''} />}
        </Card>

        <Card
          title="Essai sans compte"
          subtitle="Formulaire /quittance-en-ligne rempli, code jamais validé"
          className="lg:col-span-2"
        >
          {data.trialDrafts.ok ? (
            <>
              <p className="text-3xl font-bold tabular-nums text-gray-900">
                {data.trialDrafts.data.count}
                <span className="text-sm font-medium text-gray-400 ml-2">brouillon{data.trialDrafts.data.count > 1 ? 's' : ''} non réclamé{data.trialDrafts.data.count > 1 ? 's' : ''}</span>
              </p>
              {data.trialDrafts.data.recent.length > 0 ? (
                <ul className="mt-3 divide-y divide-gray-50 text-xs">
                  {data.trialDrafts.data.recent.map(d => (
                    <li key={d.id} className="flex justify-between gap-2 py-1.5">
                      <span className="text-gray-700 truncate">{d.email}</span>
                      <span className="text-gray-400 whitespace-nowrap">{fmtDate(d.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty>Aucun brouillon en attente.</Empty>
              )}
            </>
          ) : (
            <SectionError error={errorOf(data.trialDrafts) ?? ''} />
          )}
        </Card>
      </div>

      {/* Séries 30 jours */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Inscriptions par jour" subtitle="30 derniers jours">
          {data.daily.ok ? (
            <BarChart
              points={data.daily.data.map(p => ({
                key: p.day,
                label: shortDayFmt.format(fromSqlDate(p.day)),
                value: p.inscrits,
                title: `${dateFmt.format(fromSqlDate(p.day))} : ${p.inscrits} inscrit${p.inscrits > 1 ? 's' : ''}`,
              }))}
            />
          ) : (
            <SectionError error={errorOf(data.daily) ?? ''} />
          )}
        </Card>
        <Card title="Quittances par jour" subtitle="30 derniers jours, toutes actions">
          {data.daily.ok ? (
            <BarChart
              points={data.daily.data.map(p => ({
                key: p.day,
                label: shortDayFmt.format(fromSqlDate(p.day)),
                value: p.quittances,
                title: `${dateFmt.format(fromSqlDate(p.day))} : ${p.quittances} quittance${p.quittances > 1 ? 's' : ''}`,
              }))}
            />
          ) : (
            <SectionError error={errorOf(data.daily) ?? ''} />
          )}
        </Card>
      </div>

      {/* Rétention + rappel */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Utilisateurs actifs par mois" subtitle="≥ 1 quittance générée dans le mois">
          {data.monthly.ok ? (
            <>
              <BarChart
                labelAll
                points={monthly.map(m => ({
                  key: m.month,
                  label: monthFmt.format(fromSqlDate(m.month)),
                  value: m.actifs,
                  title: `${monthFmt.format(fromSqlDate(m.month))} : ${m.actifs} actif${m.actifs > 1 ? 's' : ''}, ${m.quittances} quittance${m.quittances > 1 ? 's' : ''}`,
                }))}
              />
              {data.users.ok && (
                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                    <p className="text-lg font-bold tabular-nums text-gray-900">{dormants}</p>
                    <p className="text-gray-500">Dormants <span className="text-gray-400">(actifs avant, rien depuis 60 j)</span></p>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                    <p className="text-lg font-bold tabular-nums text-gray-900">{jamaisActifs}</p>
                    <p className="text-gray-500">Jamais actifs <span className="text-gray-400">(0 quittance)</span></p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <SectionError error={errorOf(data.monthly) ?? ''} />
          )}
        </Card>

        <Card title="Rappel mensuel" subtitle="Lambda du 1er du mois · conversion = quittance dans les 7 jours">
          {data.rappels.ok ? (
            <>
              <div className="grid grid-cols-3 gap-3 text-xs mb-4">
                <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-sm font-bold text-gray-900">{lastRappel ? fmtDate(lastRappel.lastSentAt) : '—'}</p>
                  <p className="text-gray-500">Dernier envoi</p>
                </div>
                <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-lg font-bold tabular-nums text-gray-900">
                    {lastRappel ? `${pct(lastRappel.convertis, lastRappel.envoyes)} %` : '—'}
                  </p>
                  <p className="text-gray-500">Conversion {lastRappel && <span className="text-gray-400">({lastRappel.convertis}/{lastRappel.envoyes})</span>}</p>
                </div>
                <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-lg font-bold tabular-nums text-gray-900">{data.users.ok ? desinscritsRappel : '—'}</p>
                  <p className="text-gray-500">Désinscrits <span className="text-gray-400">({data.users.ok ? pct(desinscritsRappel, users.length) : '—'} %)</span></p>
                </div>
              </div>
              {rappels.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-gray-400">
                        <th className="font-medium py-1.5">Période</th>
                        <th className="font-medium py-1.5 text-right">Envoyés</th>
                        <th className="font-medium py-1.5 text-right">Convertis</th>
                        <th className="font-medium py-1.5 text-right">Taux</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {rappels.map(r => (
                        <tr key={r.periode}>
                          <td className="py-1.5 text-gray-700">{r.periode} <span className="text-gray-400">· {fmtDate(r.lastSentAt)}</span></td>
                          <td className="py-1.5 text-right tabular-nums">{r.envoyes}</td>
                          <td className="py-1.5 text-right tabular-nums">{r.convertis}</td>
                          <td className="py-1.5 text-right tabular-nums font-medium">{pct(r.convertis, r.envoyes)} %</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty>Aucun rappel envoyé pour l&apos;instant.</Empty>
              )}
            </>
          ) : (
            <SectionError error={errorOf(data.rappels) ?? ''} />
          )}
        </Card>
      </div>

      {/* Utilisateurs */}
      <Card
        title="Utilisateurs"
        subtitle={q ? `${matchedUsers.length} résultat${matchedUsers.length > 1 ? 's' : ''} pour « ${rawQ} »` : `10 dernières inscriptions · ${optinMarketing} opt-in marketing`}
      >
        <form method="get" action="/admin" className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              name="q"
              defaultValue={rawQ ?? ''}
              placeholder="Rechercher par email…"
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#008020]"
            />
          </div>
          <button type="submit" className="bg-[#008020] hover:bg-green-800 text-white text-sm font-medium px-4 rounded-lg">
            Chercher
          </button>
          {q && (
            <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 px-2">
              <X size={14} /> Effacer
            </Link>
          )}
        </form>

        {!data.users.ok ? (
          <SectionError error={errorOf(data.users) ?? ''} />
        ) : matchedUsers.length === 0 ? (
          <Empty>Aucun utilisateur trouvé.</Empty>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-xs min-w-[720px]">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="font-medium py-2">Email</th>
                  <th className="font-medium py-2">Inscrit le</th>
                  <th className="font-medium py-2">Dernière quittance</th>
                  <th className="font-medium py-2 text-right">Biens / Loc. / Quitt.</th>
                  <th className="font-medium py-2">État</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {matchedUsers.map(u => (
                  <tr key={u.userId} className="align-top">
                    <td className="py-2 pr-3">
                      <p className="text-gray-900 font-medium break-all">{u.email || <span className="text-gray-400">(sans email)</span>}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{u.userId}</p>
                    </td>
                    <td className="py-2 pr-3 text-gray-600 whitespace-nowrap">
                      {fmtDate(u.createdAt)}
                      <p className="text-[10px] text-gray-400">connexion {fmtDate(u.lastSignInAt)}</p>
                    </td>
                    <td className="py-2 pr-3 text-gray-600 whitespace-nowrap">{fmtDate(u.lastQuittanceAt)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-gray-700 whitespace-nowrap">
                      {u.nbBiens} / {u.nbLocataires} / {u.nbQuittances}
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex flex-wrap gap-1">
                        <Check on={u.profilComplet} label="Profil" />
                        <Check on={u.optinMarketing} label="Marketing" />
                        <Check on={u.optinRappelMensuel} label="Rappel" />
                      </div>
                    </td>
                    <td className="py-2 text-right">
                      {u.userId !== admin.id && <DeleteUserButton userId={u.userId} email={u.email} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Journal */}
      <Card title="Journal" subtitle="50 derniers événements · erreurs Lambda / Brevo, actions admin">
        {!data.events.ok ? (
          <SectionError error={errorOf(data.events) ?? ''} />
        ) : events.length === 0 ? (
          <Empty>Aucun événement. Les erreurs de génération PDF et d&apos;envoi email apparaîtront ici.</Empty>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-xs min-w-[640px]">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="font-medium py-2">Date</th>
                  <th className="font-medium py-2">Niveau</th>
                  <th className="font-medium py-2">Source</th>
                  <th className="font-medium py-2">Message</th>
                  <th className="font-medium py-2">Utilisateur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map(e => (
                  <tr key={e.id} className="align-top">
                    <td className="py-2 pr-3 text-gray-500 whitespace-nowrap">{fmtDateTime(e.createdAt)}</td>
                    <td className="py-2 pr-3">
                      <span className={`inline-block px-1.5 py-0.5 rounded font-medium ${LEVEL_STYLE[e.level] ?? LEVEL_STYLE.info}`}>{e.level}</span>
                    </td>
                    <td className="py-2 pr-3 text-gray-700 font-mono whitespace-nowrap">{e.source}</td>
                    <td className="py-2 pr-3 text-gray-700 break-words max-w-md">{e.message}</td>
                    <td className="py-2 text-gray-500 break-all">
                      {e.userId ? (emailById.get(e.userId) ?? <span className="font-mono text-[10px]">{e.userId}</span>) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
