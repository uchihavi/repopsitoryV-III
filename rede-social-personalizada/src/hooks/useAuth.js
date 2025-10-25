// src/hooks/useAuth.js
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getToken, setToken, loginApi } from '../utils/api'

export default function useAuth() {
  const [token, setTokenState] = useState(() => getToken())
  const isAuthenticated = useMemo(() => !!token, [token])

  const login = useCallback(async (email, password) => {
    const res = await loginApi(email, password)
    if (res?.token) { setToken(res.token); setTokenState(res.token) }
    return res
  }, [])

  const logout = useCallback(() => { setToken(''); setTokenState('') }, [])

  useEffect(() => {
    function onStorage(e){ if (e.key === 'token') setTokenState(e.newValue || '') }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return { token, isAuthenticated, login, logout }
}
