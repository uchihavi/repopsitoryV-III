// src/pages/homepage.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import React from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

import Header from '../components/Header'
import SidebarLeft from '../components/SidebarLeft'
import SidebarRight from '../components/SidebarRight'
import CreatePost from '../components/CreatePost'
import PostFeed from '../components/PostFeed'
import ProfilePage from '../components/ProfilePage'
import Reals from '../components/Reals'
import Explore from '../components/Explore'

// painéis chamados pelo menu (mobile)
import NotificationsPanel from '../components/NotificationsPanel'
import ChatWidget from '../components/ChatWidget'
import SettingsPanel from '../components/SettingsPanel'

// Footer (mobile-only)
import Footer from '../components/Footer'

export default function Homepage(){
  // ===== new addon ====
  const { logout } = useAuth()
  const nav = useNavigate()
  function doLogout(){
    logout()
    nav('/login', { replace: true })
  }

  // ===== estado original =====
  const [view, setView] = useState('home') // 'home' | 'reals' | 'profile' | 'explore'
  const [panel, setPanel] = useState(null) // null | 'notifications' | ...
  const currentUser = { id:1, name:'Demo User', username:'demo_user', avatar:'' }

  // ===== busca do Header → Explore =====
  const [searchQuery, setSearchQuery] = useState('')

  // ===== detecção de mobile (mantém desktop intacto) =====
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])

  // ===== painel direito (desktop) =====
  const handleRightPanel = (panelName) => {
    setPanel((prevPanel) => (prevPanel === panelName ? null : panelName))
  }

  // ===== callbacks vindos do Explore =====
  const handleOpenProfile = (user) => {
    setView('profile')
    // TODO: se o ProfilePage precisar de "profileUser", salve-o em estado global/ctx
    // setProfileUser(user)
  }

  // abrir reels a partir do Explore
  const [reelsState, setReelsState] = useState({ list: null, startIndex: 0 })
  const handleRequestOpenReelsView = ({ reels, startIndex }) => {
    setReelsState({ list: reels, startIndex: startIndex ?? 0 })
    setView('reals')
  }

  // ===== mobile: menu lateral =====
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuView, setMenuView] = useState(null) // null | 'notifications' | 'messages' | 'settings'

  const toggleMenu = () => {
    setMenuOpen(prev => {
      const next = !prev
      if (!next) setMenuView(null) // se estiver fechando, limpa a view
      return next
    })
  }

  const onMainClick = () => {
    if (isMobile && menuOpen) { setMenuOpen(false); setMenuView(null) }
  }
  const handleLogout = () => {
    // localStorage.removeItem('token')
    navigate('/login')
  }

  /* =================== DESKTOP =================== */
  if (!isMobile) {
    return (
      <div style={{ height:'100vh', display:'grid', gridTemplateRows:'10% 90%' }}>
        <Header
          onSearch={(q) => { setSearchQuery(q); setView('explore') }}
        />
        <div style={{ display:'grid', gridTemplateColumns:'20% 50% 30%', height:'100%' }}>
          <SidebarLeft
            onNavigate={(dest) => setView(dest)}   // quando adicionar Explore na Sidebar, passe 'explore'
            onRightPanel={handleRightPanel}
          />

          <main style={{ borderLeft:'1px solid #e5e7eb', borderRight:'1px solid #e5e7eb' }}>
            {view === 'home' && (
              <div style={{ height:'auto', overflow:'auto', padding:12 }}>
                <CreatePost currentUser={currentUser} />
                <PostFeed currentUser={currentUser} />
              </div>
            )}

            {view === 'profile' && (
              <div style={{ height:'auto', overflow:'auto', padding:12 }}>
                <ProfilePage currentUser={currentUser} />
              </div>
            )}

            {view === 'reals' && (
              <div style={{ height:'100%' }}>
                <Reals
                  currentUser={currentUser}
                  reels={reelsState.list /* opcional */}
                  startIndex={reelsState.startIndex /* opcional */}
                />
              </div>
            )}

            {view === 'explore' && (
              <div style={{ height:'100vh', width:'100%', overflow:'hidden' }}>
                <Explore
                  currentUser={currentUser}
                  externalQuery={searchQuery}
                  onOpenProfile={handleOpenProfile}
                  onRequestOpenReelsView={handleRequestOpenReelsView}
                  // onOpenPost={(post)=>{ ... }} // se quiser interceptar o modal do Post
                />
              </div>
            )}
          </main>

          <SidebarRight panel={panel} />
        </div>
      </div>
    )
  }

  /* =================== MOBILE =================== */
  return (
    <div style={{
      height:'100vh',
      width:'100vw',
      display:'grid',
      gridTemplateRows:'85vh 15vh',
      backgroundColor:'#0a0a0a',
      color:'#fff',
      overflow:'hidden'
    }}>
      <main
        onClick={onMainClick}
        style={{
          position:'relative',
          height:'85vh',
          width:'100vw',
          overflow:'hidden',
          backgroundColor:'#111827',
          borderTop:'1px solid #1f2937'
        }}
      >
        <div style={{ height:'100%', width:'100%', overflowY:'auto' }}>
          {view === 'home' && (
            <div style={{ padding:12 }}>
              <CreatePost currentUser={currentUser} />
              <PostFeed currentUser={currentUser} />
            </div>
          )}

          {view === 'profile' && (
            <div style={{ padding:12 }}>
              <ProfilePage currentUser={currentUser} />
            </div>
          )}

          {view === 'reals' && (
            <div style={{ height:'100%' }}>
              <Reals
                currentUser={currentUser}
                reels={reelsState.list /* opcional */}
                startIndex={reelsState.startIndex /* opcional */}
              />
            </div>
          )}

          {view === 'explore' && (
            <div style={{ height:'100vh', width:'100%', overflow:'hidden' }}>
              <Explore
                currentUser={currentUser}
                externalQuery={searchQuery}
                onOpenProfile={handleOpenProfile}
                onRequestOpenReelsView={handleRequestOpenReelsView}
              />
            </div>
          )}
        </div>

        {/* Painel do Menu (lado direito do MAIN) */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: '100%',
            width: menuView ? '100%' : '80%',
            backgroundColor: '#0a0a0a',
            borderLeft: '1px solid #27272a',
            transform: menuOpen ? 'translateX(0%)' : 'translateX(100%)',
            transition: 'all 200ms ease-out',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Cabeçalho do painel */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderBottom: '1px solid #27272a'
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
              {menuView === 'notifications'
                ? 'Notificações'
                : menuView === 'messages'
                ? 'Mensagens'
                : menuView === 'settings'
                ? 'Configurações'
                : 'Menu'}
            </h3>
            <button
              onClick={() => { setMenuOpen(false); setMenuView(null) }}
              style={{ border: 'none', background: 'transparent', color: '#fff', padding: 8, borderRadius: 8 }}
              aria-label="Fechar"
              title="Fechar"
            >
              ✕
            </button>
          </div>

          {/* Conteúdo do painel */}
          {!menuView ? (
            // Menu (80% do main)
            <nav style={{ display: 'flex', flexDirection: 'column', padding: 8 }}>
              <button onClick={() => setMenuView('notifications')} style={menuBtnStyle}>
                🔔 <span>Notificações</span>
              </button>
              <button onClick={() => setMenuView('messages')} style={menuBtnStyle}>
                💬 <span>Mensagens</span>
              </button>
              <button onClick={() => setMenuView('settings')} style={menuBtnStyle}>
                ⚙️ <span>Configurações</span>
              </button>
              <button onClick={handleLogout} style={{ ...menuBtnStyle, color: '#f87171' }}>
                ⏻ <span>Logout</span>
              </button>
            </nav>
          ) : (
            // Conteúdo expandido (100% do main)
            <div style={{ height: 'calc(85vh - 48px)', overflowY: 'auto', padding: 8 }}>
              {menuView === 'notifications' && <NotificationsPanel />}
              {menuView === 'messages' && <ChatWidget />}
              {menuView === 'settings' && <SettingsPanel />}
            </div>
          )}
        </div>
      </main>

      {/* Footer mobile com o botão Explore chamando setView('explore') */}
      {Footer && (
        <Footer
          onHome={() => { setView('home'); setMenuOpen(false); setMenuView(null) }}
          onReels={() => { setView('reals'); setMenuOpen(false); setMenuView(null) }}
          onExplore={() => { setView('explore'); setMenuOpen(false); setMenuView(null) }}
          onProfile={() => { setView('profile'); setMenuOpen(false); setMenuView(null) }}
          onMenu={toggleMenu}
        />
      )}
    </div>
  )
}

const menuBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '12px 12px',
  margin: '4px 0',
  borderRadius: 12,
  background: 'transparent',
  border: 'none',
  color: '#fff',
  textAlign: 'left',
  cursor: 'pointer'
}
