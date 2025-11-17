import React from 'react'

export default function Header({ current, onChange }) {
  const tabs = [
    { key: 'leaderboard', label: 'Leaderboards' },
    { key: 'match', label: 'Live Match' },
    { key: 'formation', label: 'Formation Builder' },
  ]
  return (
    <div className="w-full bg-white/80 backdrop-blur border-b sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-xl font-bold text-blue-700">Futsal Hub</div>
        <nav className="flex gap-2">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${current===t.key ? 'bg-blue-600 text-white' : 'hover:bg-blue-100 text-gray-700'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
