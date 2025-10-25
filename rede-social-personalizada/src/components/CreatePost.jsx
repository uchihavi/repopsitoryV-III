import { useMemo, useRef, useState } from 'react'

export default function CreatePost({ onCreate, onCreateReel, currentUser }) {
  const [text, setText] = useState('')
  const [media, setMedia] = useState(null) // pode ser imagem OU vídeo
  const [privacy, setPrivacy] = useState('public')
  const [location, setLocation] = useState(null)
  const [locLoading, setLocLoading] = useState(false)
  const [error, setError] = useState('')

  // toggle Reals
  const [reelsMode, setReelsMode] = useState(false)

  // autocomplete / emojis (mantidos)
  const [showSuggest, setShowSuggest] = useState(false)
  const [suggestItems, setSuggestItems] = useState([])
  const [suggestType, setSuggestType] = useState(null)
  const [cursorPos, setCursorPos] = useState(0)
  const [showEmoji, setShowEmoji] = useState(false)

  const taRef = useRef(null)

  const users = useMemo(() => (
    ['ana', 'carlos', 'beatriz', 'demo_user', 'vitor', 'maria', 'joao']
  ), [])
  const tags = useMemo(() => (
    ['react', 'php', 'mysql', 'frontend', 'backend', 'dev', 'vite']
  ), [])

  const emojis = useMemo(() => (
    ['😀','😂','😊','😍','😉','😎','🤔','🤩','🥳','😭','🙏','🔥','✨','💯','👍','👎','💡','🎯','⚡','🚀']
  ), [])
  const stickers = useMemo(() => (
    ['🐝','🦄','🧠','🎉','🧩','🛠️','💻','📱','🎨','🌐']
  ), [])

  const charLimit = 280
  const remaining = charLimit - text.length
  const overLimit = remaining < 0

  function insertAtCursor(insertStr){
    const el = taRef.current
    if(!el) return
    const start = el.selectionStart ?? cursorPos
    const end = el.selectionEnd ?? cursorPos
    const before = text.slice(0, start)
    const after = text.slice(end)
    const next = before + insertStr + after
    setText(next)
    const newPos = start + insertStr.length
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(newPos, newPos)
      setCursorPos(newPos)
    })
  }

  function handleChange(e){
    const val = e.target.value
    setText(val)
    const caret = e.target.selectionStart
    setCursorPos(caret)
    const trigger = findTrigger(val, caret)
    if(trigger){
      const { type, query } = trigger
      setSuggestType(type)
      const pool = type === 'user' ? users : tags
      const list = pool.filter(x => x.toLowerCase().startsWith(query.toLowerCase())).slice(0,8)
      setSuggestItems(list)
      setShowSuggest(list.length > 0)
    } else {
      setShowSuggest(false)
    }
  }
  function findTrigger(val, caret){
    const left = val.slice(0, caret)
    const match = left.match(/(^|\s)([@#])(\w{1,30})$/)
    if(!match) return null
    const symbol = match[2]
    const query = match[3]
    return { type: symbol === '@' ? 'user' : 'tag', query }
  }
  function applySuggestion(item){
    const el = taRef.current
    if(!el) return
    const caret = el.selectionStart
    const left = text.slice(0, caret)
    const right = text.slice(caret)
    const m = left.match(/(^|\s)([@#])(\w{1,30})$/)
    if(!m) return
    const prefix = left.slice(0, left.length - m[0].length) + (m[1] || '')
    const symbol = m[2]
    const inserted = `${symbol}${item} `
    const next = prefix + inserted + right
    setText(next)
    const newPos = (prefix + inserted).length
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(newPos, newPos)
      setCursorPos(newPos)
    })
    setShowSuggest(false)
  }

  function onMediaChange(e){
    const f = e.target.files?.[0]
    setMedia(f || null)
  }

  function toggleLocation(){
    if(location){ setLocation(null); return }
    if(!navigator.geolocation){
      setError('Geolocalização não suportada neste navegador.')
      return
    }
    setError('')
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude:lat, longitude:lng } = pos.coords
        setLocation({ lat, lng, label: `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}` })
        setLocLoading(false)
      },
      () => { setError('Não foi possível obter a localização.'); setLocLoading(false) },
      { enableHighAccuracy:true, timeout: 8000 }
    )
  }

  function extractTokens(txt){
    const mentions = Array.from(new Set((txt.match(/@\w+/g) || []).map(s=>s.slice(1))))
    const hashtags = Array.from(new Set((txt.match(/#\w+/g) || []).map(s=>s.slice(1))))
    return { mentions, hashtags }
  }

  // helper: verifica se é vídeo retrato
  function isVideoPortrait(file){
    return new Promise(resolve => {
      if(!file || !file.type?.startsWith('video/')) return resolve(false)
      const v = document.createElement('video')
      v.onloadedmetadata = () => {
        const portrait = v.videoHeight > v.videoWidth
        URL.revokeObjectURL(v.src)
        resolve(portrait)
      }
      v.onerror = () => resolve(false)
      v.src = URL.createObjectURL(file)
    })
  }

  async function handleSubmit(e){
    e.preventDefault()
    if(!text.trim() && !media) return
    if(overLimit){ setError('Limite de 280 caracteres excedido.'); return }

    const { mentions, hashtags } = extractTokens(text)
    setError('')

    // Decide rota (PostFeed vs Reals)
    const isVideo = !!media?.type?.startsWith('video/')
    const portrait = isVideo ? await isVideoPortrait(media) : false
    const wantsReels = reelsMode && isVideo && portrait

    if(wantsReels){
      // monta payload compatível com Reals.jsx
      const src = URL.createObjectURL(media)
      const reel = {
        id: Date.now(),
        src,
        author: {
          id: currentUser?.id ?? 0,
          name: currentUser?.name || 'Você',
          username: currentUser?.username || 'voce',
          avatar: currentUser?.avatar || ''
        },
        description: text,
        mentions, // opcional mostrar no painel direito
        location: location?.label || '',
        createdAt: new Date().toISOString(),
        likes: 0, isLiked: false, isSaved: false,
        comments: []
      }
      onCreateReel?.(reel)
    } else {
      // post comum (pode conter imagem ou vídeo horizontal/quadrado)
      const payload = {
        id: Date.now(),
        author: { id: currentUser?.id, name: currentUser?.name || 'Você', avatarUrl: currentUser?.avatar || '' },
        content: text,
        image: !isVideo && media ? URL.createObjectURL(media) : null,
        video: isVideo ? URL.createObjectURL(media) : null,
        likes: 0,
        comments: [],
        createdAt: new Date().toISOString(),
        privacy,
        location,
        mentions, hashtags,
      }
      onCreate?.(payload)
    }

    // reset
    setText('')
    setMedia(null)
    setShowSuggest(false)
    setShowEmoji(false)
  }

  // estilos
  const card = { background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:12, marginBottom:12, boxShadow:'0 1px 2px rgba(0,0,0,0.03)' }
  const row = { display:'flex', gap:10, alignItems:'flex-start' }
  const avatarBox = { width:40, height:40, borderRadius:'50%', overflow:'hidden', border:'1px solid #e5e7eb', background:'#f3f4f6', flex:'0 0 auto' }
  const avatarImg = { width:'100%', height:'100%', objectFit:'cover' }
  const avatarFallback = { width:'100%', height:'100%', display:'grid', placeItems:'center', color:'#9ca3af', fontSize:22 }
  const taStyle = { resize:'vertical', padding:10, border:'1px solid #e5e7eb', borderRadius:10, width:'100%', minHeight:72, outline:'none' }
  const btn = { padding:'8px 12px', border:'1px solid #e5e7eb', borderRadius:10, background:'#fff', cursor:'pointer', fontSize:14 }
  const btnPrimary = { ...btn, background:'#111827', color:'#fff', borderColor:'#111827', opacity: overLimit ? .6 : 1 }
  const counterStyle = { marginLeft:'auto', fontSize:12, padding:'4px 8px', borderRadius:8, color: overLimit ? '#b91c1c' : '#374151', background: overLimit ? '#fee2e2' : '#f3f4f6' }
  const pill = { padding:'6px 10px', border:'1px solid #e5e7eb', borderRadius:999, background:'#fafafa', fontSize:12 }
  const suggestBox = { position:'absolute', zIndex:30, marginTop:4, background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, boxShadow:'0 10px 20px rgba(0,0,0,0.06)', overflow:'hidden' }
  const suggestItem = { padding:'8px 12px', cursor:'pointer', borderBottom:'1px solid #f3f4f6' }

  // estilo botão "Reals" (toggle)
  const reelsBtn = (active) => ({
    ...btn,
    borderColor: active ? '#111827' : '#e5e7eb',
    background: active ? '#111827' : '#fff',
    color: active ? '#fff' : '#111827'
  })

  return (
    <div className="card" style={card}>
      <form onSubmit={handleSubmit}>
        <div style={row}>
          <div style={avatarBox}>
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="avatar" style={avatarImg} />
            ) : (
              <div style={avatarFallback}>👤</div>
            )}
          </div>

          <div style={{ flex:1, position:'relative' }}>
            <textarea
              ref={taRef}
              value={text}
              onChange={handleChange}
              onClick={(e)=>setCursorPos(e.target.selectionStart)}
              onKeyUp={(e)=>setCursorPos(e.target.selectionStart)}
              placeholder="No que você está pensando?"
              rows={3}
              style={taStyle}
            />

            {showSuggest && (
              <div style={suggestBox}>
                {suggestItems.map(item => (
                  <div key={item} style={suggestItem} onMouseDown={(e)=>{ e.preventDefault(); applySuggestion(item) }}>
                    {suggestType === 'user' ? `@${item}` : `#${item}`}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:8, flexWrap:'wrap' }}>
              {/* Emojis/Stickers */}
              <div style={{ position:'relative' }}>
                <button type="button" style={btn} onClick={()=>setShowEmoji(v=>!v)} title="Emojis e stickers">😊</button>
                {showEmoji && (
                  <div style={{ position:'absolute', top:'110%', left:0, zIndex:20, background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:8, boxShadow:'0 10px 20px rgba(0,0,0,0.06)', width:260 }}>
                    <div style={{ fontSize:12, color:'#6b7280', margin:'4px 0 6px 4px' }}>Emojis</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(10, 1fr)', gap:6, fontSize:20 }}>
                      {emojis.map(e => (
                        <button key={e} type="button" style={{ ...btn, padding:6 }} onClick={()=>insertAtCursor(e)}>{e}</button>
                      ))}
                    </div>
                    <div style={{ height:8 }} />
                    <div style={{ fontSize:12, color:'#6b7280', margin:'4px 0 6px 4px' }}>Stickers</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:6, fontSize:28 }}>
                      {stickers.map(s => (
                        <button key={s} type="button" style={{ ...btn, padding:6 }} onClick={()=>insertAtCursor(s)}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Upload de mídia */}
              <label style={btn}>
                Mídia
                <input type="file" accept="image/*,video/*" onChange={onMediaChange} style={{ display:'none' }} />
              </label>

              {/* Botão Reals (toggle) */}
              <button
                type="button"
                aria-pressed={reelsMode}
                onClick={()=>setReelsMode(v=>!v)}
                style={reelsBtn(reelsMode)}
                title="Se ativo e o vídeo for retrato, publicará como Reel"
              >
                Reals
              </button>

              {/* Localização */}
              <button type="button" style={btn} onClick={toggleLocation}>
                {location ? 'Remover localização' : (locLoading ? 'Localizando…' : 'Adicionar localização')}
              </button>
              {location && (
                <span style={pill} title={`${location.lat}, ${location.lng}`}>{location.label || 'Local definido'}</span>
              )}

              {/* Privacidade */}
              <span style={{ marginLeft:'auto' }} />
              <select value={privacy} onChange={e=>setPrivacy(e.target.value)} style={{ ...btn, padding:'8px 10px' }}>
                <option value="public">Público</option>
                <option value="friends">Amigos</option>
                <option value="private">Privado</option>
              </select>

              {/* Contador */}
              <span style={counterStyle}>{remaining}</span>

              <button type="submit" style={btnPrimary} disabled={overLimit}>Postar</button>
            </div>

            {/* Preview simples */}
            {media && (
              <div style={{ marginTop:8, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                <div style={{ ...pill, background:'#eef2ff', borderColor:'#dbeafe' }}>
                  {media.type?.startsWith('video/') ? 'Vídeo selecionado' : 'Imagem selecionada'}
                </div>
                {reelsMode && media.type?.startsWith('video/') && (
                  <span style={{ ...pill, background:'#fef3c7', borderColor:'#fde68a' }}>
                    Será Reel se estiver em retrato
                  </span>
                )}
              </div>
            )}

            {error && <div style={{ color:'#b91c1c', marginTop:8 }}>{error}</div>}
          </div>
        </div>
      </form>
    </div>
  )
}
