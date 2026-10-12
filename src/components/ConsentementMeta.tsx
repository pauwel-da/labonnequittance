import Link from 'next/link'

/**
 * Case facultative, décochée par défaut : autorise l'envoi de l'inscription à Meta
 * (API Conversions, voir src/lib/meta-capi.ts). Sans elle, rien n'est transmis.
 */
export default function ConsentementMeta({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-start gap-2 text-[11px] leading-snug text-gray-500 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mt-0.5 h-3.5 w-3.5 flex-none accent-[#008020] cursor-pointer"
      />
      <span>
        Facultatif : j&apos;accepte que La Bonne Quittance informe Meta (Facebook, Instagram) de mon
        inscription, pour mesurer l&apos;efficacité de ses publicités.{' '}
        <Link href="/confidentialite#meta" target="_blank" className="underline hover:text-[#008020]">
          En savoir plus
        </Link>
      </span>
    </label>
  )
}
