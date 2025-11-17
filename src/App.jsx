import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import Leaderboards from './components/Leaderboards'
import LiveMatch from './components/LiveMatch'
import FormationBuilder from './components/FormationBuilder'

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function App(){
  const [view, setView] = useState('leaderboard')
  const [teamForm, setTeamForm] = useState({ name: '', country: '', city: '' })
  const [teams, setTeams] = useState([])

  const loadTeams = async () => {
    const res = await fetch(`${baseUrl}/teams`)
    const data = await res.json()
    setTeams(data)
  }
  useEffect(()=>{ loadTeams() }, [])

  const createTeam = async (e) => {
    e.preventDefault()
    const res = await fetch(`${baseUrl}/teams`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(teamForm) })
    if(res.ok){
      setTeamForm({ name: '', country: '', city: '' })
      loadTeams()
      alert('Team created')
    } else {
      const err = await res.json()
      alert(err.detail || 'Failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50">
      <Header current={view} onChange={setView}/>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="bg-white border rounded-lg p-4">
          <form onSubmit={createTeam} className="grid md:grid-cols-4 gap-3">
            <input required value={teamForm.name} onChange={e=>setTeamForm(f=>({...f, name: e.target.value}))} placeholder="Team name" className="px-3 py-2 border rounded" />
            <input required value={teamForm.country} onChange={e=>setTeamForm(f=>({...f, country: e.target.value}))} placeholder="Country" className="px-3 py-2 border rounded" />
            <input required value={teamForm.city} onChange={e=>setTeamForm(f=>({...f, city: e.target.value}))} placeholder="City" className="px-3 py-2 border rounded" />
            <button className="px-3 py-2 bg-blue-600 text-white rounded">Add Team</button>
          </form>
        </div>

        {view === 'leaderboard' && <Leaderboards/>}
        {view === 'match' && <LiveMatch/>}
        {view === 'formation' && <FormationBuilder/>}

        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600">Teams created: {teams.length}</div>
        </div>
      </div>
    </div>
  )
}
