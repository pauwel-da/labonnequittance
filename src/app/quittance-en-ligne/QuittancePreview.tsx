'use client'

import type { TrialFormData } from './TrialForm'

const MOIS_FR: Record<number, string> = {
  0: 'JANVIER', 1: 'FÉVRIER', 2: 'MARS', 3: 'AVRIL', 4: 'MAI', 5: 'JUIN',
  6: 'JUILLET', 7: 'AOÛT', 8: 'SEPTEMBRE', 9: 'OCTOBRE', 10: 'NOVEMBRE', 11: 'DÉCEMBRE',
}

function fmtEUR(n: number) {
  if (!Number.isFinite(n) || n === 0) return '— €'
  return `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
}

function fmtDate(iso: string) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return '—'
  return `${d}/${m}/${y}`
}

function periodHeader(debut: string, fin: string) {
  if (!debut && !fin) return '—'
  return `Période du ${fmtDate(debut)} au ${fmtDate(fin)}`
}

export default function QuittancePreview({ data }: { data: TrialFormData }) {
  const loyer = Number(data.locataire.montant_loyer) || 0
  const charges = Number(data.locataire.montant_charges) || 0
  const total = loyer + charges

  const now = new Date()
  const monthYear = `${MOIS_FR[now.getMonth()]} ${now.getFullYear()}`

  const bailleur =
    [data.bailleur.prenom, data.bailleur.nom].filter(Boolean).join(' ') || '— Bailleur —'
  const locataireName = data.locataire.nom_prenom || '— Locataire —'
  const propRue = data.bailleur.adresse || '— Adresse —'
  const propCpVille = [data.bailleur.code_postal, data.bailleur.ville].filter(Boolean).join(' ') || '—'
  const locRue = data.bien.adresse || '— Adresse du bien —'
  const locCpVille = [data.bien.code_postal, data.bien.ville].filter(Boolean).join(' ') || '—'
  const typeBail = data.bien.type_location === 'meuble' ? 'Meublé' : 'Non meublé'
  const villeEmission = data.bailleur.ville || '—'
  const datePaiement = fmtDate(data.locataire.date_paiement)
  const dateDebut = fmtDate(data.locataire.date_debut_periode)
  const dateFin = fmtDate(data.locataire.date_fin_periode)

  return (
    <div
      className="bg-white rounded-lg shadow-2xl shadow-[#1A2744]/15 border border-gray-200 overflow-hidden text-[11px] leading-relaxed"
      style={{ aspectRatio: '1 / 1.414', minHeight: '500px' }}
    >
      <div className="p-6 sm:p-8 h-full flex flex-col">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-[#1A2744] font-bold text-xl sm:text-2xl tracking-tight">QUITTANCE DE LOYER</h1>
        </div>
        <hr className="border-gray-200 my-3" />
        <p className="text-center text-[#1A2744] font-semibold text-[11px]">
          {periodHeader(data.locataire.date_debut_periode, data.locataire.date_fin_periode)}
        </p>
        <hr className="border-gray-200 my-3" />

        {/* BAILLEUR / LOCATAIRE */}
        <div className="grid grid-cols-2 gap-2.5 mt-2">
          <div className="bg-[#F7F8FA] border border-gray-200 rounded-md p-3">
            <p className="text-[8px] uppercase tracking-wider text-[#8C909A] font-semibold mb-1">Bailleur</p>
            <p className="text-[#1A2744] font-bold text-[12px] mb-0.5 truncate">{bailleur}</p>
            <p className="text-[#2D3748] text-[10px] truncate">{propRue}</p>
            <p className="text-[#2D3748] text-[10px] truncate">{propCpVille}</p>
          </div>
          <div className="bg-[#F7F8FA] border border-gray-200 rounded-md p-3">
            <p className="text-[8px] uppercase tracking-wider text-[#8C909A] font-semibold mb-1">Locataire</p>
            <p className="text-[#1A2744] font-bold text-[12px] mb-0.5 truncate">{locataireName}</p>
            <p className="text-[#2D3748] text-[10px] truncate">{locRue}</p>
            <p className="text-[#2D3748] text-[10px] truncate">{locCpVille}</p>
            <p className="text-[#2D3748] text-[10px] mt-1">Type de bail : {typeBail}</p>
          </div>
        </div>

        {/* TABLE DÉTAIL */}
        <div className="mt-4">
          <div className="bg-[#1A2744] text-white px-3 py-1.5 rounded-t-md">
            <p className="text-[9px] font-bold tracking-wide">DÉTAIL DU PAIEMENT</p>
          </div>
          <div className="bg-[#F7F8FA] px-3 py-1 flex justify-between text-[8px] uppercase tracking-wider text-[#8C909A] font-semibold">
            <span>Désignation</span>
            <span>Montant</span>
          </div>
          <div className="px-3 py-2 border-t border-gray-200 flex justify-between text-[#2D3748]">
            <span>Loyer hors charges</span>
            <span>{fmtEUR(loyer)}</span>
          </div>
          <div className="px-3 py-2 border-t border-gray-200 flex justify-between text-[#2D3748]">
            <span>Provisions sur charges</span>
            <span>{fmtEUR(charges)}</span>
          </div>
          <div className="px-3 py-2 border-t-2 border-b-2 border-[#1A2744] flex justify-between text-[#1A2744] font-bold">
            <span>Total reçu</span>
            <span>{fmtEUR(total)}</span>
          </div>
          <div className="px-3 py-2 border-b border-gray-200 flex justify-between text-[#1A2744] font-bold">
            <span>Date de paiement</span>
            <span>{datePaiement}</span>
          </div>
        </div>

        {/* DECLARATION */}
        <div className="mt-4 bg-[#F7F8FA] rounded-md p-3 text-[10px] text-[#2D3748]">
          <p>
            Je soussigné(e), <span className="font-medium">{bailleur}</span>, bailleur du logement sis{' '}
            <span className="font-medium">{locRue}, {locCpVille}</span>, déclare avoir reçu de{' '}
            <span className="font-medium">{locataireName}</span> la somme de{' '}
            <span className="font-medium">{fmtEUR(total)}</span>, versée le{' '}
            <span className="font-medium">{datePaiement}</span> en règlement du loyer et des charges
            de la période du <span className="font-medium">{dateDebut}</span> au{' '}
            <span className="font-medium">{dateFin}</span>, et lui en donne quittance, sous réserve
            de tous mes droits.
          </p>
          <p className="text-[#8C909A] text-[9px] mt-2">
            Cette quittance annule tous les reçus qui auraient pu être établis précédemment en cas
            de paiement partiel du montant du présent terme. Elle est à conserver pendant 3 ans par
            le locataire (loi n° 89-462 du 6 juillet 1989, art. 21).
          </p>
        </div>

        {/* SIGNATURE */}
        <div className="mt-4 text-[#2D3748] text-[10px]">
          Fait à {villeEmission}, le {fmtDate(new Date().toISOString().slice(0, 10))}
        </div>
        <div className="mt-2 flex-1 flex flex-col justify-end">
          <div className="w-32">
            {data.signature?.startsWith('data:image') && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.signature} alt="Signature" className="h-12 w-auto object-contain mb-0.5" />
            )}
            <div className="border-t border-gray-200 pt-1">
              <p className="text-center text-[8px] uppercase tracking-wider text-[#8C909A]">Le Bailleur</p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-3 pt-2 border-t border-gray-200 text-center">
          <p className="text-[#1A2744] font-bold text-[8px]">QUITTANCE {monthYear}</p>
          <p className="text-[#8C909A] text-[7px] mt-0.5">Document conforme au décret du 26 août 1987</p>
        </div>
      </div>
    </div>
  )
}
