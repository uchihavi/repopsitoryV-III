// src/components/SidebarLeft.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

/**
 * Props:
 * - activeSection: 'home' | 'reals' | 'explore' | 'profile' | null
 * - onNavigate?: (section: string) => void
 * - onRightPanel?: (panel: 'notifications' | 'settings' | null) => void
 */
export default function SidebarLeft({ activeSection, onNavigate, onRightPanel }) {
  const nav = useNavigate()
  const { logout } = useAuth?.() || { logout: null }

  function go(section) {
    // avisa o pai (se existir)
    onNavigate?.(section)

    // fallback: também navegar por rota, caso você já tenha rotas
    const routeMap = {
      home: '/home',
      reals: '/reels',
      explore: '/explore',
      profile: '/profile'
    }
    if (routeMap[section]) nav(routeMap[section])
  }

  function openRight(panel) {
    onRightPanel?.(panel)
  }

  async function doLogout() {
    try {
      if (typeof logout === 'function') {
        await logout()
      } else {
        // fallback de segurança
        localStorage.removeItem('token')
      }
    } finally {
      nav('/login', { replace: true })
    }
  }

  const btnClass = (k) =>
    `nav-btn ${activeSection === k ? 'active' : ''}`

  return (
    <aside className="leftbar">
      <button className={btnClass('home')} aria-current={activeSection==='home'?'page':undefined} onClick={() => go('home')}>
        Home
      </button>

      <button className={btnClass('reals')} aria-current={activeSection==='reals'?'page':undefined} onClick={() => go('reals')}>
        Reels
      </button>

      <button className={btnClass('explore')} aria-current={activeSection==='explore'?'page':undefined} onClick={() => go('explore')}>
        Explorar
      </button>

      <button className="nav-btn" aria-pressed="false" onClick={() => openRight?.('notifications')}>
        Notificações
      </button>

      <button className={btnClass('profile')} aria-current={activeSection==='profile'?'page':undefined} onClick={() => go('profile')}>
        Perfil
      </button>

      <button className="nav-btn" aria-pressed="false" onClick={() => openRight?.('settings')}>
        Configurações
      </button>

      <button className="nav-btn" onClick={doLogout}>
        Logout
      </button>
    </aside>
  )
}
