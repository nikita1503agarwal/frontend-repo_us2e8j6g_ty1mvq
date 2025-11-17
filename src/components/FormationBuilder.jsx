import React, { useEffect, useMemo, useRef, useState } from 'react'

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Pitch({ positions, onDrag }){
  // Simple futsal pitch with percentage positions
  return (
    <div className="relative w-full aspect-[3/2] bg-green-600 rounded-lg overflow-hidden border">
      {/* midline */}
      <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/60"/>
      {/* circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-white/70 rounded-full w-24 h-24"/>

      {positions.map(p => (
        <div
          key={p.player_id || p.key}
          draggable
          onDragStart={(e)=>{
            e.dataTransfer.setData('text/plain', JSON.stringify(p))
          }}
          onDragEnd={(e)=>{
            const rect = e.currentTarget.parentElement.getBoundingClientRect()
            const x = ((e.clientX - rect.left) / rect.width) * 100
            const y = ((e.clientY - rect.top) / rect.height) * 100
            onDrag(p, Math.min(100, Math.max(0, x)), Math.min(100, Math.max(0, y)))
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 cursor-move"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-xs font-bold text-gray-700 border">
            {p.label || 'P'}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function FormationBuilder(){
  const [teams, setTeams] = useState([])
  const [teamId, setTeamId] = useState('')
  const [formation, setFormation] = useState({ name: 'Default', positions: [] })

  const loadTeams = async () => {
    const res = await fetch(`${baseUrl}/teams`)
    const data = await res.json()
    setTeams(data)
    if(data[0]) setTeamId(data[0].id || data[0]._id)
  }

  const loadFormation = async (tid) => {
    if(!tid) return
    const res = await fetch(`${baseUrl}/formations/${tid}`)
    const data = await res.json()
    if(!data.positions || data.positions.length===0){
      // default 1-2-1 + GK
      const defaults = [
        { key: 'GK', x: 10, y: 50, label: 'GK' },
        { key: 'D1', x: 35, y: 35, label: 'D' },
        { key: 'D2', x: 35, y: 65, label: 'D' },
        { key: 'M', x: 60, y: 50, label: 'M' },
        { key: 'F', x: 80, y: 50, label: 'F' },
      ]
      setFormation({ name: data.name || 'Default', positions: defaults })
    } else {
      setFormation(data)
    }
  }

  useEffect(()=>{ loadTeams() }, [])
  useEffect(()=>{ loadFormation(teamId) }, [teamId])

  const onDrag = (p, x, y) => {
    setFormation(f => ({ ...f, positions: f.positions.map(pp => (pp.key===p.key || pp.player_id===p.player_id) ? { ...pp, x, y } : pp) }))
  }

  const save = async () => {
    if(!teamId) return
    const payload = { team_id: teamId, name: formation.name || 'Default', positions: formation.positions }
    const res = await fetch(`${baseUrl}/formations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()
    setFormation(data)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select value={teamId} onChange={e=>setTeamId(e.target.value)} className="border rounded px-3 py-2">
          {teams.map(t => <option key={t.id || t._id} value={t.id || t._id}>{t.name}</option>)}
        </select>
        <input value={formation.name} onChange={e=>setFormation(f=>({...f, name: e.target.value}))} className="border rounded px-3 py-2"/>
        <button onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
      </div>
      <Pitch positions={formation.positions} onDrag={onDrag}/>
      <p className="text-gray-500 text-sm">Drag the markers to set your 5-player formation layout, then save it for your team.</p>
    </div>
  )
}
