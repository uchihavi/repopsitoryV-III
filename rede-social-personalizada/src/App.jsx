// src/App.jsx
import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard from './guards/AuthGuard'

const Login = lazy(() => import('./pages/login.jsx'))
const Register = lazy(() => import('./pages/register.jsx'))
const ResetPassword = lazy(() => import('./pages/reset-password.jsx'))
const Homepage = lazy(() => import('./pages/homepage.jsx'))

function Fallback(){ return <div style={{padding:24}}>Carregando…</div> }

export default function App(){
  return (
    <BrowserRouter>
      <Suspense fallback={<Fallback/>}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/home" element={<AuthGuard><Homepage/></AuthGuard>} />
          <Route path="*" element={<div style={{padding:24}}>404 — Not Found</div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
