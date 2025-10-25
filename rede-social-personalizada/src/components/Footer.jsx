export default function Footer({ onHome, onReels, onExplore, onProfile, onMenu }) {
  return (
    <footer
      className="md:hidden"
      style={{
        height: '15vh',
        width: '100vw',
        backgroundColor: '#0a0a0a',
        borderTop: '1px solid #27272a'
      }}
    >
      <nav
        style={{
          height: '100%',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          placeItems: 'center'
        }}
      >
        <IconButton label="Home" onClick={onHome}><IconHome /></IconButton>
        <IconButton label="Reels" onClick={onReels}><IconReels /></IconButton>
        <IconButton label="Explorar" onClick={onExplore}><IconExplore /></IconButton>
        <IconButton label="Perfil" onClick={onProfile}><IconUser /></IconButton>
        <IconButton label="Menu" onClick={onMenu}><IconMenu /></IconButton>
      </nav>
    </footer>
  )
}

function IconButton({ label, onClick, children }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      style={{
        padding: 10,
        borderRadius: 14,
        background: 'transparent',
        border: 'none',
        color: '#fff',
        cursor: 'pointer'
      }}
    >
      <div style={{ width: 28, height: 28 }}>{children}</div>
    </button>
  )
}

// Ícones minimalistas (só formas; sem texto)
function IconHome() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconReels() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="16" rx="3" ry="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M10 4l4 6M5 4l4 6M15 4l4 6" stroke="currentColor" strokeWidth="2" />
      <polygon points="10,10 16,13 10,16" fill="currentColor" />
    </svg>
  )
}
function IconExplore() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M8 16l3-7 7-3-3 7-7 3z" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  )
}
function IconUser() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14z" fill="currentColor" />
    </svg>
  )
}
function IconMenu() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
