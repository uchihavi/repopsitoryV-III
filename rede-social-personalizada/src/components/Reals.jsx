import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Reals.jsx — atualizado
 * - Corrige: overlay/botões da versão mobile aparecendo no desktop (agora renderiza overlay só no mobile)
 * - Remove vídeo duplicado (causava efeitos estranhos de overlay)
 * - Comentários (desktop e mobile):
 *   • Sub-comentários e campo de resposta ficam ocultos por padrão
 *   • Mostra link "Ver X comentários" (à esquerda) e botão "Responder" (à direita)
 *   • Ao clicar, expande lista de sub-comentários + mostra campo p/ resposta
 */
export default function Reals({ reels: propReels, currentUser }) {
  const [reels, setReels] = useState(() => propReels || getMockReels())
  const [index, setIndex] = useState(0) // reel ativo
  const active = reels[index]

   // mantém sincronizado quando o pai mandar novos reels
  useEffect(() => {
    if (Array.isArray(propReels)) setReels(propReels)
  }, [propReels])

  // UI state
  const [menuOpen, setMenuOpen] = useState(false)
  const [showMobileOverlay, setShowMobileOverlay] = useState(true)
  const [mobileCommentsOpen, setMobileCommentsOpen] = useState(false)

  // Comentários gerais do Reel
  const [commentText, setCommentText] = useState('')

  // Estados por comentário: replies visíveis e campo responder visível
  // { [commentId]: boolean }
  const [openReplies, setOpenReplies] = useState({})
  const [openReplyField, setOpenReplyField] = useState({})
  // map de textos de resposta por comentário
  const [replyText, setReplyText] = useState({}) // { [commentId]: string }

  const containerRef = useRef(null)
  const videoRefs = useRef({})
  const lastTapRef = useRef(0)

  const isOwner = (userId) => currentUser?.id && userId === currentUser.id

  // Auto play/pause por visibilidade
  useEffect(() => {
    const v = videoRefs.current[active?.id]
    if (!v) return
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry) return
      if (entry.isIntersecting && index === reels.findIndex(r => r.id === active.id)) {
        v.play().catch(()=>{})
      } else {
        v.pause()
      }
    }, { threshold: 0.6 })
    obs.observe(v)
    return () => obs.disconnect()
  }, [index, active?.id, reels])

  // Reinicia loop ao terminar
  function onVideoEnd(id) {
    const v = videoRefs.current[id]
    if (v) { v.currentTime = 0; v.play().catch(()=>{}) }
  }

  // Navegação swipe/scroll vertical
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) < 5) return
      if (e.deltaY > 0) next()
      else prev()
    }
    let startY = 0
    const onTouchStart = (e) => { startY = e.touches[0].clientY }
    const onTouchEnd = (e) => {
      const dy = e.changedTouches[0].clientY - startY
      if (Math.abs(dy) > 40) dy < 0 ? next() : prev()
    }
    el.addEventListener('wheel', onWheel, { passive: true })
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [index, reels.length])

  function next(){ setIndex(i => (i + 1) % reels.length) }
  function prev(){ setIndex(i => (i - 1 + reels.length) % reels.length) }

  function toggleLike(reelId){
    setReels(rs => rs.map(r => r.id === reelId ? { ...r, isLiked: !r.isLiked, likes: (r.likes||0) + (!r.isLiked?1:-1) } : r))
  }
  function toggleSave(reelId){
    setReels(rs => rs.map(r => r.id === reelId ? { ...r, isSaved: !r.isSaved } : r))
  }
  function handleShare(){ alert('Compartilhar reel…') }
  function handleReport(){ alert('Reel denunciado.') }
  function handleDelete(reelId){
    if (!isOwner(active.author.id)) return
    if (confirm('Excluir este Reel?')) {
      setReels(rs => rs.filter(r => r.id !== reelId))
      setIndex(i => Math.max(0, Math.min(i, reels.length - 2)))
    }
  }

  // Comentários
  function submitComment(){
    const text = commentText.trim()
    if (!text) return
    const c = {
      id: Date.now(),
      author: currentUser || { id: 999, name: 'Você', username: 'voce', avatar: '' },
      text, likes: 0, isLiked: false, replies: [], createdAt: new Date().toISOString()
    }
    setReels(rs => rs.map(r => r.id === active.id ? { ...r, comments: [c, ...(r.comments||[])] } : r))
    setCommentText('')
  }

  function submitReply(commentId){
    const text = (replyText[commentId] || '').trim()
    if (!text) return
    const reply = {
      id: Date.now(),
      author: currentUser || { id: 999, name: 'Você', username: 'voce', avatar: '' },
      text, likes: 0, isLiked: false, createdAt: new Date().toISOString()
    }
    setReels(rs => rs.map(r => {
      if (r.id !== active.id) return r
      const comments = (r.comments || []).map(c => c.id === commentId ? { ...c, replies: [reply, ...(c.replies||[])] } : c)
      return { ...r, comments }
    }))
    setReplyText(m => ({ ...m, [commentId]: '' }))
    setOpenReplies(m => ({ ...m, [commentId]: true }))
  }

  function toggleCommentLike(commentId){
    setReels(rs => rs.map(r => {
      if (r.id !== active.id) return r
      const comments = (r.comments || []).map(c => c.id === commentId
        ? { ...c, isLiked: !c.isLiked, likes: (c.likes||0) + (!c.isLiked?1:-1) }
        : c)
      return { ...r, comments }
    }))
  }
  function toggleReplyLike(commentId, replyId){
    setReels(rs => rs.map(r => {
      if (r.id !== active.id) return r
      const comments = (r.comments || []).map(c => {
        if (c.id !== commentId) return c
        const replies = (c.replies || []).map(rep =>
          rep.id === replyId ? { ...rep, isLiked: !rep.isLiked, likes: (rep.likes||0) + (!rep.isLiked?1:-1) } : rep
        )
        return { ...c, replies }
      })
      return { ...r, comments }
    }))
  }

  // Desktop/Mobile
  const isMobile = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches,
    []
  )

  // Tap em mobile: 1 toque toggle overlay, duplo pausa/retoma
  function onMobileTap(){
    const now = Date.now()
    if (now - lastTapRef.current < 300) {
      const v = videoRefs.current[active?.id]
      if (v) v.paused ? v.play().catch(()=>{}) : v.pause()
    } else {
      setShowMobileOverlay(v => !v)
    }
    lastTapRef.current = now
  }

  if (!active) return <div style={{ padding: 16, color: '#6b7280' }}>Nenhum Reel disponível.</div>

  // ====== estilos ======
  const wrap = { height: '100%', width: '100%', display: 'flex', overflow: 'hidden', background: '#000' }
  const left = {
    flex: isMobile ? '1 1 auto' : '0 0 60%', height: '100%', display: 'grid', placeItems: 'center',
    position: 'relative', background: '#000'
  }
  const right = {
    flex: isMobile ? '0 0 0' : '1 1 auto', height: '100%', background: '#fff',
    borderLeft: '1px solid #e5e7eb', display: isMobile ? 'none' : 'grid', gridTemplateRows: 'auto auto 1fr', gap: 8
  }
  const videoShell = { width: isMobile ? '100%' : 420, height: '100%', maxHeight: '100%', borderRadius: isMobile ? 0 : 14, overflow: 'hidden', position: 'relative', cursor: 'pointer' }
  const videoEl = { width: '100%', height: '100%', objectFit: 'cover' }

  const fieldPad = { padding: 12 }
  const field1 = { ...fieldPad, color: '#111827' }
  const field2 = { ...fieldPad, borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6' }
  const field3 = { padding: 0, display: 'grid', gridTemplateRows: '1fr auto', minHeight: 0 }

  const userBox = { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }
  const avatar = { width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: '#f3f4f6', border: '1px solid #e5e7eb' }
  const avatarImg = { width: '100%', height: '100%', objectFit: 'cover' }
  const subtle = { fontSize: 12, color: '#6b7280' }
  const desc = { marginTop: 8, whiteSpace: 'pre-wrap', lineHeight: 1.35 }

  const actionsRow = { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }
  const iconBtn = {
    width: 36, height: 36, borderRadius: 10, border: '1px solid #111827',
    background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center',
    transition: 'transform .05s ease, background .15s, color .15s'
  }
  const iconFilled = { background: '#111827', color: '#fff' }
  const likesBadge = { fontSize: 12, padding: '2px 8px', borderRadius: 999, background: '#f3f4f6', color: '#374151' }
  const menu = { position: 'absolute', right: 12, top: 40, zIndex: 30, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,.06)' }
  const menuItem = { padding: '10px 12px', cursor: 'pointer', fontSize: 14, borderBottom: '1px solid #f3f4f6' }

  // Comentários
  const commentsList = { overflow: 'auto', padding: 12 }
  const commentItem = { display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0' }
  const commentBox = { flex: 1, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 8 }
  const commentHead = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
  const input = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 10px', outline: 'none' }
  const sendBtn = { marginLeft: 8, padding: '8px 12px', borderRadius: 10, border: '1px solid #111827', background: '#111827', color: '#fff', cursor: 'pointer' }
  const repliesWrap = { marginTop: 6, marginLeft: 44, maxHeight: 220, overflow: 'auto' }

  // Overlay mobile: **só renderiza se isMobile for true**
  const m_overlay = {
    position: 'absolute', inset: 0, display: isMobile && showMobileOverlay ? 'flex' : 'none',
    flexDirection: 'column', justifyContent: 'flex-end', padding: 12, pointerEvents: 'none'
  }
  const m_info = { color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.6)', pointerEvents: 'auto', background: 'linear-gradient(transparent, rgba(0,0,0,.35) 30%, rgba(0,0,0,.65) 70%)', paddingTop: 60 }
  const m_actions = { position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', display: isMobile ? 'grid' : 'none', gap: 10, pointerEvents: 'auto' }
  const m_iconBtn = { ...iconBtn, background: 'rgba(255,255,255,.9)' }

  return (
    <div ref={containerRef} style={wrap}>
      {/* ESQUERDA: Vídeo */}
      <div style={left} onClick={isMobile ? onMobileTap : undefined}>
        <div style={videoShell}>
          <video
            ref={el => (videoRefs.current[active.id] = el)}
            src={active.src}
            style={videoEl}
            playsInline
            muted
            autoPlay
            loop={false}
            onEnded={() => onVideoEnd(active.id)}
          />

          {/* Overlay mobile — **apenas no mobile** */}
          <div style={m_overlay}>
            <div style={m_info}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={avatar}>
                  {active.author.avatar
                    ? <img src={active.author.avatar} alt="" style={avatarImg}/>
                    : <div style={{...avatarImg, display:'grid', placeItems:'center', color:'#9ca3af'}}>👤</div>}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>@{active.author.username} — {active.author.name}</div>
                  <div style={{ ...subtle, color: '#e5e7eb' }}>
                    {formatTime(active.createdAt)}
                    {active.mentions?.length ? <> • {active.mentions.map(m => `@${m}`).join(', ')}</> : null}
                    {active.location ? <> • 📍 {active.location}</> : null}
                  </div>
                </div>
              </div>
              <div style={{ ...desc, color: '#fff', marginTop: 6 }}>{active.description}</div>
            </div>

            {/* Ações verticais (mobile apenas) */}
            <div style={m_actions} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'grid', placeItems: 'center' }}>
                <div style={{ ...avatar, width: 44, height: 44, border: '1px solid rgba(255,255,255,.6)' }}>
                  {active.author.avatar
                    ? <img src={active.author.avatar} alt="" style={avatarImg}/>
                    : <div style={{...avatarImg, display:'grid', placeItems:'center', color:'#9ca3af'}}>👤</div>}
                </div>
              </div>

              <button style={{ ...m_iconBtn, ...(active.isLiked ? iconFilled : {}) }} onClick={()=>toggleLike(active.id)} title="Curtir">
                <HeartIcon filled={!!active.isLiked} />
              </button>
              <button style={m_iconBtn} onClick={()=>setMobileCommentsOpen(true)} title="Comentar">
                <CommentIcon />
              </button>
              <button style={m_iconBtn} onClick={handleShare} title="Compartilhar">
                <ShareIcon />
              </button>
              <button style={{ ...m_iconBtn, ...(active.isSaved ? iconFilled : {}) }} onClick={()=>toggleSave(active.id)} title="Salvar">
                <BookmarkIcon filled={!!active.isSaved} />
              </button>
              <div style={{ position: 'relative' }}>
                <button style={m_iconBtn} onClick={()=>setMenuOpen(v=>!v)} title="Mais"><EllipsisIcon /></button>
                {menuOpen && (
                  <div style={{ ...menu, right: 0, top: 0 }}>
                    <div style={menuItem} onClick={()=>{ setMenuOpen(false); handleReport() }}>Denunciar</div>
                    {isOwner(active.author.id) && (
                      <div style={{ ...menuItem, color: '#b91c1c' }} onClick={()=>{ setMenuOpen(false); handleDelete(active.id) }}>Excluir</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Painel de comentários (mobile slide-up) — usa MESMA lógica de "Ver X comentários" e "Responder" */}
        <div style={{
          position:'absolute', left:0, right:0, bottom:0, top:'40%',
          background:'#fff', borderTopLeftRadius:16, borderTopRightRadius:16,
          boxShadow:'0 -10px 20px rgba(0,0,0,.25)', display: isMobile && mobileCommentsOpen ? 'grid' : 'none',
          gridTemplateRows:'1fr auto'
        }}>
          <div style={commentsList}>
            {(active.comments||[]).map(c => (
              <CommentItemMobile
                key={c.id}
                c={c}
                avatar={avatar} avatarImg={avatarImg}
                iconBtn={iconBtn}
                openReplies={!!openReplies[c.id]}
                openReplyField={!!openReplyField[c.id]}
                onToggleReplies={()=>setOpenReplies(m=>({...m, [c.id]: !m[c.id]}))}
                onToggleReplyField={()=>setOpenReplyField(m=>({...m, [c.id]: !m[c.id]}))}
                replyText={replyText[c.id] || ''}
                setReplyText={(val)=>setReplyText(m=>({...m, [c.id]: val}))}
                onSubmitReply={()=>submitReply(c.id)}
                onLike={()=>toggleCommentLike(c.id)}
                onReplyLike={(rid)=>toggleReplyLike(c.id, rid)}
                repliesWrap={repliesWrap}
              />
            ))}
            {!active.comments?.length && <div style={{ color:'#6b7280' }}>Seja o primeiro a comentar.</div>}
          </div>
          <div style={{ padding:12, borderTop:'1px solid #e5e7eb', display:'flex', gap:8 }}>
            <input style={input} value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Seu comentário..." />
            <button style={sendBtn} onClick={submitComment}>Enviar</button>
            <button style={{ ...sendBtn, background:'#6b7280', borderColor:'#6b7280' }} onClick={()=>setMobileCommentsOpen(false)}>Fechar</button>
          </div>
        </div>
      </div>

      {/* DIREITA: Painel (desktop) */}
      <div style={right}>
        {/* FIELD 1 — Informações */}
        <div style={field1}>
          <div style={userBox}>
            <div style={avatar}>
              {active.author.avatar
                ? <img src={active.author.avatar} alt="" style={avatarImg}/>
                : <div style={{...avatarImg, display:'grid', placeItems:'center', color:'#9ca3af'}}>👤</div>}
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>@{active.author.username} — {active.author.name}</div>
              <div style={subtle}>
                {formatTime(active.createdAt)}
                {active.mentions?.length ? <> • {active.mentions.map(m => `@${m}`).join(', ')}</> : null}
                {active.location ? <> • 📍 {active.location}</> : null}
              </div>
            </div>
          </div>
          <div style={desc}>{active.description}</div>
        </div>

        {/* FIELD 2 — Ações */}
        <div style={{ ...field2, position:'relative' }}>
          <div style={actionsRow}>
            <button style={{ ...iconBtn, ...(active.isLiked ? iconFilled : {}) }} onClick={()=>toggleLike(active.id)} title="Curtir">
              <HeartIcon filled={!!active.isLiked} />
            </button>
            <button style={iconBtn} onClick={handleShare} title="Compartilhar">
              <ShareIcon />
            </button>
            <button style={{ ...iconBtn, ...(active.isSaved ? iconFilled : {}) }} onClick={()=>toggleSave(active.id)} title="Salvar">
              <BookmarkIcon filled={!!active.isSaved} />
            </button>
            <div style={{ position:'relative' }}>
              <button style={iconBtn} onClick={()=>setMenuOpen(v=>!v)} title="Mais"><EllipsisIcon /></button>
              {menuOpen && (
                <div style={menu}>
                  <div style={menuItem} onClick={()=>{ setMenuOpen(false); handleReport() }}>Denunciar</div>
                  {isOwner(active.author.id) && (
                    <div style={{ ...menuItem, color: '#b91c1c' }} onClick={()=>{ setMenuOpen(false); handleDelete(active.id) }}>Excluir</div>
                  )}
                </div>
              )}
            </div>
            <span style={likesBadge}>{active.likes} curtidas</span>
          </div>
        </div>

        {/* FIELD 3 — Comentários (desktop com "Ver X comentários" + "Responder") */}
        <div style={{ padding:0, display:'grid', gridTemplateRows:'1fr auto', minHeight:0 }}>
          <div style={commentsList}>
            {(active.comments||[]).map(c => (
              <CommentItemDesktop
                key={c.id}
                c={c}
                avatar={avatar} avatarImg={avatarImg}
                iconBtn={iconBtn}
                openReplies={!!openReplies[c.id]}
                openReplyField={!!openReplyField[c.id]}
                onToggleReplies={()=>setOpenReplies(m=>({...m, [c.id]: !m[c.id]}))}
                onToggleReplyField={()=>setOpenReplyField(m=>({...m, [c.id]: !m[c.id]}))}
                replyText={replyText[c.id] || ''}
                setReplyText={(val)=>setReplyText(m=>({...m, [c.id]: val}))}
                onSubmitReply={()=>submitReply(c.id)}
                onLike={()=>toggleCommentLike(c.id)}
                onReplyLike={(rid)=>toggleReplyLike(c.id, rid)}
                repliesWrap={repliesWrap}
                input={input}
                sendBtn={sendBtn}
              />
            ))}
            {!active.comments?.length && <div style={{ color:'#6b7280', padding:8 }}>Seja o primeiro a comentar.</div>}
          </div>

          <div style={{ padding:12, borderTop:'1px solid #e5e7eb', display:'flex', gap:8 }}>
            <input style={input} value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Seu comentário..." />
            <button style={sendBtn} onClick={submitComment}>Enviar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** ======= Itens de comentário (desktop) com "Ver X comentários" e "Responder" ======= */
function CommentItemDesktop({
  c, avatar, avatarImg, iconBtn,
  openReplies, openReplyField,
  onToggleReplies, onToggleReplyField,
  replyText, setReplyText, onSubmitReply,
  onLike, onReplyLike, repliesWrap, input, sendBtn
}) {
  const repliesCount = (c.replies || []).length
  return (
    <div style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'8px 0' }}>
      <div style={{ ...avatar, width: 28, height: 28 }}>
        {c?.author?.avatar
          ? <img src={c.author.avatar} alt="" style={avatarImg}/>
          : <div style={{...avatarImg, display:'grid', placeItems:'center', color:'#9ca3af'}}>👤</div>}
      </div>

      <div style={{ flex:1, background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:10, padding:8 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontWeight:600, fontSize:14 }}>{c?.author?.name || 'Usuário'}</div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button aria-label="Curtir comentário" style={{ ...iconBtn, width:28, height:28, borderRadius:8 }} onClick={onLike} title="Curtir comentário">
              <HeartIcon filled={!!c.isLiked}/>
            </button>
            <span style={{ fontSize:12, color:'#6b7280' }}>{c.likes || 0}</span>
          </div>
        </div>

        <div style={{ marginTop:4 }}>{c.text}</div>

        {/* Barra: "Ver X comentários" (esquerda) | "Responder" (direita) */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:6 }}>
          <button
            type="button"
            onClick={onToggleReplies}
            style={{ border:'none', background:'transparent', color:'#111827', textDecoration:'underline', cursor:'pointer', padding:0 }}
          >
            {repliesCount > 0 ? `Ver ${repliesCount} comentarios` : 'Sem comentários'}
          </button>

          <button
            type="button"
            onClick={onToggleReplyField}
            style={{ border:'1px solid #111827', background:'#111827', color:'#fff', padding:'6px 10px', borderRadius:8, cursor:'pointer' }}
          >
            Responder
          </button>
        </div>

        {/* Lista de sub-comentários (toggle) */}
        {openReplies && (
          <div style={repliesWrap}>
            {(c.replies || []).map(r => (
              <div key={r.id} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'6px 0' }}>
                <div style={{ ...avatar, width: 24, height: 24 }}>
                  {r?.author?.avatar
                    ? <img src={r.author.avatar} alt="" style={avatarImg}/>
                    : <div style={{...avatarImg, display:'grid', placeItems:'center', color:'#9ca3af'}}>👤</div>}
                </div>
                <div style={{ flex:1, background:'#ffffff', border:'1px solid #e5e7eb', borderRadius:10, padding:8 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ fontWeight:600, fontSize:13 }}>{r?.author?.name || 'Usuário'}</div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <button aria-label="Curtir resposta" style={{ ...iconBtn, width:26, height:26, borderRadius:8 }} onClick={()=>onReplyLike(r.id)} title="Curtir resposta">
                        <HeartIcon filled={!!r.isLiked}/>
                      </button>
                      <span style={{ fontSize:12, color:'#6b7280' }}>{r.likes || 0}</span>
                    </div>
                  </div>
                  <div style={{ marginTop:4 }}>{r.text}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Campo de resposta (toggle) */}
        {openReplyField && (
          <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:8 }}>
            <input
              style={{ ...input, padding:'6px 8px' }}
              value={replyText}
              onChange={e=>setReplyText(e.target.value)}
              placeholder="Responder…"
            />
            <button style={{ ...sendBtn, padding:'6px 10px' }} onClick={onSubmitReply}>Enviar</button>
          </div>
        )}
      </div>
    </div>
  )
}

/** ======= Versão Mobile do item (mesma lógica de toggle) ======= */
function CommentItemMobile({
  c, avatar, avatarImg, iconBtn,
  openReplies, openReplyField,
  onToggleReplies, onToggleReplyField,
  replyText, setReplyText, onSubmitReply,
  onLike, onReplyLike, repliesWrap
}) {
  const repliesCount = (c.replies || []).length
  return (
    <div style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'8px 0' }}>
      <div style={{ ...avatar, width: 28, height: 28 }}>
        {c?.author?.avatar
          ? <img src={c.author.avatar} alt="" style={avatarImg}/>
          : <div style={{...avatarImg, display:'grid', placeItems:'center', color:'#9ca3af'}}>👤</div>}
      </div>
      <div style={{ flex:1, background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:10, padding:8 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontWeight:600, fontSize:14 }}>{c?.author?.name || 'Usuário'}</div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button aria-label="Curtir comentário" style={{ ...iconBtn, width:28, height:28, borderRadius:8 }} onClick={onLike} title="Curtir comentário">
              <HeartIcon filled={!!c.isLiked}/>
            </button>
            <span style={{ fontSize:12, color:'#6b7280' }}>{c.likes || 0}</span>
          </div>
        </div>

        <div style={{ marginTop:4 }}>{c.text}</div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:6 }}>
          <button
            type="button"
            onClick={onToggleReplies}
            style={{ border:'none', background:'transparent', color:'#111827', textDecoration:'underline', cursor:'pointer', padding:0 }}
          >
            {repliesCount > 0 ? `Ver ${repliesCount} comentarios` : 'Sem comentários'}
          </button>

        <button
          type="button"
          onClick={onToggleReplyField}
          style={{ border:'1px solid #111827', background:'#111827', color:'#fff', padding:'6px 10px', borderRadius:8, cursor:'pointer' }}
        >
          Responder
        </button>
        </div>

        {openReplies && (
          <div style={repliesWrap}>
            {(c.replies || []).map(r => (
              <div key={r.id} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'6px 0' }}>
                <div style={{ ...avatar, width: 24, height: 24 }}>
                  {r?.author?.avatar
                    ? <img src={r.author.avatar} alt="" style={avatarImg}/>
                    : <div style={{...avatarImg, display:'grid', placeItems:'center', color:'#9ca3af'}}>👤</div>}
                </div>
                <div style={{ flex:1, background:'#ffffff', border:'1px solid #e5e7eb', borderRadius:10, padding:8 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ fontWeight:600, fontSize:13 }}>{r?.author?.name || 'Usuário'}</div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <button aria-label="Curtir resposta" style={{ ...iconBtn, width:26, height:26, borderRadius:8 }} onClick={()=>onReplyLike(r.id)} title="Curtir resposta">
                        <HeartIcon filled={!!r.isLiked}/>
                      </button>
                      <span style={{ fontSize:12, color:'#6b7280' }}>{r.likes || 0}</span>
                    </div>
                  </div>
                  <div style={{ marginTop:4 }}>{r.text}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {openReplyField && (
          <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:8 }}>
            <input
              style={{ width:'100%', border:'1px solid #e5e7eb', borderRadius:10, padding:'8px 10px', outline:'none' }}
              value={replyText}
              onChange={e=>setReplyText(e.target.value)}
              placeholder="Responder…"
            />
            <button
              style={{ marginLeft: 8, padding: '8px 12px', borderRadius: 10, border: '1px solid #111827', background: '#111827', color: '#fff', cursor: 'pointer' }}
              onClick={onSubmitReply}
            >
              Enviar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/** ----- Ícones ----- */
function HeartIcon({ filled }) {
  const stroke = '#111827'
  const fill = filled ? '#111827' : 'none'
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="1.5">
      <path d="M12.1 21s-6.7-4.3-9.2-7.6C.5 10.5 2 7 5.1 6.5c1.8-.3 3.1.6 4 1.7.9-1 2.2-2 4-1.7 3 .5 4.6 4 2.2 6.9-2.5 3.3-9.2 7.6-9.2 7.6z"/>
    </svg>
  )
}
function ShareIcon() {
  const stroke = '#111827'
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
      <path d="M14 9l5-5m0 0h-4m4 0v4" />
      <path d="M19 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
    </svg>
  )
}
function BookmarkIcon({ filled }) {
  const stroke = '#111827'
  const fill = filled ? '#111827' : 'none'
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="1.5">
      <path d="M6 3h12v18l-6-4-6 4V3z"/>
    </svg>
  )
}
function EllipsisIcon() {
  const stroke = '#111827'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  )
}
function CommentIcon() {
  const stroke = '#111827'
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
      <path d="M3 5h18v12H8l-5 4V5z" />
    </svg>
  )
}

/** ----- Utils / Mock ----- */
function formatTime(iso){
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit', second:'2-digit' })
  } catch { return '' }
}
function getMockReels(){
  return [
    {
      id: 1,
      src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      author: { id: 2, name:'Usuário Teste', username:'usuarioteste', avatar:'' },
      description: 'O sol está muito bom hoje na praia ☀️',
      mentions: ['pessoa'],
      location: 'São Paulo, SP',
      createdAt: new Date().toISOString(),
      likes: 10, isLiked: false, isSaved: false,
      comments: [
        { id: 101, author:{ name:'Ana', avatar:'' }, text:'Top! #dev', likes:0, isLiked:false, replies:[
          { id: 201, author:{ name:'Carlos' }, text:'🔥', likes:0, isLiked:false }
        ] }
      ]
    },
    {
      id: 2,
      src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      author: { id: 1, name:'Demo User', username:'demo_user', avatar:'' },
      description: 'Explorando novos lugares 🌎',
      mentions: [], location: '', createdAt: new Date().toISOString(),
      likes: 2, isLiked: false, isSaved: false, comments: []
    }
  ]
}
