import React, {useState} from 'react'
import axios from 'axios'

export default function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [err,setErr]=useState('')

  const submit = async (e) =>{
    e.preventDefault();
    try{
      const res = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/auth/login', { email, password });
      localStorage.setItem('accessToken', res.data.data.accessToken);
      window.location.href = '/dashboard';
    }catch(e){
      setErr(e.response?.data?.errors?.[0] || 'Login failed')
    }
  }

  return (
    <div className="page login-page">
      <form className="card login-card" onSubmit={submit}>
        <h2>TransitOps</h2>
        {err && <div className="error">{err}</div>}
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="btn">Login</button>
        <div className="note">Use admin@local / password (seeded)</div>
      </form>
    </div>
  )
}
