import { useState } from 'react'
import type { LivestockType } from '../types'

const LIVESTOCK_TYPES: LivestockType[] = ['Cattle', 'Sheep', 'Goats', 'Horses']

interface HerdFormProps {
  onAdd: (input: {
    name: string
    type: LivestockType
    headCount: number
    pasture: string
  }) => void
}

export function HerdForm({ onAdd }: HerdFormProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<LivestockType>('Cattle')
  const [headCount, setHeadCount] = useState('')
  const [pasture, setPasture] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()
    const trimmedPasture = pasture.trim()
    const count = Number(headCount)

    if (!trimmedName) {
      setError('Please give the herd a name.')
      return
    }
    if (!trimmedPasture) {
      setError('Please assign the herd to a pasture.')
      return
    }
    if (!Number.isFinite(count) || count <= 0) {
      setError('Head count must be a positive number.')
      return
    }

    onAdd({
      name: trimmedName,
      type,
      headCount: Math.floor(count),
      pasture: trimmedPasture,
    })

    setName('')
    setType('Cattle')
    setHeadCount('')
    setPasture('')
    setError(null)
  }

  return (
    <form className="herd-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="herd-name">Herd name</label>
        <input
          id="herd-name"
          type="text"
          placeholder="e.g. North Pasture Cows"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="herd-type">Livestock type</label>
        <select
          id="herd-type"
          value={type}
          onChange={(event) => setType(event.target.value as LivestockType)}
        >
          {LIVESTOCK_TYPES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="herd-count">Head count</label>
        <input
          id="herd-count"
          type="number"
          min="1"
          placeholder="e.g. 120"
          value={headCount}
          onChange={(event) => setHeadCount(event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="herd-pasture">Pasture</label>
        <input
          id="herd-pasture"
          type="text"
          placeholder="e.g. Cedar Ridge"
          value={pasture}
          onChange={(event) => setPasture(event.target.value)}
        />
      </div>

      {error && (
        <p className="herd-form__error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="btn btn--primary">
        Add herd
      </button>
    </form>
  )
}
