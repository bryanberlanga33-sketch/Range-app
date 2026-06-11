import { useEffect, useMemo, useState } from 'react'
import './App.css'
import type { Herd, LivestockType } from './types'
import { loadHerds, saveHerds } from './storage'
import { HerdForm } from './components/HerdForm'
import { HerdList } from './components/HerdList'

function App() {
  const [herds, setHerds] = useState<Herd[]>(() => loadHerds())

  useEffect(() => {
    saveHerds(herds)
  }, [herds])

  const totalHead = useMemo(
    () => herds.reduce((sum, herd) => sum + herd.headCount, 0),
    [herds],
  )
  const pastureCount = useMemo(
    () => new Set(herds.map((herd) => herd.pasture.trim().toLowerCase())).size,
    [herds],
  )

  function addHerd(input: {
    name: string
    type: LivestockType
    headCount: number
    pasture: string
  }) {
    const herd: Herd = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      type: input.type,
      headCount: input.headCount,
      pasture: input.pasture.trim(),
      createdAt: Date.now(),
    }
    setHerds((prev) => [herd, ...prev])
  }

  function removeHerd(id: string) {
    setHerds((prev) => prev.filter((herd) => herd.id !== id))
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__logo" aria-hidden="true">
            🐂
          </span>
          <div>
            <h1>Range App</h1>
            <p className="app__tagline">Herd &amp; pasture management for ranchers</p>
          </div>
        </div>
        <dl className="stats">
          <div className="stats__item">
            <dt>Herds</dt>
            <dd>{herds.length}</dd>
          </div>
          <div className="stats__item">
            <dt>Head of livestock</dt>
            <dd>{totalHead}</dd>
          </div>
          <div className="stats__item">
            <dt>Pastures in use</dt>
            <dd>{pastureCount}</dd>
          </div>
        </dl>
      </header>

      <main className="app__main">
        <section className="panel">
          <h2>Add a herd</h2>
          <HerdForm onAdd={addHerd} />
        </section>

        <section className="panel">
          <h2>Your herds</h2>
          <HerdList herds={herds} onRemove={removeHerd} />
        </section>
      </main>

      <footer className="app__footer">
        Range App — a starter ranch management tool. Data is stored locally in your browser.
      </footer>
    </div>
  )
}

export default App
