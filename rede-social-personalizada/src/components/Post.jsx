import { useMemo, useRef, useState } from 'react'

/**
 * Post.jsx — avançado
 * - Mantém: curtir, escrever comentário, enviar
 * - Adiciona:
 *   1) Ícone de três pontos com menu (excluir apenas para dono)
 *   2) Barra de interação com ícones (curtir, comentar, compartilhar, salvar)
 *   3) Comentários ocultos por padrão; exibe ao clicar no ícone comentar
 *   4) Sub-comentários (1 nível) e like em comentários
 *   5) Visualização de mídia em tela inteira (lightbox)
 *
 * Props esperadas (flexível; usa defaults):
 * - post: {
 *     id, author:{id,name,avatarUrl}, content, image, video, createdAt,
 *     likes, isLiked?, isSaved?, comments: [
 *       { id, author:{id,name,avatarUrl}, text, likes, isLiked?, createdAt,
 *         replies:[{ id, author, text, likes, isLiked?, createdAt }] }
 *     ]
 *   }
 * - currentUser: { id, name, avatarUrl }
 * - onLike(postId, nextState)
 * - onComment(postId, text)
 * - onReply(postId, commentId, text)
 * - onToggleSave(postId, nextSaved)
 * - onShare(postId)
 * - onDelete(postId)  // apenas dono
 */

export default function Post({
  post,
  currentUser,
  onLike,
  onComment,
  onReply,
  onToggleSave,
  onShare,
  onDelete,
}) {
  const [liked, setLiked] = useState(!!post?.isLiked)
  const [saved, setSaved] = useState(!!post?.isSaved)
  const [likesCount, setLikesCount] = useState(post?.likes ?? 0)

  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [replyMap, setReplyMap] = useState({}) // { [commentId]: string }

  const [localComments, setLocalComments] = useState(() => post?.comments ?? [])
  const [menuOpen, setMenuOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const isOwner = useMemo(() => currentUser?.id && post?.author?.id === currentUser.id, [currentUser, post])

  // Acessibilidade: fecho menu ao clicar fora
  const menuRef = useRef(null)

  // Formatações
  const when = useMemo(() => {
    if (!post?.createdAt) return ''
    const d = new Date(post.createdAt)
    return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
  }, [post?.createdAt])

  // Handlers de topo
  function toggleLike() {
    const next = !liked
    setLiked(next)
    setLikesCount(c => c + (next ? 1 : -1))
    onLike?.(post.id, next)
  }
  function toggleSave() {
    const next = !saved
    setSaved(next)
    onToggleSave?.(post.id, next)
  }
  function handleShare() {
    onShare?.(post.id)
    // opcional: navigator.share
  }
  function handleDelete() {
    if (!isOwner) return
    if (confirm('Deseja excluir este post?')) {
      onDelete?.(post.id)
    }
  }

  // Comentários
  function submitComment(e) {
    e?.preventDefault?.()
    const text = commentText.trim()
    if (!text) return
    const newComment = {
      id: Date.now(),
      author: { id: currentUser?.id, name: currentUser?.name || 'Você', avatarUrl: currentUser?.avatarUrl },
      text,
      likes: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      replies: [],
    }
    setLocalComments(prev => [newComment, ...prev])
    setCommentText('')
    onComment?.(post.id, text)
  }

  function submitReply(commentId) {
    const text = (replyMap[commentId] || '').trim()
    if (!text) return
    const reply = {
      id: Date.now(),
      author: { id: currentUser?.id, name: currentUser?.name || 'Você', avatarUrl: currentUser?.avatarUrl },
      text,
      likes: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
    }
    setLocalComments(prev =>
      prev.map(c => (c.id === commentId ? { ...c, replies: [reply, ...(c.replies || [])] } : c))
    )
    setReplyMap(m => ({ ...m, [commentId]: '' }))
    onReply?.(post.id, commentId, text)
  }

  function toggleCommentLike(commentId) {
    setLocalComments(prev =>
      prev.map(c => {
        if (c.id !== commentId) return c
        const nextLiked = !c.isLiked
        return { ...c, isLiked: nextLiked, likes: (c.likes || 0) + (nextLiked ? 1 : -1) }
      })
    )
  }
  function toggleReplyLike(commentId, replyId) {
    setLocalComments(prev =>
      prev.map(c => {
        if (c.id !== commentId) return c
        const replies = (c.replies || []).map(r => {
          if (r.id !== replyId) return r
          const nextLiked = !r.isLiked
          return { ...r, isLiked: nextLiked, likes: (r.likes || 0) + (nextLiked ? 1 : -1) }
        })
        return { ...c, replies }
      })
    )
  }

  // Estilos
  const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, marginBottom: 12 }
  const head = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }
  const userBox = { display: 'flex', gap: 10, alignItems: 'center' }
  const avatar = { width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: '#f3f4f6', border: '1px solid #e5e7eb' }
  const avatarImg = { width: '100%', height: '100%', objectFit: 'cover' }
  const name = { fontWeight: 600 }
  const time = { fontSize: 12, color: '#6b7280' }

  const dotBtn = { border: 'none', background: 'transparent', cursor: 'pointer', padding: 6, borderRadius: 8 }
  const menu = {
    position: 'absolute', right: 4, top: 36, zIndex: 20, background: '#fff',
    border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden',
    boxShadow: '0 10px 20px rgba(0,0,0,.06)'
  }
  const menuItem = { padding: '10px 12px', cursor: 'pointer', fontSize: 14, borderBottom: '1px solid #f3f4f6' }

  const content = { marginTop: 6, marginBottom: 8, whiteSpace: 'pre-wrap' }
  const mediaBox = { marginTop: 8, borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', cursor: 'zoom-in' }
  const mediaStyle = { width: '100%', height: 'auto', display: 'block' }

  const actions = { display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }
  const iconBtn = {
    width: 36, height: 36, borderRadius: 10, border: '1px solid #111827',
    background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center',
    transition: 'transform .05s ease, background .15s, color .15s'
  }
  const iconFilled = { background: '#111827', color: '#fff' }
  const likesBadge = {
    marginLeft: 6, fontSize: 12, padding: '2px 8px', borderRadius: 999,
    background: '#f3f4f6', color: '#374151'
  }

  const commentWrap = { marginTop: 8, borderTop: '1px solid #f3f4f6', paddingTop: 10, display: showComments ? 'block' : 'none' }
  const input = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 10px', outline: 'none' }
  const sendBtn = { marginLeft: 8, padding: '8px 12px', borderRadius: 10, border: '1px solid #111827', background: '#111827', color: '#fff', cursor: 'pointer' }

  const commentItem = { display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0' }
  const commentBox = { flex: 1, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 8 }
  const commentHead = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
  const subActions = { display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }

  const replyBox = { display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }
  const repliesWrap = { marginTop: 6, marginLeft: 44 }

  const lightbox = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.9)', display: lightboxOpen ? 'grid' : 'none',
    placeItems: 'center', zIndex: 50
  }
  const closeLightbox = {
    position: 'fixed', top: 16, right: 16, background: 'rgba(255,255,255,.08)',
    border: '1px solid rgba(255,255,255,.2)', color: '#fff', borderRadius: 12, padding: '8px 12px', cursor: 'pointer'
  }

  return (
    <div style={card}>
      {/* Cabeçalho */}
      <div style={head}>
        <div style={userBox}>
          <div style={avatar}>
            {post?.author?.avatarUrl
              ? <img src={post.author.avatarUrl} alt="" style={avatarImg}/>
              : <div style={{...avatarImg, display:'grid', placeItems:'center', color:'#9ca3af'}}>👤</div>}
          </div>
          <div>
            <div style={name}>{post?.author?.name || 'Usuário'}</div>
            <div style={time}>{when}</div>
          </div>
        </div>

        {/* Menu de três pontos */}
        <div style={{ position: 'relative' }}>
          <button
            aria-label="Mais opções"
            style={dotBtn}
            onClick={() => setMenuOpen(v => !v)}
          >
            <EllipsisIcon filled={menuOpen}/>
          </button>
          {menuOpen && (
            <div ref={menuRef} style={menu} onMouseLeave={() => setMenuOpen(false)}>
              {isOwner && (
                <div
                  role="button"
                  style={menuItem}
                  onClick={() => { setMenuOpen(false); handleDelete() }}
                >
                  Excluir post
                </div>
              )}
              {!isOwner && (
                <div style={{ ...menuItem, color: '#6b7280' }}>
                  (Sem ações disponíveis)
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      {post?.content && <div style={content}>{post.content}</div>}

      {/* Mídia (imagem ou vídeo) */}
      {(post?.image || post?.video) && (
        <div style={mediaBox} onClick={() => setLightboxOpen(true)} title="Ver em tela inteira">
          {post.image && <img src={post.image} alt="mídia" style={mediaStyle} />}
          {post.video && (
            <video src={post.video} style={mediaStyle} controls onClick={e => e.stopPropagation()}/>
          )}
        </div>
      )}

      {/* Barra de ações com ícones */}
      <div style={actions}>
        <button
          aria-label="Curtir"
          style={{ ...iconBtn, ...(liked ? iconFilled : {}) }}
          onClick={toggleLike}
          title="Curtir"
        >
          <HeartIcon filled={liked}/>
        </button>
        <button
          aria-label="Comentar"
          style={iconBtn}
          onClick={() => setShowComments(v => !v)}
          title="Comentar"
        >
          <CommentIcon filled={showComments}/>
        </button>
        <button
          aria-label="Compartilhar"
          style={iconBtn}
          onClick={handleShare}
          title="Compartilhar"
        >
          <ShareIcon/>
        </button>
        <button
          aria-label="Salvar"
          style={{ ...iconBtn, ...(saved ? iconFilled : {}) }}
          onClick={toggleSave}
          title="Salvar"
        >
          <BookmarkIcon filled={saved}/>
        </button>

        <span style={likesBadge}>{likesCount} curtidas</span>
      </div>

      {/* Comentários (ocultos por padrão) */}
      <div style={commentWrap}>
        {/* escrever comentário */}
        <form onSubmit={submitComment} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            style={input}
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Escreva um comentário…"
          />
          <button type="submit" style={sendBtn}>Enviar</button>
        </form>

        {/* lista de comentários + sub-comentários */}
        <div style={{ marginTop: 8 }}>
          {localComments.map(c => (
            <div key={c.id} style={commentItem}>
              {/* avatar */}
              <div style={{ ...avatar, width: 28, height: 28 }}>
                {c?.author?.avatarUrl
                  ? <img src={c.author.avatarUrl} alt="" style={avatarImg}/>
                  : <div style={{...avatarImg, display:'grid', placeItems:'center', color:'#9ca3af'}}>👤</div>}
              </div>

              <div style={commentBox}>
                <div style={commentHead}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c?.author?.name || 'Usuário'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      aria-label="Curtir comentário"
                      style={{ ...iconBtn, width: 28, height: 28, borderRadius: 8 }}
                      onClick={() => toggleCommentLike(c.id)}
                      title="Curtir comentário"
                    >
                      <HeartIcon filled={!!c.isLiked}/>
                    </button>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{c.likes || 0}</span>
                  </div>
                </div>
                <div style={{ marginTop: 4 }}>{c.text}</div>

                {/* respostas (um nível) */}
                <div style={repliesWrap}>
                  {(c.replies || []).map(r => (
                    <div key={r.id} style={{ ...commentItem, padding: 0 }}>
                      <div style={{ ...avatar, width: 24, height: 24 }}>
                        {r?.author?.avatarUrl
                          ? <img src={r.author.avatarUrl} alt="" style={avatarImg}/>
                          : <div style={{...avatarImg, display:'grid', placeItems:'center', color:'#9ca3af'}}>👤</div>}
                      </div>
                      <div style={{ ...commentBox, background: '#ffffff' }}>
                        <div style={commentHead}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{r?.author?.name || 'Usuário'}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button
                              aria-label="Curtir resposta"
                              style={{ ...iconBtn, width: 26, height: 26, borderRadius: 8 }}
                              onClick={() => toggleReplyLike(c.id, r.id)}
                              title="Curtir resposta"
                            >
                              <HeartIcon filled={!!r.isLiked}/>
                            </button>
                            <span style={{ fontSize: 12, color: '#6b7280' }}>{r.likes || 0}</span>
                          </div>
                        </div>
                        <div style={{ marginTop: 4 }}>{r.text}</div>
                      </div>
                    </div>
                  ))}

                  {/* escrever resposta (um nível) */}
                  <div style={replyBox}>
                    <input
                      style={{ ...input, padding: '6px 8px' }}
                      value={replyMap[c.id] || ''}
                      onChange={e => setReplyMap(m => ({ ...m, [c.id]: e.target.value }))}
                      placeholder="Responder…"
                    />
                    <button type="button" style={{ ...sendBtn, padding: '6px 10px' }} onClick={() => submitReply(c.id)}>
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!localComments.length && (
            <div style={{ color: '#6b7280', fontSize: 14, padding: '6px 0' }}>
              Seja o primeiro a comentar.
            </div>
          )}
        </div>
      </div>

      {/* Lightbox (tela inteira) */}
      <div style={lightbox} onClick={() => setLightboxOpen(false)} role="dialog" aria-modal="true">
        <button style={closeLightbox} onClick={() => setLightboxOpen(false)}>Fechar ✕</button>
        <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '86vh' }}>
          {post.image && <img src={post.image} alt="mídia" style={{ maxWidth: '100%', maxHeight: '86vh' }} />}
          {post.video && <video src={post.video} style={{ maxWidth: '100%', maxHeight: '86vh' }} controls autoPlay />}
        </div>
      </div>
    </div>
  )
}

/* ================= ICONES (inline SVG elegantes) ================= */

function EllipsisIcon({ filled }) {
  const stroke = filled ? 'currentColor' : '#111827'
  const fill = filled ? 'currentColor' : 'none'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={fill} style={{ color: '#111827' }}>
      <circle cx="5" cy="12" r="2" stroke={stroke} strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2" stroke={stroke} strokeWidth="1.5" />
      <circle cx="19" cy="12" r="2" stroke={stroke} strokeWidth="1.5" />
    </svg>
  )
}

function HeartIcon({ filled }) {
  const stroke = '#111827'
  const fill = filled ? '#111827' : 'none'
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="1.5">
      <path d="M12.1 21s-6.7-4.3-9.2-7.6C.5 10.5 2 7 5.1 6.5c1.8-.3 3.1.6 4 1.7.9-1 2.2-2 4-1.7 3 .5 4.6 4 2.2 6.9-2.5 3.3-9.2 7.6-9.2 7.6z"/>
    </svg>
  )
}

function CommentIcon({ filled }) {
  const stroke = '#111827'
  const fill = filled ? '#111827' : 'none'
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="1.5">
      <path d="M3 5h18v12H8l-5 4V5z" />
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
