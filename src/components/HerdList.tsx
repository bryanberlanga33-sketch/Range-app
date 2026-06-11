import type { Herd, LivestockType } from '../types'

const TYPE_EMOJI: Record<LivestockType, string> = {
  Cattle: '🐂',
  Sheep: '🐑',
  Goats: '🐐',
  Horses: '🐎',
}

interface HerdListProps {
  herds: Herd[]
  onRemove: (id: string) => void
}

export function HerdList({ herds, onRemove }: HerdListProps) {
  if (herds.length === 0) {
    return (
      <p className="empty-state">
        No herds yet. Add your first herd using the form to start tracking your range.
      </p>
    )
  }

  return (
    <ul className="herd-list">
      {herds.map((herd) => (
        <li key={herd.id} className="herd-card">
          <span className="herd-card__icon" aria-hidden="true">
            {TYPE_EMOJI[herd.type]}
          </span>
          <div className="herd-card__body">
            <h3 className="herd-card__name">{herd.name}</h3>
            <p className="herd-card__meta">
              <span>{herd.type}</span>
              <span aria-hidden="true">•</span>
              <span>{herd.headCount} head</span>
              <span aria-hidden="true">•</span>
              <span>📍 {herd.pasture}</span>
            </p>
          </div>
          <button
            type="button"
            className="btn btn--ghost"
            aria-label={`Remove ${herd.name}`}
            onClick={() => onRemove(herd.id)}
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  )
}
