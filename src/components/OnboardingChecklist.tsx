'use client'

import Link from 'next/link'
import { Check, ArrowRight, Sparkles } from 'lucide-react'
import type { Proprietaire, Bien, Locataire, QuittanceRecord } from '@/lib/types'
import { isProfileComplete } from '@/lib/onboarding'

type Props = {
  proprietaire: Proprietaire | null
  biens: Bien[]
  locataires: Locataire[]
  quittances: QuittanceRecord[]
}

export default function OnboardingChecklist({ proprietaire, biens, locataires, quittances }: Props) {
  const profileDone = isProfileComplete(proprietaire)
  const biensDone = biens.length > 0
  const locatairesDone = locataires.length > 0
  // quittance "réelle" = téléchargée ou envoyée (pas juste visionnée)
  const quittanceDone = quittances.some(q => q.action === 'telecharge' || q.action === 'envoye')

  const steps = [
    { key: 'profile',    label: 'Compléter mon profil',          href: '/profil',     done: profileDone },
    { key: 'bien',       label: 'Ajouter un bien',                href: '/biens',      done: biensDone },
    { key: 'locataire',  label: 'Ajouter un locataire',           href: '/locataires', done: locatairesDone },
    { key: 'quittance',  label: 'Générer ma première quittance',  href: null,          done: quittanceDone },
  ] as const

  const doneCount = steps.filter(s => s.done).length
  const total = steps.length

  // Tout fait → on n'affiche pas la checklist
  if (doneCount === total) return null

  // L'étape "active" = première non faite (où l'utilisateur doit aller)
  const activeIdx = steps.findIndex(s => !s.done)

  return (
    <div className="px-4 lg:px-8 pt-4 max-w-4xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#008020]" />
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Démarrage rapide</h2>
          </div>
          <span className="text-xs font-semibold text-gray-500">{doneCount}/{total}</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-5">
          <div
            className="h-full bg-[#008020] transition-all duration-500"
            style={{ width: `${(doneCount / total) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <ul className="space-y-2">
          {steps.map((step, i) => {
            const isActive = i === activeIdx
            const isLocked = !step.done && i > activeIdx

            return (
              <li
                key={step.key}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  step.done ? 'bg-green-50' : isActive ? 'bg-gray-50 border border-gray-200' : 'opacity-50'
                }`}
              >
                {/* Checkbox / Checkmark */}
                <span
                  className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full ${
                    step.done ? 'bg-[#008020]' : 'bg-white border-2 border-gray-300'
                  }`}
                >
                  {step.done && <Check size={12} className="text-white" strokeWidth={3} />}
                </span>

                {/* Label */}
                <span className={`flex-1 text-sm ${step.done ? 'text-gray-500 line-through' : 'text-gray-800 font-medium'}`}>
                  {step.label}
                </span>

                {/* Action */}
                {!step.done && step.href && isActive && (
                  <Link
                    href={step.href}
                    className="flex items-center gap-1 text-xs font-semibold text-[#008020] hover:underline shrink-0"
                  >
                    Faire <ArrowRight size={12} />
                  </Link>
                )}
                {!step.done && !step.href && isActive && (
                  <span className="text-xs text-gray-400 shrink-0">Bientôt</span>
                )}
                {isLocked && (
                  <span className="text-xs text-gray-400 shrink-0">À venir</span>
                )}
              </li>
            )
          })}
        </ul>

      </div>
    </div>
  )
}
