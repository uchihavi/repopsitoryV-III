// src/guards/AuthGuard.jsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

function hasToken() {
  try { return !!localStorage.getItem('token') } catch { return false }
}

export default function AuthGuard({ children }) {
  const location = useLocation()
  if (!hasToken()) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}
