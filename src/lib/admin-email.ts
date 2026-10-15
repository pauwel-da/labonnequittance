/**
 * Emails écrits depuis /admin/emails : saisie (texte simple ou HTML), gabarit aux
 * couleurs de La Bonne Quittance (en-tête, corps, pied de page) et adresses.
 * Module pur : utilisé par l'envoi (serveur) comme par l'aperçu (navigateur).
 */

export const SITE_URL = 'https://labonnequittance.fr'

/** Expéditeur et adresse de réponse (boîte OVH ; domaine authentifié chez Brevo). */
export const EMAIL_EXPEDITEUR = { name: 'La Bonne Quittance', email: 'contact@labonnequittance.fr' }

/** Plafond par envoi : au-delà, une campagne Brevo est plus adaptée. */
export const MAX_DESTINATAIRES = 1000
/** Emails envoyés par appel serveur ; le navigateur enchaîne les lots. */
export const TAILLE_LOT = 10

/** Écrit seul sur une ligne, place le bouton d'action à cet endroit du message. */
export const MARQUEUR_BOUTON = '[bouton]'

/** Clé du pied de page dans la table admin_settings (supabase/emails.sql). */
export const CLE_PIED_DE_PAGE = 'email_footer'

export type FormatContenu = 'texte' | 'html'
export interface Contenu { format: FormatContenu; contenu: string }
export interface BoutonAction { texte: string; url: string }

export interface EmailPayload {
  objet: string
  corps: Contenu
  bouton: BoutonAction | null
  piedDePage: Contenu
}

export interface ResultatEnvoi {
  email: string
  statut: 'envoye' | 'exclu' | 'echec'
  erreur?: string
}

/** Liste d'adresses proposée dans « Ajouter une liste » (clics du tableau de bord). */
export interface ListeEmails { id: string; label: string; emails: string[] }

export const PIED_DE_PAGE_DEFAUT: Contenu = {
  format: 'texte',
  contenu: [
    '**La Bonne Quittance** · Quittances de loyer en ligne, 100 % gratuites',
    'https://labonnequittance.fr · [contact@labonnequittance.fr](mailto:contact@labonnequittance.fr)',
  ].join('\n'),
}

export function estContenu(v: unknown): v is Contenu {
  if (!v || typeof v !== 'object') return false
  const c = v as Contenu
  return (c.format === 'texte' || c.format === 'html') && typeof c.contenu === 'string'
}

// ── Adresses ──────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@,;<>()"']+@[^\s@,;<>()"']+\.[a-z]{2,}$/i

export function emailValide(v: string): boolean {
  return EMAIL_RE.test(v.trim())
}

/**
 * Découpe une saisie libre en adresses (virgules, points-virgules, espaces,
 * retours à la ligne). Accepte « Marie Dupont <marie@exemple.fr> », copié d'une
 * messagerie. Une entrée sans @ est gardée telle quelle pour être signalée.
 */
export function extraireAdresses(saisie: string): string[] {
  const adresses: string[] = []
  for (const entree of saisie.split(/[,;\n\r]+/)) {
    const e = entree.trim()
    if (!e) continue
    const chevrons = e.match(/<([^>]+)>/)
    if (chevrons) {
      adresses.push(chevrons[1].trim())
      continue
    }
    const avecArobase = e.split(/\s+/).filter(mot => mot.includes('@'))
    if (avecArobase.length === 0) {
      adresses.push(e)
      continue
    }
    for (const mot of avecArobase) adresses.push(mot.replace(/^[("']+|[)"'.]+$/g, ''))
  }
  return adresses.filter(Boolean)
}

/** Ajoute des adresses sans doublon (casse ignorée). */
export function fusionnerAdresses(liste: string[], ajouts: string[]) {
  const vues = new Set(liste.map(a => a.toLowerCase()))
  const resultat = [...liste]
  let ajoutees = 0
  let doublons = 0
  for (const a of ajouts) {
    const cle = a.toLowerCase()
    if (vues.has(cle)) {
      doublons++
      continue
    }
    vues.add(cle)
    resultat.push(a)
    ajoutees++
  }
  return { liste: resultat, ajoutees, doublons }
}

/** Lien autorisé dans un email : http(s) ou mailto ; « www.… » est complété en https. */
export function lienSur(url: string): string | null {
  const v = url.trim()
  if (/^(https?:\/\/|mailto:)[^\s<>"]+$/i.test(v)) return v
  if (/^www\.[^\s<>"]+$/i.test(v)) return `https://${v}`
  return null
}

// ── Texte simple ──────────────────────────────────────────────────────────────
// Paragraphes séparés par une ligne vide, « - » en début de ligne pour une liste,
// **gras**, [texte](https://…), adresses https://… cliquables, [bouton].

type Segment = { type: 'texte'; texte: string; gras?: boolean; lien?: string } | { type: 'br' }
type Bloc = { type: 'p' | 'li'; segments: Segment[] } | { type: 'bouton' }

const EN_LIGNE = /\[([^\]\n]+)\]\(([^)\s]+)\)|\*\*([^*\n]+)\*\*|(https?:\/\/[^\s<>()]*[^\s<>().,;:!?'"»])/g

function analyserLigne(ligne: string): Segment[] {
  const segments: Segment[] = []
  let fin = 0
  for (const m of ligne.matchAll(EN_LIGNE)) {
    const debut = m.index ?? 0
    if (debut > fin) segments.push({ type: 'texte', texte: ligne.slice(fin, debut) })
    if (m[1] !== undefined) {
      const lien = lienSur(m[2])
      segments.push(lien ? { type: 'texte', texte: m[1], lien } : { type: 'texte', texte: m[0] })
    } else if (m[3] !== undefined) {
      segments.push({ type: 'texte', texte: m[3], gras: true })
    } else {
      segments.push({ type: 'texte', texte: m[4], lien: m[4] })
    }
    fin = debut + m[0].length
  }
  if (fin < ligne.length) segments.push({ type: 'texte', texte: ligne.slice(fin) })
  return segments
}

function analyserTexte(texte: string): Bloc[] {
  const blocs: Bloc[] = []
  for (const paragraphe of texte.replace(/\r/g, '').split(/\n[ \t]*\n/)) {
    let courant: { type: 'p'; segments: Segment[] } | null = null
    for (const ligne of paragraphe.split('\n')) {
      if (ligne.trim().toLowerCase() === MARQUEUR_BOUTON) {
        blocs.push({ type: 'bouton' })
        courant = null
        continue
      }
      const puce = ligne.match(/^\s*[-•]\s+(.*)$/)
      if (puce) {
        blocs.push({ type: 'li', segments: analyserLigne(puce[1]) })
        courant = null
        continue
      }
      if (!ligne.trim()) continue
      if (courant) {
        courant.segments.push({ type: 'br' })
      } else {
        courant = { type: 'p', segments: [] }
        blocs.push(courant)
      }
      courant.segments.push(...analyserLigne(ligne))
    }
  }
  return blocs
}

/** Pour les nœuds texte : &, < et > suffisent (les apostrophes restent lisibles). */
function echapperTexte(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function echapperAttribut(v: string): string {
  return echapperTexte(v).replace(/"/g, '&quot;')
}

function segmentsHtml(segments: Segment[], styleLien?: string): string {
  return segments.map(s => {
    if (s.type === 'br') return '<br>\n'
    let h = echapperTexte(s.texte)
    if (s.gras) h = `<strong>${h}</strong>`
    if (s.lien) h = `<a href="${echapperAttribut(s.lien)}"${styleLien ? ` style="${styleLien}"` : ''}>${h}</a>`
    return h
  }).join('')
}

/** Texte simple → HTML équivalent et lisible (passage en mode HTML). */
export function texteVersHtml(texte: string): string {
  const lignes: string[] = []
  let liste = false
  for (const b of analyserTexte(texte)) {
    if (b.type === 'li') {
      if (!liste) lignes.push('<ul>')
      liste = true
      lignes.push(`  <li>${segmentsHtml(b.segments)}</li>`)
      continue
    }
    if (liste) lignes.push('</ul>')
    liste = false
    lignes.push(b.type === 'bouton' ? `<p>${MARQUEUR_BOUTON}</p>` : `<p>${segmentsHtml(b.segments)}</p>`)
  }
  if (liste) lignes.push('</ul>')
  return lignes.join('\n')
}

/** Vrai si le message n'a rien à afficher (le marqueur [bouton] seul ne compte pas). */
export function contenuVide(c: Contenu): boolean {
  if (c.format === 'texte') return !analyserTexte(c.contenu).some(b => b.type !== 'bouton')
  if (/<img\b/i.test(c.contenu)) return false
  return !c.contenu
    .replace(/<[^>]*>/g, '')
    .replace(/\[bouton\]/gi, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

// ── Gabarit ───────────────────────────────────────────────────────────────────

const VERT = '#008020'
const POLICE = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"

interface Styles { p: string; ul: string; li: string; lien: string }

const STYLES_CORPS: Styles = {
  p: `margin:0 0 14px;font-family:${POLICE};font-size:15px;line-height:1.65;color:#1f2937;`,
  ul: 'margin:0 0 14px;padding:0 0 0 22px;',
  li: `margin:0 0 6px;font-family:${POLICE};font-size:15px;line-height:1.65;color:#1f2937;`,
  lien: `color:${VERT};text-decoration:underline;`,
}

const STYLES_PIED: Styles = {
  p: `margin:0 0 4px;font-family:${POLICE};font-size:12px;line-height:1.6;color:#5f6773;`,
  ul: 'margin:0 0 4px;padding:0;list-style:none;',
  li: `margin:0;font-family:${POLICE};font-size:12px;line-height:1.6;color:#5f6773;`,
  lien: 'color:#00701c;text-decoration:underline;',
}

/** Bouton « bulletproof » : un tableau, affiché pareil dans toutes les messageries. */
function boutonHtml(b: BoutonAction | null | undefined): string {
  const url = b ? lienSur(b.url) : null
  if (!b || !b.texte.trim() || !url) return ''
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:6px 0 22px;"><tr><td style="border-radius:10px;background:${VERT};"><a href="${echapperAttribut(url)}" style="display:inline-block;padding:13px 24px;font-family:${POLICE};font-size:15px;font-weight:700;line-height:1.2;color:#ffffff;text-decoration:none;border-radius:10px;">${echapperTexte(b.texte.trim())}</a></td></tr></table>`
}

function blocsHtml(blocs: Bloc[], styles: Styles, bouton: string): string {
  let html = ''
  let liste = false
  for (const b of blocs) {
    if (b.type === 'li') {
      if (!liste) html += `<ul style="${styles.ul}">`
      liste = true
      html += `<li style="${styles.li}">${segmentsHtml(b.segments, styles.lien)}</li>`
      continue
    }
    if (liste) html += '</ul>'
    liste = false
    html += b.type === 'bouton' ? bouton : `<p style="${styles.p}">${segmentsHtml(b.segments, styles.lien)}</p>`
  }
  if (liste) html += '</ul>'
  return html
}

/** Contenu → HTML. En mode HTML, le code de l'admin est inséré tel quel. */
function contenuHtml(c: Contenu, styles: Styles, bouton: string): { html: string; boutonPlace: boolean } {
  if (c.format === 'texte') {
    const blocs = analyserTexte(c.contenu)
    return { html: blocsHtml(blocs, styles, bouton), boutonPlace: blocs.some(b => b.type === 'bouton') }
  }
  let boutonPlace = false
  const placer = () => {
    boutonPlace = true
    return bouton
  }
  const html = c.contenu
    .replace(/<p\b[^>]*>\s*\[bouton\]\s*<\/p>/gi, placer)
    .replace(/\[bouton\]/gi, placer)
  return { html, boutonPlace }
}

export interface EmailAConstruire extends EmailPayload {
  /** Lien « Se désinscrire » propre au destinataire. */
  lienDesinscription: string
  /** Origine du logo : le site dans les emails, '' dans l'aperçu (même origine que la page). */
  origineImages?: string
  /** Aperçu dans /admin/emails : les liens s'ouvrent dans un nouvel onglet. */
  apercu?: boolean
}

/** Email complet : en-tête avec le logo, corps, bouton, pied de page et désinscription. */
export function construireEmailHtml(e: EmailAConstruire): string {
  const bouton = boutonHtml(e.bouton)
  const corps = contenuHtml(e.corps, STYLES_CORPS, bouton)
  const pied = contenuHtml(e.piedDePage, STYLES_PIED, '')
  const origine = e.origineImages ?? SITE_URL
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${echapperTexte(e.objet)}</title>${e.apercu ? '\n<base target="_blank">' : ''}
<style>
@media (max-width: 620px) { .lbq-px { padding-left: 20px !important; padding-right: 20px !important; } }
</style>
</head>
<body style="margin:0;padding:0;background:#eef2ef;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef2ef;">
<tr><td align="center" style="padding:24px 12px;">
<!--[if mso]><table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border-top:4px solid ${VERT};border-radius:12px;">
<tr><td align="center" class="lbq-px" style="padding:24px 32px 16px;">
<a href="${SITE_URL}" style="text-decoration:none;"><img src="${origine}/email-logo.png" width="168" alt="La Bonne Quittance" style="display:block;width:168px;max-width:100%;height:auto;border:0;"></a>
</td></tr>
<tr><td class="lbq-px" style="padding:0 32px;"><div style="height:1px;line-height:1px;font-size:1px;background:#eef0ee;">&nbsp;</div></td></tr>
<tr><td class="lbq-px" style="padding:24px 32px 10px;font-family:${POLICE};font-size:15px;line-height:1.65;color:#1f2937;">
${corps.html}${corps.boutonPlace ? '' : bouton}
</td></tr>
<tr><td class="lbq-px" style="padding:18px 32px 20px;background:#f6f8f6;border-top:1px solid #eef0ee;border-radius:0 0 12px 12px;text-align:center;font-family:${POLICE};font-size:12px;line-height:1.6;color:#5f6773;">
${pied.html}
<p style="margin:10px 0 0;font-family:${POLICE};font-size:11px;line-height:1.6;color:#5f6773;">Vous ne souhaitez plus recevoir nos emails ? <a href="${echapperAttribut(e.lienDesinscription)}" style="color:#5f6773;text-decoration:underline;">Se désinscrire</a></p>
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`
}
