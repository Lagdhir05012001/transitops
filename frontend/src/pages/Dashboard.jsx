import React, {useEffect, useState} from 'react'
import axios from 'axios'

function Card({title,value}){
  return <div className="kpi-card"><div className="kpi-title">{title}</div><div className="kpi-value">{value}</div></div>
}

export default function Dashboard(){
  const [kpis,setKpis]=useState(null)
  const [vehicles,setVehicles]=useState([])

  useEffect(()=>{
    const token = localStorage.getItem('accessToken')
    axios.get((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/dashboard/kpis', { headers: { Authorization: `Bearer ${token}` } })
      .then(r=>setKpis(r.data.data))
      .catch(()=>{})
    axios.get((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/vehicles')
      .then(r=>setVehicles(r.data.data))
  },[])

  const logout = ()=>{ localStorage.removeItem('accessToken'); window.location.href='/login' }

  return (
    <div className="page">
      <header className="topbar"><h1>TransitOps Dashboard</h1><button className="btn small" onClick={logout}>Logout</button></header>
      <main>
        <section className="kpi-row">
          <Card title="Available Vehicles" value={kpis?.activeVehicles ?? '-'} />
          <Card title="In Shop" value={kpis?.inShop ?? '-'} />
          <Card title="On Trip" value={kpis?.onTrip ?? '-'} />
          <Card title="Active Trips" value={kpis?.activeTrips ?? '-'} />
        </section>
        <section className="panel">
          <h2>Vehicles</h2>
          <table className="table">
            <thead><tr><th>#</th><th>Reg</th><th>Model</th><th>Type</th><th>Status</th></tr></thead>
            <tbody>{vehicles.map(v=> <tr key={v.id}><td>{v.id}</td><td>{v.registrationNumber}</td><td>{v.model}</td><td>{v.type}</td><td>{v.status}</td></tr>)}</tbody>
          </table>
        </section>
      </main>
    </div>
  )
}
