import React, { useEffect, useMemo, useState } from 'react'

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function TeamSelector({ teams, onStart }){
  const [home, setHome] = useState('')
  const [away, setAway] = useState('')

  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <select className="border rounded px-3 py-2" value={home} onChange={e=>setHome(e.target.value)}>
          <option value="">Select Home Team</option>
          {teams.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select className="border rounded px-3 py-2" value={away} onChange={e=>setAway(e.target.value)}>
          <option value="">Select Away Team</option>
          {teams.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <button disabled={!home || !away || home===away} onClick={()=>onStart(home, away)} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Start Match</button>
    </div>
  )
}

function EventButton({ label, onClick }){
  return <button onClick={onClick} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded border text-sm">{label}</button>
}

export default function LiveMatch(){
  const [teams, setTeams] = useState([])
  const [match, setMatch] = useState(null)

  const loadTeams = async () => {
    const res = await fetch(`${baseUrl}/teams`)
    const data = await res.json()
    setTeams(data.map(t=> ({ id: t.id || t._id, name: t.name })))
  }

  useEffect(()=>{ loadTeams() }, [])

  const start = async (home, away) => {
    const res = await fetch(`${baseUrl}/matches/start`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ home_team_id: home, away_team_id: away }) })
    const data = await res.json()
    setMatch(data)
  }

  const addEvent = async (type, team_id) => {
    if(!match) return
    const res = await fetch(`${baseUrl}/matches/${match.match_id || match.id}/event`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, team_id }) })
    const data = await res.json()
    setMatch(data)
  }

  if(!match){
    return (
      <div className="space-y-4">
        <TeamSelector teams={teams} onStart={start}/>
        <p className="text-gray-600 text-sm">Tip: Create teams first to start a match.</p>
      </div>
    )
  }

  const homeScore = match.home_score
  const awayScore = match.away_score

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
        <div className="font-semibold">Live Match</div>
        <div className="text-2xl font-bold">{homeScore} - {awayScore}</div>
      </div>
      <div className="bg-white border rounded-lg p-4 flex gap-2 flex-wrap">
        <EventButton label="Home Goal" onClick={()=>addEvent('goal', match.home_team_id)}/>
        <EventButton label="Away Goal" onClick={()=>addEvent('goal', match.away_team_id)}/>
        <EventButton label="Home Own Goal" onClick={()=>addEvent('own_goal', match.home_team_id)}/>
        <EventButton label="Away Own Goal" onClick={()=>addEvent('own_goal', match.away_team_id)}/>
        <EventButton label="Home Yellow" onClick={()=>addEvent('yellow', match.home_team_id)}/>
        <EventButton label="Away Yellow" onClick={()=>addEvent('yellow', match.away_team_id)}/>
      </div>
      <div className="bg-white border rounded-lg">
        <div className="px-4 py-2 bg-gray-50 font-semibold">Events</div>
        <div className="divide-y max-h-64 overflow-auto">
          {(match.events||[]).slice().reverse().map((e, i)=> (
            <div key={i} className="px-4 py-2 text-sm flex items-center justify-between">
              <div className="capitalize">{e.type}</div>
              <div className="text-gray-500">{new Date(e.timestamp).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
