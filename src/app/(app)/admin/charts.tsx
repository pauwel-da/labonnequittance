// Composants serveur : graphiques CSS très simples (une seule série, pas de lib).

export interface BarPoint {
  key: string
  label: string
  value: number
  /** Texte du tooltip natif (survol). */
  title: string
}

export function BarChart({
  points,
  every = 5,
  labelAll = false,
}: {
  points: BarPoint[]
  /** Afficher une étiquette d'axe tous les N points. */
  every?: number
  /** Afficher la valeur au-dessus de chaque barre (petites séries). */
  labelAll?: boolean
}) {
  const max = Math.max(1, ...points.map(p => p.value))
  const maxIndex = points.findIndex(p => p.value === max)

  return (
    <div>
      <div className="flex items-end gap-[2px] h-32 border-b border-gray-200">
        {points.map((p, i) => {
          const showValue = p.value > 0 && (labelAll || i === maxIndex)
          return (
            <div
              key={p.key}
              title={p.title}
              className="flex-1 h-full flex flex-col justify-end items-center hover:bg-gray-50 rounded-t-sm min-w-0"
            >
              {showValue && (
                <span className="text-[10px] font-medium text-gray-600 tabular-nums leading-none mb-1">{p.value}</span>
              )}
              <div
                className="w-full bg-[#008020] rounded-t-[4px]"
                style={{ height: p.value > 0 ? `${Math.max(3, (p.value / max) * 100)}%` : '0%' }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex gap-[2px] mt-1">
        {points.map((p, i) => (
          <div key={p.key} className="flex-1 text-[10px] text-gray-400 text-center whitespace-nowrap min-w-0">
            {labelAll || i % every === 0 || i === points.length - 1 ? p.label : ''}
          </div>
        ))}
      </div>
    </div>
  )
}

export interface FunnelStep {
  label: string
  value: number
  hint?: string
}

export function Funnel({ steps }: { steps: FunnelStep[] }) {
  const base = Math.max(1, steps[0]?.value ?? 0)
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => {
        const pct = Math.round((s.value / base) * 100)
        const prev = i > 0 ? steps[i - 1].value : null
        const drop = prev !== null && prev > 0 ? Math.round(((prev - s.value) / prev) * 100) : null
        return (
          <li key={s.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm mb-1">
              <span className="text-gray-700 truncate">
                {s.label}
                {s.hint && <span className="text-gray-400 text-xs ml-1.5">{s.hint}</span>}
              </span>
              <span className="tabular-nums whitespace-nowrap">
                <span className="font-semibold text-gray-900">{s.value}</span>
                <span className="text-gray-400 text-xs ml-1.5">
                  {pct} %{drop !== null && drop > 0 && <span className="text-red-500"> · −{drop} %</span>}
                </span>
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#008020] rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </li>
        )
      })}
    </ol>
  )
}
