// src/components/ChatWidget.jsx
import { useEffect, useMemo, useState } from 'react'

export default function ChatWidget() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])

  const [expanded, setExpanded] = useState(false)
  const [search, setSearch] = useState('')
  const [activeUserId, setActiveUserId] = useState(null)
  const [txt, setTxt] = useState('')

  const users = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i + 1,
        name: `Usuario Test ${i + 1}`,
        avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
      })),
    []
  )

  const [convos, setConvos] = useState(() => {
    const base = {}
    users.forEach((u) => {
      base[u.id] = [
        {
          id: `sys-${u.id}`,
          from: u.id,
          text: `Olá! Eu sou o ${u.name.split(' ')[0]} 😉`,
          ts: Date.now() - 1000 * 60 * (5 + (u.id % 10)),
        },
      ]
    })
    return base
  })

  const currentList = useMemo(() => {
    const q = (search || '').toLowerCase()
    return !q ? users : users.filter((u) => u.name.toLowerCase().includes(q))
  }, [users, search])

  const activeUser = useMemo(() => users.find((u) => u.id === activeUserId) || null, [users, activeUserId])

  const openChat = (id) => setActiveUserId(id)
  const backToList = () => setActiveUserId(null)
  const toggleExpand = () => setExpanded((v) => !v)

  const send = () => {
    if (!txt.trim() || !activeUser) return
    const msg = { id: `m-${Date.now()}`, from: 'me', text: txt.trim(), ts: Date.now() }
    setConvos((prev) => ({ ...prev, [activeUser.id]: [...(prev[activeUser.id] || []), msg] }))
    setTxt('')
    setTimeout(() => {
      setConvos((prev) => ({
        ...prev,
        [activeUser.id]: [
          ...(prev[activeUser.id] || []),
          { id: `r-${Date.now()}`, from: activeUser.id, text: '👍', ts: Date.now() },
        ],
      }))
    }, 800)
  }

  const layoutStyle = isMobile
    ? { height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }
    : expanded
    ? fixedExpandedStyle
    : fixedCollapsedStyle

  return (
    <div style={{ ...layoutStyle, zIndex: 50 }}>
      <style>{chatCSS}</style>

      <div
        className="card"
        style={{
          position: 'fixed',
          bottom: 0, right: 10,
          height: isMobile ? '100%' : expanded ? '55%' : '50px',
          width: isMobile ? '100%' : expanded ? '28%' : '28%',
          display: 'flex',
          flexDirection: 'column',
          background: '#0b0b0b',
          color: '#fff',
          border: '1px solid #27272a',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: isMobile ? 'none' : '0 10px 30px rgba(0,0,0,0.35)',
          padding: '5px 5px',
        }}
      >
        {/* Header */}
        <div
          style={{
            
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            padding: '0px 10px',
            borderBottom: '1px solid #1f2937',
            background: '#0f0f0f',
          }}
        >
          <div>
            <strong style={{ flex: 1}}>{activeUser ? 'Conversando' : 'Mensagens'}</strong>
          </div>
          <div>
            {!isMobile && (
              <button className="nav-btn" onClick={toggleExpand}>
                {expanded ? 'Recolher' : 'Expandir'}
              </button>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {!activeUser && (
            <>
              <div style={{ padding: 10, borderBottom: '1px solid #1f2937', background: '#0f0f0f' }}>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquisar usuários..."
                  style={{
                    width: '100%',
                    height: 36,
                    borderRadius: 10,
                    border: '1px solid #374151',
                    background: '#111827',
                    color: '#fff',
                    padding: '0 10px',
                  }}
                />
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {currentList.map((u) => (
                  <button key={u.id} onClick={() => openChat(u.id)} style={userRowStyle}>
                    <img src={u.avatar} alt={u.name} style={avatarStyle} />
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {activeUser && (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr 36px',
                  alignItems: 'center',
                  padding: '4px 10px',
                  borderBottom: '1px solid #1f2937',
                  background: '#0f0f0f',
                }}
              >
                <button onClick={backToList} style={iconBtnII}>
                  <ArrowLeftIcon />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <img src={activeUser.avatar} alt={activeUser.name} style={profilePic} />
                  <span style={{ fontWeight: 700 }}>{activeUser.name}</span>
                </div>
              </div>

              <div id="chat-scroll" style={chatScroll}>
                {(convos[activeUser.id] || []).map((m) => {
                  const mine = m.from === 'me'
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: mine ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div style={{ ...bubbleBase, ...(mine ? bubbleMe : bubbleYou) }}>{m.text}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', margin: mine ? '4px 12px 10px 0' : '4px 0 10px 12px' }}>
                        {formatTs(m.ts)}
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* original */}
              <div style={composerBar}>
                <input
                  value={txt}
                  onChange={(e) => setTxt(e.target.value)}
                  placeholder="Mensagem"
                  style={{
                    width: '100%',
                    height: 40,
                    borderRadius: 10,
                    border: '1px solid #374151',
                    background: '#111827',
                    color: '#fff',
                    padding: '0 10px',
                    outline: 'none',
                  }}
                />
              
                <div style={composerBtn}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={iconBtn}>
                      <MediaIcon />
                    </button>
                    <button style={iconBtn}>
                      <FileIcon />
                    </button>
                    <button
                      title="Inserir emoji"
                      style={iconBtn}
                      onClick={() => {
                        const emojis = ['😀','😁','😂','😍','😎','👍','🔥','❤️','🎉','🙏']
                        const emoji = prompt('Escolha um emoji:\n' + emojis.join(' '))
                        if (emoji) setTxt((t) => t + ' ' + emoji)
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <circle cx="9" cy="10" r="1" fill="currentColor" />
                        <circle cx="15" cy="10" r="1" fill="currentColor" />
                        <path d="M8 15c1.333 1 2.667 1 4 1s2.667 0 4-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  
                  <button onClick={send} style={sendBtn}>
                    Enviar
                  </button>
                  </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ============== Helpers e estilos (mesmos do anterior) ============== */
function formatTs(ts) {
  const d = new Date(ts)
  const dia = d.toLocaleDateString()
  const hora = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return `${dia} • ${hora}`
}
function ArrowLeftIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function MediaIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 13l3-3 5 6H6l2-3z" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
function FileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z" stroke="currentColor" strokeWidth="2" />
      <path d="M14 3v6h6" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

const fixedCollapsedStyle = { position: 'relative', right: 0, bottom: 0 }
const fixedExpandedStyle = { position: 'fixed', right: 16, bottom: 16 }

const userRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '10px 12px',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid #111827',
  cursor: 'pointer',
  color: '#fff',
}
const avatarStyle = { width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '1px solid #1f2937' }
const profilePic = { width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid #374151' }
const chatScroll = { flex: 1, overflowY: 'auto', padding: 5, display: 'flex', flexDirection: 'column', gap: 2, background: '#0a0a0a' }
const bubbleBase = { maxWidth: '78%', padding: '8px 12px', borderRadius: 18, lineHeight: 1.35, fontSize: 14, whiteSpace: 'pre-wrap' }
const bubbleMe = { background: '#3b82f6', color: '#fff', borderTopRightRadius: 6 }
const bubbleYou = { background: '#1f2937', color: '#fff', borderTopLeftRadius: 6 }
const composerBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: 5,
  borderTop: '1px solid #1f2937',
  background: '#0f0f0f',
  justifyContent: 'space-between',
}
const composerBar = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: 3,
  borderTop: '1px solid #1f2937',
  background: '#0f0f0f',
}

const iconBtn = {
  background: 'transparent',
  border: '1px solid #374151',
  color: '#fff',
  borderRadius: 10,
  width: 36,
  height: 36,
  display: 'grid',
  placeItems: 'center',
  cursor: 'pointer',
}
const iconBtnII = {
  background: 'transparent',
  border: '1px solid #374151',
  color: '#fff',
  borderRadius: 10,
  width: 30,
  height: 30,
  display: 'grid',
  placeItems: 'center',
  cursor: 'pointer',
}

const composerInput = {
  width: '100%',
  height: 36,
  borderRadius: 10,
  border: '1px solid #374151',
  background: '#111827',
  color: '#fff',
  padding: '0 10px',
  outline: 'none',
}
const sendBtn = { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, height: 36, cursor: 'pointer', fontWeight: 700 }

const chatCSS = `
#chat-scroll::-webkit-scrollbar { width: 8px; }
#chat-scroll::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 999px; }
button.nav-btn {
  background: #1f2937; color: #fff; border: 1px solid #374151;
  padding: 6px 10px; border-radius: 8px; cursor: pointer;
}
button.nav-btn:hover { filter: brightness(1.05); }
`
