import React, { useEffect, useState } from 'react'

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function StatFilter({ scope, setScope, country, setCountry, city, setCity, stat, setStat, type, setType }) {
  return (
    <div className="grid md:grid-cols-6 grid-cols-2 gap-3 p-4 bg-white/60 rounded-lg border">
      <select value={type} onChange={e=>setType(e.target.value)} className="px-3 py-2 border rounded">
        <option value="teams">Teams</option>
        <option value="players">Players</option>
      </select>
      <select value={stat} onChange={e=>setStat(e.target.value)} className="px-3 py-2 border rounded">
        {type==='teams' ? (
          <>
            <option value="goals">Goals</option>
            <option value="wins">Wins</option>
            <option value="points">Points</option>
          </>
        ) : (
          <>
            <option value="goals">Goals</option>
            <option value="assists">Assists</option>
            <option value="yellow">Yellow Cards</option>
            <option value="red">Red Cards</option>
          </>
        )}
      </select>
      <select value={scope} onChange={e=>setScope(e.target.value)} className="px-3 py-2 border rounded">
        <option value="global">Global</option>
        <option value="country">By Country</option>
        <option value="city">By City</option>
      </select>
      <input value={country} onChange={e=>setCountry(e.target.value)} placeholder="Country" className="px-3 py-2 border rounded"/>
      <input value={city} onChange={e=>setCity(e.target.value)} placeholder="City" className="px-3 py-2 border rounded"/>
      <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={()=>{}}>Refresh</button>
    </div>
  )
}

export default function Leaderboards(){
  const [type, setType] = useState('teams')
  const [stat, setStat] = useState('goals')
  const [scope, setScope] = useState('global')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try{
      const params = new URLSearchParams({ scope, stat })
      if(country) params.append('country', country)
      if(city) params.append('city', city)
      const url = type==='teams' ? `${baseUrl}/leaderboard/teams?${params}` : `${baseUrl}/leaderboard/players?${params}`
      const res = await fetch(url)
      const data = await res.json()
      setRows(data)
    }catch(e){
      console.error(e)
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{ fetchData() }, [type, stat, scope, country, city])

  return (
    <div className="space-y-4">
      <StatFilter {...{scope,setScope,country,setCountry,city,setCity,stat,setStat,type,setType}}/>
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="grid grid-cols-6 gap-2 px-4 py-2 bg-gray-50 font-semibold text-sm">
          {type==='teams' ? (
            <>
              <div>Team</div>
              <div>Country</div>
              <div>City</div>
              <div className="text-right">Goals</div>
              <div className="text-right">Wins</div>
              <div className="text-right">Points</div>
            </>
          ) : (
            <>
              <div>Player</div>
              <div>Team</div>
              <div>Country</div>
              <div>City</div>
              <div className="text-right capitalize">{stat}</div>
              <div></div>
            </>
          )}
        </div>
        <div className="divide-y">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : rows.length===0 ? (
            <div className="p-6 text-center text-gray-500">No data yet</div>
          ) : (
            rows.map((r,i)=> (
              <div key={i} className="grid grid-cols-6 gap-2 px-4 py-2 items-center text-sm">
                {type==='teams' ? (
                  <>
                    <div className="font-medium">{r.team_name}</div>
                    <div>{r.country}</div>
                    <div>{r.city}</div>
                    <div className="text-right">{r.goals}</div>
                    <div className="text-right">{r.wins}</div>
                    <div className="text-right">{r.points}</div>
                  </>
                ) : (
                  <>
                    <div className="font-medium">{r.player_name}</div>
                    <div>{r.team_name || '-'}</div>
                    <div>{r.country || '-'}</div>
                    <div>{r.city || '-'}</div>
                    <div className="text-right">{r[stat]}</div>
                    <div></div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
