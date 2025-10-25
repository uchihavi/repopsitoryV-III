import { useMemo, useState } from 'react'

/**
 * ProfilePage
 * - Modo dono: pode editar Foto, Nome, Bio, Nascimento (com privacidade), Localização,
 *   Website, Informações adicionais e Fotos em destaque
 * - Modo visitante: somente leitura + ações Seguir/Mensagem
 * - Campos: Foto, @username, Nome, Bio, Nascimento (com opção de ocultar/mostrar parcial),
 *   Localização, Ingresso, Website, Contadores, Integrações, Extras, Selos
 * - Ações: Seguir/Deixar de seguir, Mensagem, Editar, Compartilhar, Denunciar/Bloquear
 * - Abas: Postagens, Seguidores/Seguindo, Fotos/Vídeos, Salvos/Marcados
 * - Estilos inline e layout responsivo via flex-wrap/minWidth
 */

export default function ProfilePage(){
  // Mock: usuário logado x dono do perfil
  const loggedUserId = 1 // futuramente virá do backend
  const [profile, setProfile] = useState({
    id: 1,
    username: 'demo_user',
    fullName: 'Demo User',
    verified: true,
    bio: 'Apaixonado por tecnologia, café e livros.\nConstruindo uma rede social do zero. ☕️',
    dob: '1994-05-12',          // YYYY-MM-DD
    showDob: 'month-day',       // 'year' | 'month-day' | 'hidden'
    location: 'São Paulo, Brasil',
    joinedAt: '2020-05-15T10:00:00Z',
    website: 'https://example.com',
    following: 180,
    followers: 245,
    isFollowing: false,         // se o logado segue este perfil
    avatarUrl: '',
    featuredPhotos: [],
    integrations: [
      { id: 'github', label: 'GitHub', url: 'https://github.com/example' },
      { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/example' },
    ],
    extra: {
      profession: 'Desenvolvedor Frontend',
      education: 'Bacharel em Ciência da Computação',
      interests: 'UI/UX, Open Source, Música',
      relationship: 'Solteiro(a)',
    },
    posts: [
      { id: 11, type: 'text', content: 'Primeiro post no meu novo perfil! 👋', createdAt: '2025-10-01T12:00:00Z' },
      { id: 12, type: 'image', src: '', content: 'Foto do setup', createdAt: '2025-10-03T09:20:00Z' },
    ],
  })

  const isOwner = profile.id === loggedUserId
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState('posts') // 'posts' | 'network' | 'media' | 'saved'

  // Labels formatadas
  const joinedLabel = useMemo(() => {
    const d = new Date(profile.joinedAt)
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }, [profile.joinedAt])

  const dobLabel = useMemo(() => {
    if (!profile.dob || profile.showDob === 'hidden') return '—'
    const d = new Date(profile.dob)
    if (profile.showDob === 'month-day') {
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  }, [profile.dob, profile.showDob])

  // Handlers
  function toggleFollow(){
    setProfile(p => ({
      ...p,
      isFollowing: !p.isFollowing,
      followers: p.isFollowing ? p.followers - 1 : p.followers + 1
    }))
  }

  function onAvatarChange(e){
    const f = e.target.files?.[0]
    if(!f) return
    const url = URL.createObjectURL(f)
    setProfile(p => ({ ...p, avatarUrl: url }))
  }

  function onFeaturedAdd(e){
    const f = e.target.files?.[0]
    if(!f) return
    const url = URL.createObjectURL(f)
    setProfile(p => ({ ...p, featuredPhotos: [{ id: Date.now(), url }, ...p.featuredPhotos].slice(0,6) }))
  }

  function saveEdits(updated){
    setProfile(p => ({ ...p, ...updated }))
    setEditMode(false)
    // TODO: integrar com backend (PATCH/PUT)
  }

  // Estilos inline
  const wrap = { maxWidth: 980, margin: '0 auto', padding: 12 }
  const row = { display: 'flex', gap: 16, flexWrap: 'wrap', alignItems:'flex-start' }
  const colLeft = { flex: '1 1 260px', minWidth: 260 }
  const colRight = { flex: '2 1 420px', minWidth: 320 }
  const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }
  const btn = { padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer' }
  const badge = { display:'inline-block', padding: '2px 8px', border: '1px solid #e5e7eb', borderRadius: 999, fontSize: 12 }
  const label = { fontSize: 12, color: '#6b7280' }

  return (
    <div style={wrap}>
      {/* Header do perfil */}
      <div style={{...card, marginBottom: 12}}>
        <div style={{ display:'flex', gap: 16, alignItems: 'center', flexWrap:'wrap' }}>
          {/* 1. Foto de Perfil */}
          <div style={{ position:'relative' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background:'#e5e7eb', overflow:'hidden', border:'1px solid #e5e7eb' }}>
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              ) : (
                <div style={{ width:'100%', height:'100%', display:'grid', placeItems:'center', color:'#9ca3af' }}>👤</div>
              )}
            </div>
            {isOwner && editMode && (
              <label style={{ position:'absolute', right:-4, bottom:-4, ...btn, background:'#f8fafc' }}>
                Alterar
                <input type="file" accept="image/*" onChange={onAvatarChange} style={{ display:'none' }} />
              </label>
            )}
          </div>

          {/* 2. Nome de Usuário (handle), 3. Nome Completo, 17. Selo */}
          <div style={{ flex:1, minWidth: 220 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              {editMode ? (
                <input
                  value={profile.fullName}
                  onChange={e=>setProfile(p=>({...p, fullName:e.target.value}))}
                  style={{ fontSize:22, fontWeight:700, border:'1px solid #e5e7eb', borderRadius:8, padding:'6px 8px' }}
                />
              ) : (
                <div style={{ fontSize:22, fontWeight:700 }}>
                  {profile.fullName}
                  {profile.verified && (<span title="Verificado" style={{ marginLeft:8 }}>✔️</span>)}
                </div>
              )}
            </div>
            <div style={{ color:'#6b7280' }}>@{profile.username}</div>
          </div>

          {/* 10/11/15. Ações principais */}
          <div style={{ display:'flex', gap:8 }}>
            {!isOwner ? (
              <>
                <button style={{...btn, background: profile.isFollowing ? '#fef2f2' : '#eff6ff' }} onClick={toggleFollow}>
                  {profile.isFollowing ? 'Deixar de seguir' : 'Seguir'}
                </button>
                <button style={btn} onClick={()=>alert('Abrir conversa privada…')}>Mensagem</button>
                <button style={btn} onClick={()=>alert('Compartilhar perfil…')}>Compartilhar</button>
                <button style={{...btn, color:'#b91c1c'}} onClick={()=>alert('Denunciar/Bloquear…')}>Denunciar/Bloquear</button>
              </>
            ) : (
              <>
                <button style={{...btn, background: editMode ? '#ecfeff' : '#eff6ff'}} onClick={()=>setEditMode(e=>!e)}>
                  {editMode ? 'Concluir edição' : 'Editar Perfil'}
                </button>
                {editMode && (<button style={{...btn}} onClick={()=>saveEdits({})}>Salvar</button>)}
                <button style={btn} onClick={()=>alert('Compartilhar perfil…')}>Compartilhar</button>
              </>
            )}
          </div>
        </div>

        {/* 4–9. Bio, Nascimento, Localização, Ingresso, Website, Contadores */}
        <div style={{ marginTop: 12, display:'grid', gap:8 }}>
          {/* 4. Bio/Descrição */}
          <div>
            <div style={label}>Bio</div>
            {editMode ? (
              <textarea
                rows={3}
                value={profile.bio}
                onChange={e=>setProfile(p=>({...p, bio:e.target.value}))}
                style={{ width:'100%', padding:8, border:'1px solid #e5e7eb', borderRadius:8, resize:'vertical' }}
              />
            ) : (
              <div style={{ whiteSpace:'pre-wrap' }}>{profile.bio || '—'}</div>
            )}
          </div>

          {/* Linha de infos */}
          <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
            {/* 5. Data de Nascimento com privacidade */}
            <div>
              <div style={label}>Data de Nascimento</div>
              <div>
                {dobLabel}
                {isOwner && editMode && (
                  <div style={{ display:'flex', gap:8, marginTop:6 }}>
                    <input
                      type="date"
                      value={profile.dob}
                      onChange={e=>setProfile(p=>({...p, dob:e.target.value}))}
                      style={{ padding:6, border:'1px solid #e5e7eb', borderRadius:8 }}
                    />
                    <select
                      value={profile.showDob}
                      onChange={e=>setProfile(p=>({...p, showDob:e.target.value}))}
                      style={{ padding:6, border:'1px solid #e5e7eb', borderRadius:8 }}
                    >
                      <option value="year">Dia/Mês/Ano</option>
                      <option value="month-day">Dia/Mês</option>
                      <option value="hidden">Ocultar</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* 6. Localização */}
            <div>
              <div style={label}>Localização</div>
              {editMode ? (
                <input
                  value={profile.location}
                  onChange={e=>setProfile(p=>({...p, location:e.target.value}))}
                  style={{ padding:6, border:'1px solid #e5e7eb', borderRadius:8 }}
                />
              ) : (<div>{profile.location || '—'}</div>)}
            </div>

            {/* 7. Ingresso */}
            <div>
              <div style={label}>Ingresso</div>
              <div>Entrou em {joinedLabel}</div>
            </div>

            {/* 8. Website */}
            <div>
              <div style={label}>Website</div>
              {editMode ? (
                <input
                  value={profile.website}
                  onChange={e=>setProfile(p=>({...p, website:e.target.value}))}
                  style={{ padding:6, border:'1px solid #e5e7eb', borderRadius:8, minWidth:240 }}
                />
              ) : (
                profile.website ? <a href={profile.website} target="_blank" rel="noreferrer">{profile.website}</a> : '—'
              )}
            </div>
          </div>

          {/* 9. Contadores */}
          <div style={{ display:'flex', gap:24, flexWrap:'wrap', marginTop:4 }}>
            <div style={badge}><strong>{profile.following}</strong> seguindo</div>
            <div style={badge}><strong>{profile.followers}</strong> seguidores</div>
          </div>
        </div>
      </div>

      {/* Colunas: Informações + Integrações + Abas/Conteúdo */}
      <div style={{ ...row }}>
        {/* 14. Informações Adicionais e 13. Integrações */}
        <div style={{ ...colLeft, ...card }}>
          <h3 style={{ marginTop:0 }}>Informações</h3>
          <div style={{ display:'grid', gap:8 }}>
            <FieldRow label="Profissão/Cargo">
              {editMode ? (
                <input
                  value={profile.extra.profession}
                  onChange={e=>setProfile(p=>({...p, extra:{...p.extra, profession:e.target.value}}))}
                  style={inputStyle}
                />
              ) : (profile.extra.profession || '—')}
            </FieldRow>
            <FieldRow label="Educação">
              {editMode ? (
                <input
                  value={profile.extra.education}
                  onChange={e=>setProfile(p=>({...p, extra:{...p.extra, education:e.target.value}}))}
                  style={inputStyle}
                />
              ) : (profile.extra.education || '—')}
            </FieldRow>
            <FieldRow label="Interesses">
              {editMode ? (
                <input
                  value={profile.extra.interests}
                  onChange={e=>setProfile(p=>({...p, extra:{...p.extra, interests:e.target.value}}))}
                  style={inputStyle}
                />
              ) : (profile.extra.interests || '—')}
            </FieldRow>
            <FieldRow label="Relacionamento">
              {editMode ? (
                <input
                  value={profile.extra.relationship}
                  onChange={e=>setProfile(p=>({...p, extra:{...p.extra, relationship:e.target.value}}))}
                  style={inputStyle}
                />
              ) : (profile.extra.relationship || '—')}
            </FieldRow>
          </div>

          <h3>Integrações</h3>
          <ul style={{ paddingLeft:16, marginTop:8 }}>
            {profile.integrations.map(i => (
              <li key={i.id} style={{ margin:'6px 0' }}>
                <a href={i.url} target="_blank" rel="noreferrer">{i.label}</a>
              </li>
            ))}
          </ul>
          {isOwner && editMode && (
            <button
              style={{...btn, marginTop:8}}
              onClick={()=>setProfile(p=>({...p, integrations:[...p.integrations, { id: Date.now().toString(), label:'Nova', url:'https://'}]}))}
            >
              Adicionar integração
            </button>
          )}
        </div>

        {/* 12/16. Postagens & Abas */}
        <div style={{ ...colRight }}>
          <div style={{...card, padding: 8, marginBottom:12}}>
            <TabBar value={activeTab} onChange={setActiveTab} />
          </div>

          {activeTab === 'posts' && (
            <div style={{ ...card }}>
              <h3 style={{ marginTop:0 }}>Postagens</h3>
              {profile.posts?.length ? (
                <div style={{ display:'grid', gap:12 }}>
                  {profile.posts.map(p => (
                    <div key={p.id} style={{ border:'1px solid #e5e7eb', borderRadius:8, padding:12 }}>
                      <div style={{ fontSize:12, color:'#6b7280' }}>{new Date(p.createdAt).toLocaleString()}</div>
                      <div style={{ marginTop:6 }}>{p.content}</div>
                      {p.type === 'image' && p.src && (
                        <img src={p.src} alt="media" style={{ marginTop:8, maxWidth:'100%', borderRadius:8 }} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color:'#6b7280' }}>Sem postagens ainda.</div>
              )}
            </div>
          )}

          {activeTab === 'network' && (
            <div style={{ ...card }}>
              <h3 style={{ marginTop:0 }}>Seguidores / Seguindo</h3>
              <div style={{ color:'#6b7280' }}>Lista simplificada (integração real em breve)</div>
            </div>
          )}

          {activeTab === 'media' && (
            <div style={{ ...card }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h3 style={{ marginTop:0 }}>Fotos/Vídeos</h3>
                {isOwner && editMode && (
                  <label style={{...btn}}>
                    Adicionar mídia
                    <input type="file" accept="image/*,video/*" onChange={onFeaturedAdd} style={{ display:'none' }} />
                  </label>
                )}
              </div>
              {profile.featuredPhotos?.length ? (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px,1fr))', gap:8 }}>
                  {profile.featuredPhotos.map(ph => (
                    <div key={ph.id} style={{ border:'1px solid #e5e7eb', borderRadius:8, overflow:'hidden' }}>
                      <img src={ph.url} alt="media" style={{ width:'100%', height:120, objectFit:'cover' }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color:'#6b7280' }}>Nenhuma mídia por aqui.</div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div style={{ ...card }}>
              <h3 style={{ marginTop:0 }}>Salvos/Marcados</h3>
              <div style={{ color:'#6b7280' }}>Seus itens salvos aparecerão aqui.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Auxiliares
const inputStyle = { padding:6, border:'1px solid #e5e7eb', borderRadius:8, width:'100%' }

function FieldRow({ label, children }){
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ fontSize:12, color:'#6b7280' }}>{label}</div>
      <div>{children}</div>
    </div>
  )
}

function TabBar({ value, onChange }){
  const tabs = [
    { id:'posts',   label:'Postagens' },
    { id:'network', label:'Seguidores/Seguindo' },
    { id:'media',   label:'Fotos/Vídeos' },
    { id:'saved',   label:'Salvos/Marcados' },
  ]
  return (
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={()=>onChange(t.id)}
          style={{
            padding:'8px 12px',
            border:'1px solid #e5e7eb',
            borderRadius:8,
            background: value===t.id ? '#eef2ff' : '#fff'
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
