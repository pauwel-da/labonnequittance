'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Bold,
  Check,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  Loader2,
  Lock,
  Mail,
  Monitor,
  RotateCcw,
  Save,
  Send,
  Smartphone,
  TriangleAlert,
  X,
} from 'lucide-react'
import {
  EMAIL_EXPEDITEUR,
  MAX_DESTINATAIRES,
  SITE_URL,
  TAILLE_LOT,
  construireEmailHtml,
  contenuVide,
  emailValide,
  extraireAdresses,
  fusionnerAdresses,
  lienSur,
  texteVersHtml,
  type Contenu,
  type EmailPayload,
  type FormatContenu,
  type ListeEmails,
  type ResultatEnvoi,
} from '@/lib/admin-email'
import { enregistrerPiedDePage, envoyerLot, envoyerTest, journaliserEnvoi, verifierDestinataires } from './actions'

const dateHeureFmt = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
})

const pluriel = (n: number, un: string, plusieurs: string) => `${n} ${n > 1 ? plusieurs : un}`

const INPUT = 'w-full border border-gray-200 rounded-lg px-3 text-sm bg-white focus:outline-none focus:border-[#008020]'
const BTN_PRIMAIRE = 'inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-[#008020] hover:bg-green-800 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
const BTN_SECONDAIRE = 'inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
const BTN_OUTIL = 'inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-[13px] text-gray-700'

// ── HTML → texte simple (retour au mode Texte) ────────────────────────────────

const FEUILLES = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'li', 'pre'])

function enLigne(n: Node): string {
  if (n.nodeType === Node.TEXT_NODE) return (n.textContent ?? '').replace(/\s+/g, ' ')
  if (n.nodeType !== Node.ELEMENT_NODE) return ''
  const el = n as Element
  const tag = el.tagName.toLowerCase()
  if (tag === 'br') return '\n'
  if (tag === 'script' || tag === 'style' || tag === 'img') return ''
  const interieur = Array.from(el.childNodes).map(enLigne).join('')
  if (tag === 'strong' || tag === 'b') return interieur.trim() ? `**${interieur.trim()}**` : interieur
  if (tag === 'a') {
    const href = el.getAttribute('href') ?? ''
    const t = interieur.trim()
    return !lienSur(href) || href === t ? t : `[${t || href}](${href})`
  }
  return interieur
}

/** Conversion approximative : paragraphes, listes, gras et liens sont gardés. */
function htmlVersTexte(html: string): string {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
  const paragraphes: string[] = []
  let enCours = ''
  const nettoyer = (t: string) => t.split('\n').map(l => l.replace(/[ \t]+/g, ' ').trim()).join('\n').trim()
  const vider = () => {
    const t = nettoyer(enCours)
    if (t) paragraphes.push(t)
    enCours = ''
  }
  const parcourir = (parent: Node) => {
    for (const n of Array.from(parent.childNodes)) {
      if (n.nodeType !== Node.ELEMENT_NODE) {
        enCours += enLigne(n)
        continue
      }
      const el = n as Element
      const tag = el.tagName.toLowerCase()
      if (tag === 'ul' || tag === 'ol') {
        vider()
        const items = Array.from(el.children).map(li => nettoyer(enLigne(li)).replace(/\n/g, ' ')).filter(Boolean)
        if (items.length) paragraphes.push(items.map(t => `- ${t}`).join('\n'))
      } else if (FEUILLES.has(tag)) {
        vider()
        enCours = /^h\d$/.test(tag) ? `**${nettoyer(enLigne(el))}**` : enLigne(el)
        vider()
      } else if (['div', 'section', 'article', 'header', 'footer', 'main', 'center', 'table', 'tbody', 'thead', 'tr', 'td', 'th'].includes(tag)) {
        vider()
        parcourir(el)
        vider()
      } else {
        enCours += enLigne(el)
      }
    }
  }
  parcourir(doc.body)
  vider()
  return paragraphes.join('\n\n')
}

// ── Briques d'UI ──────────────────────────────────────────────────────────────

function Card({ titre, sousTitre, action, children }: {
  titre: React.ReactNode
  sousTitre?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{titre}</h3>
          {sousTitre && <p className="text-xs text-gray-500 mt-0.5">{sousTitre}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

function Segmente<T extends string>({ label, options, valeur, onChange }: {
  label: string
  options: { valeur: T; libelle: string; icone?: React.ReactNode }[]
  valeur: T
  onChange: (v: T) => void
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex gap-0.5 rounded-lg bg-gray-100 p-[3px]">
      {options.map(o => (
        <button
          key={o.valeur}
          type="button"
          aria-pressed={valeur === o.valeur}
          onClick={() => onChange(o.valeur)}
          className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium transition-colors ${
            valeur === o.valeur ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {o.icone}
          {o.libelle}
        </button>
      ))}
    </div>
  )
}

const FORMATS: { valeur: FormatContenu; libelle: string }[] = [
  { valeur: 'texte', libelle: 'Texte' },
  { valeur: 'html', libelle: 'HTML' },
]

// ── Composant ─────────────────────────────────────────────────────────────────

type Etape =
  | { type: 'edition' }
  | { type: 'verification' }
  | { type: 'confirmation'; exclus: string[] }
  | { type: 'envoi'; faits: number; total: number }
  | { type: 'termine'; resultats: ResultatEnvoi[] }
  | { type: 'erreur'; message: string }

type EtatPied =
  | { type: 'repos' }
  | { type: 'enregistrement' }
  | { type: 'enregistre'; le: string }
  | { type: 'erreur'; message: string }

type EtatTest = { type: 'repos' } | { type: 'envoi' } | { type: 'ok'; email: string } | { type: 'erreur'; message: string }

interface Props {
  listes: ListeEmails[]
  erreurListes: string | null
  /** Liste choisie via le bouton « Écrire » du tableau de bord. */
  listeInitiale: ListeEmails | null
  piedDePage: Contenu
  piedEnregistreLe: string | null
  erreurPied: string | null
  emailAdmin: string
}

export default function EmailComposer({ listes, erreurListes, listeInitiale, piedDePage, piedEnregistreLe, erreurPied, emailAdmin }: Props) {
  // ── Destinataires ──
  const [destinataires, setDestinataires] = useState<string[]>(() => listeInitiale?.emails ?? [])
  const [saisie, setSaisie] = useState('')
  const [notice, setNotice] = useState<string | null>(() =>
    listeInitiale ? `${pluriel(listeInitiale.emails.length, 'adresse ajoutée', 'adresses ajoutées')} depuis ${listeInitiale.label}` : null,
  )

  const valides = destinataires.filter(emailValide)
  const invalides = destinataires.length - valides.length

  function ajouter(texte: string, source?: string) {
    const adresses = extraireAdresses(texte)
    if (adresses.length === 0) return
    const { liste, ajoutees, doublons } = fusionnerAdresses(destinataires, adresses)
    setDestinataires(liste)
    const morceaux: string[] = []
    if (source || adresses.length > 1) {
      morceaux.push(`${pluriel(ajoutees, 'adresse ajoutée', 'adresses ajoutées')}${source ? ` depuis ${source}` : ''}`)
    }
    if (doublons) morceaux.push(pluriel(doublons, 'doublon ignoré', 'doublons ignorés'))
    setNotice(morceaux.length ? morceaux.join(' · ') : null)
  }

  function changerSaisie(v: string) {
    // Une virgule, un point-virgule ou une espace termine l'adresse en cours.
    const coupure = Math.max(v.lastIndexOf(','), v.lastIndexOf(';'), v.lastIndexOf(' '))
    if (coupure > 0 && v.slice(0, coupure).trim()) {
      ajouter(v.slice(0, coupure))
      setSaisie(v.slice(coupure + 1))
    } else {
      setSaisie(coupure === 0 ? v.slice(1) : v)
    }
  }

  function validerSaisie() {
    if (saisie.trim()) ajouter(saisie)
    setSaisie('')
  }

  function coller(e: React.ClipboardEvent<HTMLInputElement>) {
    const texte = e.clipboardData.getData('text')
    if (!/[\s,;]/.test(texte.trim())) return // une seule adresse : collage normal
    e.preventDefault()
    ajouter(`${saisie}\n${texte}`)
    setSaisie('')
  }

  function toucheSaisie(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      validerSaisie()
    } else if (e.key === 'Backspace' && !saisie && destinataires.length) {
      setDestinataires(destinataires.slice(0, -1))
      setNotice(null)
    }
  }

  function ajouterListe(id: string) {
    const liste = listes.find(l => l.id === id)
    if (liste) ajouter(liste.emails.join('\n'), liste.label)
  }

  // ── Message ──
  const [objet, setObjet] = useState('')
  const [format, setFormat] = useState<FormatContenu>('texte')
  const [texte, setTexte] = useState('')
  const [html, setHtml] = useState('')
  const zoneTexte = useRef<HTMLTextAreaElement>(null)
  const selectionLien = useRef<[number, number] | null>(null)
  const [lien, setLien] = useState<{ texte: string; url: string } | null>(null)
  const [boutonTexte, setBoutonTexte] = useState('')
  const [boutonUrl, setBoutonUrl] = useState('')

  function changerFormat(f: FormatContenu) {
    if (f === format) return
    if (f === 'html') setHtml(texteVersHtml(texte))
    else setTexte(htmlVersTexte(html))
    setFormat(f)
    setLien(null)
  }

  function selectionTexte(): [number, number] {
    const el = zoneTexte.current
    return el ? [el.selectionStart, el.selectionEnd] : [texte.length, texte.length]
  }

  function mettreEnGras() {
    const [a, b] = selectionTexte()
    setTexte(`${texte.slice(0, a)}**${texte.slice(a, b) || 'texte en gras'}**${texte.slice(b)}`)
  }

  function ouvrirLien() {
    const sel = selectionTexte()
    selectionLien.current = sel
    setLien({ texte: texte.slice(sel[0], sel[1]).trim(), url: '' })
  }

  const urlLien = lien ? lienSur(lien.url) ?? lienSur(`https://${lien.url.trim()}`) : null

  function insererLien() {
    if (!lien || !urlLien) return
    const [a, b] = selectionLien.current ?? [texte.length, texte.length]
    const t = lien.texte.trim().replace(/[[\]]/g, '')
    setTexte(`${texte.slice(0, a)}${t ? `[${t}](${urlLien})` : urlLien}${texte.slice(b)}`)
    setLien(null)
  }

  const corps: Contenu = { format, contenu: format === 'texte' ? texte : html }
  const boutonUrlSure = lienSur(boutonUrl)
  const boutonIncomplet = (boutonTexte.trim() !== '' || boutonUrl.trim() !== '') && (!boutonTexte.trim() || !boutonUrlSure)
  const bouton = boutonTexte.trim() && boutonUrlSure ? { texte: boutonTexte.trim(), url: boutonUrlSure } : null

  // ── Pied de page ──
  const [pied, setPied] = useState<Contenu>(piedDePage)
  const [piedEnregistre, setPiedEnregistre] = useState<Contenu>(piedDePage)
  const [piedOuvert, setPiedOuvert] = useState(true)
  const [piedEtat, setPiedEtat] = useState<EtatPied>({ type: 'repos' })
  const piedModifie = pied.format !== piedEnregistre.format || pied.contenu !== piedEnregistre.contenu

  function changerFormatPied(f: FormatContenu) {
    if (f === pied.format) return
    setPied({ format: f, contenu: f === 'html' ? texteVersHtml(pied.contenu) : htmlVersTexte(pied.contenu) })
  }

  async function enregistrerPied() {
    const aEnregistrer = pied
    setPiedEtat({ type: 'enregistrement' })
    try {
      const res = await enregistrerPiedDePage(aEnregistrer)
      if ('error' in res) {
        setPiedEtat({ type: 'erreur', message: res.error })
        return
      }
      setPiedEnregistre(aEnregistrer)
      setPiedEtat({ type: 'enregistre', le: dateHeureFmt.format(new Date(res.enregistreLe)) })
    } catch {
      setPiedEtat({ type: 'erreur', message: 'Enregistrement impossible : connexion interrompue.' })
    }
  }

  const statutPied =
    piedEtat.type === 'enregistrement' ? { texte: 'Enregistrement…', classe: 'text-gray-500' }
    : piedEtat.type === 'erreur' ? { texte: piedEtat.message, classe: 'text-red-600' }
    : piedModifie ? { texte: 'Modifications non enregistrées', classe: 'text-amber-700' }
    : piedEtat.type === 'enregistre' ? { texte: `Enregistré le ${piedEtat.le}`, classe: 'text-[#166534]' }
    : piedEnregistreLe ? { texte: `Enregistré le ${piedEnregistreLe}`, classe: 'text-gray-500' }
    : { texte: 'Pied de page par défaut', classe: 'text-gray-500' }

  // ── Aperçu (rafraîchi 300 ms après la dernière frappe) ──
  const payload: EmailPayload = { objet: objet.trim(), corps, bouton, piedDePage: pied }
  const htmlCourant = construireEmailHtml({
    ...payload,
    objet: payload.objet || 'Aperçu',
    lienDesinscription: `${SITE_URL}/desinscription`,
    origineImages: '',
    apercu: true,
  })
  const [htmlApercu, setHtmlApercu] = useState(htmlCourant)
  useEffect(() => {
    const t = setTimeout(() => setHtmlApercu(htmlCourant), 300)
    return () => clearTimeout(t)
  }, [htmlCourant])

  const [apercu, setApercu] = useState<'ordinateur' | 'mobile'>('ordinateur')
  const iframe = useRef<HTMLIFrameElement>(null)
  const [hauteur, setHauteur] = useState(560)

  function mesurer() {
    const doc = iframe.current?.contentDocument
    // Hauteur du contenu (celle du document ne descend jamais sous la hauteur de l’iframe).
    if (doc?.body) setHauteur(Math.max(200, doc.body.scrollHeight))
  }

  function changerApercu(v: 'ordinateur' | 'mobile') {
    setApercu(v)
    requestAnimationFrame(() => requestAnimationFrame(mesurer))
  }

  // ── Test et envoi ──
  const [test, setTest] = useState<EtatTest>({ type: 'repos' })
  const [etape, setEtape] = useState<Etape>({ type: 'edition' })

  const blocageContenu =
    !objet.trim() ? 'Ajoutez un objet.'
    : contenuVide(corps) ? 'Le message est vide.'
    : boutonIncomplet ? (boutonTexte.trim() ? 'Le lien du bouton doit commencer par https://' : 'Donnez un texte au bouton.')
    : null
  const blocageEnvoi =
    valides.length === 0 ? 'Ajoutez au moins un destinataire valide.'
    : valides.length > MAX_DESTINATAIRES ? `${MAX_DESTINATAIRES} destinataires au maximum par envoi.`
    : blocageContenu

  async function envoyerUnTest() {
    setTest({ type: 'envoi' })
    try {
      const res = await envoyerTest(payload)
      setTest('error' in res ? { type: 'erreur', message: res.error } : { type: 'ok', email: res.email })
    } catch {
      setTest({ type: 'erreur', message: 'Envoi impossible : connexion interrompue.' })
    }
  }

  async function preparerEnvoi() {
    if (blocageEnvoi) return
    setEtape({ type: 'verification' })
    try {
      const res = await verifierDestinataires(valides)
      setEtape('error' in res ? { type: 'erreur', message: res.error } : { type: 'confirmation', exclus: res.exclus })
    } catch {
      setEtape({ type: 'erreur', message: 'Vérification impossible : connexion interrompue. Réessayez.' })
    }
  }

  async function lancerEnvoi(aEnvoyer: string[], exclus: string[]) {
    const envoiId = crypto.randomUUID()
    const fige = payload
    const resultats: ResultatEnvoi[] = exclus.map(email => ({ email, statut: 'exclu' }))
    setEtape({ type: 'envoi', faits: 0, total: aEnvoyer.length })
    for (let i = 0; i < aEnvoyer.length; i += TAILLE_LOT) {
      const lot = aEnvoyer.slice(i, i + TAILLE_LOT)
      let res: Awaited<ReturnType<typeof envoyerLot>> | null = null
      // Une coupure réseau : on renvoie le lot une fois (Brevo écarte les doublons).
      for (let essai = 0; essai < 2 && !res; essai++) {
        try {
          res = await envoyerLot(fige, lot, envoiId)
        } catch {
          res = null
        }
      }
      if (!res || 'error' in res) {
        const erreur = res && 'error' in res ? res.error : 'Serveur injoignable.'
        resultats.push(...aEnvoyer.slice(i).map((email): ResultatEnvoi => ({ email, statut: 'echec', erreur })))
        break
      }
      resultats.push(...res.resultats)
      setEtape({ type: 'envoi', faits: i + lot.length, total: aEnvoyer.length })
    }
    setEtape({ type: 'termine', resultats })
    journaliserEnvoi({ objet: fige.objet, envoiId, resultats }).catch(() => {})
  }

  function nouvelEmail() {
    setDestinataires([])
    setSaisie('')
    setNotice(null)
    setObjet('')
    setFormat('texte')
    setTexte('')
    setHtml('')
    setLien(null)
    setBoutonTexte('')
    setBoutonUrl('')
    setTest({ type: 'repos' })
    setEtape({ type: 'edition' })
  }

  // Quitter la page pendant l'envoi interromprait les lots restants.
  const occupe = etape.type === 'verification' || etape.type === 'envoi'
  useEffect(() => {
    if (!occupe) return
    const retenir = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', retenir)
    return () => window.removeEventListener('beforeunload', retenir)
  }, [occupe])

  const fermable = etape.type === 'confirmation' || etape.type === 'termine' || etape.type === 'erreur'

  // ── Rendu ──
  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold">Nouvel email</h2>
        <p className="text-xs text-gray-500">Expéditeur et réponses : {EMAIL_EXPEDITEUR.email}</p>
      </div>

      <div className="grid gap-5 items-start lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="space-y-5 min-w-0">
          {/* Destinataires */}
          <Card
            titre={<label htmlFor="destinataire-saisie">Destinataires</label>}
            action={
              <span className="text-xs text-gray-600">
                {valides.length === 0 ? 'Aucun destinataire' : pluriel(valides.length, 'destinataire', 'destinataires')}
                {invalides > 0 && <span className="text-red-700"> · {pluriel(invalides, 'invalide ignorée', 'invalides ignorées')}</span>}
              </span>
            }
          >
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 min-h-11 max-h-44 overflow-y-auto border border-gray-200 rounded-lg focus-within:border-[#008020]">
              {destinataires.map((email, i) => {
                const ok = emailValide(email)
                return (
                  <span
                    key={email.toLowerCase()}
                    className={`inline-flex items-center gap-1 rounded-full border pl-2.5 pr-0.5 py-0.5 text-[13px] ${
                      ok ? 'bg-gray-100 border-gray-200 text-gray-800' : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                  >
                    {!ok && <TriangleAlert size={13} aria-hidden="true" />}
                    {email}
                    {!ok && <span className="text-[11px] font-semibold">invalide</span>}
                    <button
                      type="button"
                      onClick={() => {
                        setDestinataires(destinataires.filter((_, j) => j !== i))
                        setNotice(null)
                      }}
                      aria-label={`Retirer ${email}`}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-black/5"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )
              })}
              <input
                id="destinataire-saisie"
                type="text"
                inputMode="email"
                autoComplete="off"
                value={saisie}
                onChange={e => changerSaisie(e.target.value)}
                onKeyDown={toucheSaisie}
                onPaste={coller}
                onBlur={validerSaisie}
                placeholder={destinataires.length ? 'Ajouter une adresse…' : 'Collez ou tapez des adresses email'}
                className="flex-1 min-w-40 h-8 px-1.5 text-sm bg-transparent focus:outline-none"
              />
            </div>
            <p className="text-xs text-gray-500">
              Séparez les adresses par une virgule, un point-virgule ou un retour à la ligne. Vous pouvez coller une liste entière : les doublons sont retirés.
            </p>
            {notice && (
              <p role="status" className="flex items-center gap-1.5 text-[13px] text-[#166534]">
                <Check size={14} aria-hidden="true" /> {notice}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="liste" className="text-[13px] text-gray-700">Ajouter une liste du tableau de bord</label>
                <select
                  id="liste"
                  value=""
                  onChange={e => ajouterListe(e.target.value)}
                  disabled={listes.length === 0}
                  className="h-9 border border-gray-200 rounded-lg px-2.5 text-[13px] bg-white focus:outline-none focus:border-[#008020]"
                >
                  <option value="">Choisir…</option>
                  {listes.map(l => (
                    <option key={l.id} value={l.id} disabled={l.emails.length === 0}>
                      {l.label} ({l.emails.length})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDestinataires([])
                  setNotice(null)
                }}
                disabled={destinataires.length === 0}
                className="h-9 px-2 text-[13px] text-gray-600 underline disabled:opacity-40 disabled:no-underline"
              >
                Tout effacer
              </button>
            </div>
            {erreurListes && <p className="text-xs text-amber-800">Listes indisponibles : {erreurListes}</p>}
            <p className="flex items-start gap-2 rounded-lg border border-green-100 bg-green-50 px-3 py-2.5 text-[13px] text-[#14532d]">
              <Mail size={16} className="mt-px shrink-0" aria-hidden="true" />
              Un email séparé par destinataire : personne ne voit les autres adresses.
            </p>
          </Card>

          {/* Message */}
          <Card titre="Message">
            <div className="space-y-1.5">
              <label htmlFor="objet" className="text-[13px] font-medium text-gray-700">Objet</label>
              <input id="objet" type="text" value={objet} onChange={e => setObjet(e.target.value)} maxLength={200} className={`${INPUT} h-11`} />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="contenu" className="text-[13px] font-medium text-gray-700">Contenu</label>
                <Segmente label="Format du contenu" options={FORMATS} valeur={format} onChange={changerFormat} />
              </div>

              {format === 'texte' ? (
                <>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button type="button" onClick={mettreEnGras} className={BTN_OUTIL}>
                      <Bold size={14} aria-hidden="true" /> Gras
                    </button>
                    <button type="button" onClick={ouvrirLien} aria-expanded={lien !== null} className={BTN_OUTIL}>
                      <LinkIcon size={14} aria-hidden="true" /> Insérer un lien
                    </button>
                    <span className="text-xs text-gray-500">Les adresses https://… deviennent des liens · « - » en début de ligne = liste</span>
                  </div>
                  {lien && (
                    <div className="flex flex-wrap items-end gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <div className="flex-1 basis-36 space-y-1">
                        <label htmlFor="lien-texte" className="text-xs text-gray-700">Texte affiché</label>
                        <input
                          id="lien-texte"
                          type="text"
                          value={lien.texte}
                          onChange={e => setLien({ ...lien, texte: e.target.value })}
                          placeholder="lire notre guide"
                          className={`${INPUT} h-9`}
                        />
                      </div>
                      <div className="flex-[2] basis-52 space-y-1">
                        <label htmlFor="lien-url" className="text-xs text-gray-700">Adresse du lien</label>
                        <input
                          id="lien-url"
                          type="url"
                          value={lien.url}
                          onChange={e => setLien({ ...lien, url: e.target.value })}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              insererLien()
                            }
                          }}
                          placeholder="https://"
                          autoFocus
                          className={`${INPUT} h-9`}
                        />
                      </div>
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => setLien(null)} className="h-9 px-3 rounded-lg text-[13px] text-gray-600 hover:bg-gray-100">
                          Annuler
                        </button>
                        <button type="button" onClick={insererLien} disabled={!urlLien} className="h-9 px-3 rounded-lg bg-[#008020] hover:bg-green-800 text-white text-[13px] font-semibold disabled:opacity-50">
                          Insérer
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-500">
                  Le HTML est inséré tel quel entre l&apos;en-tête et le pied de page. Préférez les styles en ligne (attribut style), mieux affichés par les messageries.
                </p>
              )}

              <textarea
                id="contenu"
                ref={zoneTexte}
                value={format === 'texte' ? texte : html}
                onChange={e => (format === 'texte' ? setTexte(e.target.value) : setHtml(e.target.value))}
                rows={14}
                placeholder={format === 'texte' ? 'Bonjour,\n\n…' : '<p>Bonjour,</p>'}
                spellCheck={format === 'texte'}
                className={`${INPUT} py-3 leading-relaxed resize-y ${format === 'html' ? 'font-mono text-[13px] bg-gray-50' : ''}`}
              />
            </div>

            <fieldset className="space-y-2 min-w-0">
              <legend className="text-[13px] font-medium text-gray-700">
                Bouton d&apos;action <span className="font-normal text-gray-500">(facultatif)</span>
              </legend>
              <p className="text-xs text-gray-500">Il s&apos;affiche à la ligne [bouton] du message, ou à la fin s&apos;il n&apos;y en a pas.</p>
              <div className="flex flex-wrap gap-2">
                <div className="flex-1 basis-40 space-y-1">
                  <label htmlFor="bouton-texte" className="text-xs text-gray-700">Texte du bouton</label>
                  <input id="bouton-texte" type="text" value={boutonTexte} onChange={e => setBoutonTexte(e.target.value)} maxLength={60} className={`${INPUT} h-10`} />
                </div>
                <div className="flex-[2] basis-56 space-y-1">
                  <label htmlFor="bouton-url" className="text-xs text-gray-700">Lien du bouton</label>
                  <input id="bouton-url" type="url" value={boutonUrl} onChange={e => setBoutonUrl(e.target.value)} placeholder="https://" className={`${INPUT} h-10`} />
                </div>
              </div>
              {boutonIncomplet && (
                <p className="text-xs text-amber-700">
                  {boutonTexte.trim() ? 'Le lien doit commencer par https://' : 'Donnez un texte au bouton.'} Le bouton n&apos;apparaît pas tant que c&apos;est incomplet.
                </p>
              )}
            </fieldset>
          </Card>

          {/* Pied de page */}
          <Card
            titre="Pied de page"
            sousTitre="Commun à tous les emails. Une fois enregistré, il sert aux prochains envois."
            action={
              <button type="button" onClick={() => setPiedOuvert(!piedOuvert)} aria-expanded={piedOuvert} className={BTN_OUTIL}>
                {piedOuvert ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
                {piedOuvert ? 'Replier' : 'Modifier'}
              </button>
            }
          >
            {erreurPied && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                Pied de page par défaut : {erreurPied}
              </p>
            )}
            {piedOuvert ? (
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="pied" className="text-[13px] font-medium text-gray-700">Contenu</label>
                  <Segmente label="Format du pied de page" options={FORMATS} valeur={pied.format} onChange={changerFormatPied} />
                </div>
                <textarea
                  id="pied"
                  value={pied.contenu}
                  onChange={e => setPied({ ...pied, contenu: e.target.value })}
                  rows={4}
                  className={`${INPUT} py-2.5 leading-relaxed resize-y ${pied.format === 'html' ? 'font-mono text-[13px] bg-gray-50' : ''}`}
                />
                <p className="flex items-start gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-700">
                  <Lock size={14} className="mt-px shrink-0" aria-hidden="true" />
                  Toujours ajouté en dessous : « Vous ne souhaitez plus recevoir nos emails ? Se désinscrire »
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span role="status" className={`text-xs font-medium ${statutPied.classe}`}>{statutPied.texte}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPied(piedEnregistre)
                        setPiedEtat({ type: 'repos' })
                      }}
                      disabled={!piedModifie || piedEtat.type === 'enregistrement'}
                      className="h-9 px-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-[13px] text-gray-700 disabled:opacity-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={enregistrerPied}
                      disabled={!piedModifie || piedEtat.type === 'enregistrement'}
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#008020] bg-white hover:bg-green-50 text-[13px] font-semibold text-[#00701c] disabled:opacity-50"
                    >
                      {piedEtat.type === 'enregistrement' ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Save size={14} aria-hidden="true" />}
                      Enregistrer le pied de page
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="truncate text-[13px] text-gray-600">{pied.contenu.split('\n')[0].replace(/<[^>]*>|\*\*/g, '') || '(vide)'}</p>
            )}
          </Card>

          {/* Test et envoi */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm">
            <div role="status" className="min-h-5 flex-1 basis-48 text-[13px]">
              {test.type === 'ok' ? (
                <span className="inline-flex items-center gap-1.5 text-[#166534]"><Check size={15} aria-hidden="true" /> Test envoyé à {test.email}</span>
              ) : test.type === 'erreur' ? (
                <span className="text-red-600">Test non envoyé : {test.message}</span>
              ) : blocageEnvoi ? (
                <span className="text-gray-600">{blocageEnvoi}</span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={envoyerUnTest}
                disabled={!!blocageContenu || test.type === 'envoi'}
                title={emailAdmin ? `Envoie l'email à ${emailAdmin}` : undefined}
                className={BTN_SECONDAIRE}
              >
                {test.type === 'envoi' ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Mail size={16} aria-hidden="true" />}
                M&apos;envoyer un test
              </button>
              <button type="button" onClick={preparerEnvoi} disabled={!!blocageEnvoi} className={BTN_PRIMAIRE}>
                <Send size={16} aria-hidden="true" />
                {valides.length > 0 ? `Envoyer à ${pluriel(valides.length, 'destinataire', 'destinataires')}` : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>

        {/* Aperçu */}
        <section className="min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3.5 lg:sticky lg:top-6">
          <header className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900">Aperçu</h3>
            <Segmente
              label="Largeur de l'aperçu"
              valeur={apercu}
              onChange={changerApercu}
              options={[
                { valeur: 'ordinateur', libelle: 'Ordinateur', icone: <Monitor size={14} aria-hidden="true" /> },
                { valeur: 'mobile', libelle: 'Mobile', icone: <Smartphone size={14} aria-hidden="true" /> },
              ]}
            />
          </header>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3.5 gap-y-1 rounded-lg bg-gray-50 px-3.5 py-3 text-[13px]">
            <dt className="text-gray-500">De</dt>
            <dd className="break-all text-gray-900">{EMAIL_EXPEDITEUR.name} &lt;{EMAIL_EXPEDITEUR.email}&gt;</dd>
            <dt className="text-gray-500">À</dt>
            <dd className="break-all text-gray-900">
              {valides[0] ?? '—'}
              {valides.length > 1 && <span className="text-gray-500"> · aperçu du 1er des {valides.length} emails</span>}
            </dd>
            <dt className="text-gray-500">Objet</dt>
            <dd className="font-semibold text-gray-900">{objet.trim() || '(sans objet)'}</dd>
          </dl>
          <div className={`mx-auto overflow-hidden rounded-xl border border-gray-100 ${apercu === 'mobile' ? 'max-w-[375px]' : ''}`}>
            <iframe
              ref={iframe}
              title="Aperçu de l'email"
              srcDoc={htmlApercu}
              onLoad={mesurer}
              sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              style={{ height: hauteur }}
              className="block w-full border-0"
            />
          </div>
          <p className="text-xs text-gray-500">L&apos;en-tête avec le logo est fixe. Le pied de page vient de la section « Pied de page ».</p>
        </section>
      </div>

      {/* Confirmation, progression, résultat */}
      {etape.type !== 'edition' && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-gray-900/50 p-4"
          onKeyDown={e => {
            if (e.key === 'Escape' && fermable) setEtape({ type: 'edition' })
          }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="envoi-titre" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            {etape.type === 'verification' && (
              <div className="flex items-center gap-3">
                <Loader2 size={20} className="animate-spin text-[#008020]" aria-hidden="true" />
                <h2 id="envoi-titre" className="text-base font-semibold">Vérification des désinscriptions…</h2>
              </div>
            )}

            {etape.type === 'confirmation' && (() => {
              const exclus = new Set(etape.exclus.map(e => e.toLowerCase()))
              const aEnvoyer = valides.filter(e => !exclus.has(e.toLowerCase()))
              const ignorees = [
                invalides ? pluriel(invalides, 'adresse invalide', 'adresses invalides') : '',
                etape.exclus.length ? pluriel(etape.exclus.length, 'adresse désinscrite', 'adresses désinscrites') : '',
              ].filter(Boolean).join(' · ')
              return (
                <>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#008020]">
                      <Send size={18} aria-hidden="true" />
                    </span>
                    <div>
                      <h2 id="envoi-titre" className="text-lg font-bold">
                        {aEnvoyer.length ? `Envoyer à ${pluriel(aEnvoyer.length, 'destinataire', 'destinataires')} ?` : 'Rien à envoyer'}
                      </h2>
                      <p className="mt-1 text-[13px] text-gray-600">
                        {aEnvoyer.length
                          ? 'Chacun reçoit son propre email. L’envoi part tout de suite et ne peut pas être annulé.'
                          : 'Toutes les adresses valides se sont désinscrites.'}
                      </p>
                    </div>
                  </div>
                  <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 rounded-lg bg-gray-50 px-3.5 py-3 text-[13px]">
                    <dt className="text-gray-500">Objet</dt>
                    <dd className="font-semibold">{objet.trim()}</dd>
                    <dt className="text-gray-500">Destinataires</dt>
                    <dd>{pluriel(aEnvoyer.length, 'email', 'emails séparés')}</dd>
                    <dt className="text-gray-500">Ignorées</dt>
                    <dd className={ignorees ? 'text-amber-700' : ''}>{ignorees || 'aucune'}</dd>
                    <dt className="text-gray-500">Pied de page</dt>
                    <dd>{piedModifie ? 'modifié, non enregistré (utilisé pour cet envoi)' : 'version enregistrée'}</dd>
                  </dl>
                  {etape.exclus.length > 0 && etape.exclus.length <= 10 && (
                    <p className="text-xs text-gray-500">Désinscrites : {etape.exclus.join(', ')}</p>
                  )}
                  <div className="flex flex-wrap justify-end gap-2">
                    <button type="button" onClick={() => setEtape({ type: 'edition' })} className={BTN_SECONDAIRE}>
                      {aEnvoyer.length ? 'Annuler' : 'Fermer'}
                    </button>
                    {aEnvoyer.length > 0 && (
                      <button type="button" onClick={() => lancerEnvoi(aEnvoyer, etape.exclus)} className={BTN_PRIMAIRE} autoFocus>
                        <Send size={16} aria-hidden="true" />
                        Envoyer {pluriel(aEnvoyer.length, 'email', 'emails')}
                      </button>
                    )}
                  </div>
                </>
              )
            })()}

            {etape.type === 'envoi' && (
              <>
                <h2 id="envoi-titre" className="text-lg font-bold">Envoi en cours…</h2>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#008020] transition-[width] duration-300"
                    style={{ width: `${Math.round((etape.faits / Math.max(etape.total, 1)) * 100)}%` }}
                  />
                </div>
                <p className="text-[13px] text-gray-600">
                  {etape.faits} / {etape.total} traités. Gardez cette page ouverte jusqu&apos;à la fin.
                </p>
              </>
            )}

            {etape.type === 'termine' && (() => {
              const envoyes = etape.resultats.filter(r => r.statut === 'envoye').length
              const exclus = etape.resultats.filter(r => r.statut === 'exclu').length
              const echecs = etape.resultats.filter(r => r.statut === 'echec')
              return (
                <>
                  <div className="flex items-start gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${envoyes ? 'bg-green-100 text-[#166534]' : 'bg-amber-50 text-amber-700'}`}>
                      {envoyes ? <Check size={20} aria-hidden="true" /> : <TriangleAlert size={20} aria-hidden="true" />}
                    </span>
                    <div>
                      <h2 id="envoi-titre" className="text-lg font-bold">
                        {echecs.length
                          ? `${pluriel(envoyes, 'email envoyé', 'emails envoyés')} sur ${envoyes + echecs.length}`
                          : pluriel(envoyes, 'email envoyé', 'emails envoyés')}
                      </h2>
                      <p className="mt-1 text-[13px] text-gray-600">« {objet.trim()} »</p>
                    </div>
                  </div>
                  {echecs.length > 0 && (
                    <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3">
                      <p className="flex items-center gap-2 text-[13px] font-semibold text-amber-900">
                        <TriangleAlert size={15} aria-hidden="true" /> {pluriel(echecs.length, 'échec', 'échecs')}
                      </p>
                      <ul className="max-h-40 space-y-1.5 overflow-y-auto text-[13px]">
                        {echecs.slice(0, 50).map(r => (
                          <li key={r.email}>
                            <span className="font-medium text-gray-900">{r.email}</span>
                            <span className="block text-amber-900">{r.erreur}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {exclus > 0 && <p className="text-[13px] text-gray-600">{pluriel(exclus, 'adresse désinscrite ignorée', 'adresses désinscrites ignorées')}.</p>}
                  <p className="text-[13px] text-gray-600">Envoi noté dans le journal de l&apos;admin.</p>
                  <div className="flex flex-wrap justify-end gap-2">
                    {echecs.length > 0 && (
                      <button type="button" onClick={() => lancerEnvoi(echecs.map(r => r.email), [])} className={BTN_SECONDAIRE}>
                        <RotateCcw size={16} aria-hidden="true" /> Réessayer {echecs.length > 1 ? 'les échecs' : 'l’échec'}
                      </button>
                    )}
                    <button type="button" onClick={() => setEtape({ type: 'edition' })} className={BTN_SECONDAIRE}>Fermer</button>
                    <button type="button" onClick={nouvelEmail} className={BTN_PRIMAIRE}>Nouvel email</button>
                  </div>
                </>
              )
            })()}

            {etape.type === 'erreur' && (
              <>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <TriangleAlert size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 id="envoi-titre" className="text-lg font-bold">Envoi impossible</h2>
                    <p className="mt-1 text-[13px] text-gray-600 wrap-break-word">{etape.message}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => setEtape({ type: 'edition' })} className={BTN_SECONDAIRE}>Fermer</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
