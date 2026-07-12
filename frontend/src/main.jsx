import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import './styles.css'

function App(){
  const token = localStorage.getItem('accessToken')
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/dashboard" element={token ? <Dashboard/> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
