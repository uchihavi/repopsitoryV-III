import { useEffect, useState } from "react";
import Post from "./Post"; // opcional - usado no modal para exibir um post completo

// Padrão cíclico do mosaico (a cada 12 itens)
function getMosaicClass(index) {
  const m = index % 12;
  if (m === 3) return "tall";              // 1x2
  if (m === 6) return "wide";              // 2x1
  return "";                               // 1x1
}

export default function Explore({
  currentUser,
  externalQuery = "",
  onOpenProfile,
  onRequestOpenReelsView,
  onOpenPost,
}) {
  // ==== Estado base ====
  const [query, setQuery] = useState(externalQuery);
  const [activeTab, setActiveTab] = useState("posts"); // 'posts' | 'reels' | 'accounts'
  const [data, setData] = useState(() => getMockExploreData());
  const [filtered, setFiltered] = useState({ posts: [], reels: [], accounts: [] });

  // Modal de Post (abre Post.jsx completo dentro de um lightbox)
  const [postModal, setPostModal] = useState({ open: false, post: null });

  // Sincroniza busca externa (Header.jsx → Explore.jsx)
  useEffect(() => {
    setQuery(externalQuery || "");
  }, [externalQuery]);

  // Filtragem simples por query (titulo/hashtag/nome)
  useEffect(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) {
      setFiltered({
        posts: data.posts,
        reels: data.reels,
        accounts: data.accounts,
      });
      return;
    }
    const match = (txt) => (txt || "").toLowerCase().includes(q);

    setFiltered({
      posts: data.posts.filter((p) => match(p.title) || p.tags?.some(match)),
      reels: data.reels.filter((r) => match(r.title) || r.tags?.some(match)),
      accounts: data.accounts.filter(
        (a) => match(a.fullName) || match(a.username) || match(a.bio)
      ),
    });
  }, [query, data]);

  // Ações: abrir Post (modal local) ou delegar para o pai
  const handleOpenPost = (post) => {
    if (onOpenPost) return onOpenPost(post);
    setPostModal({ open: true, post });
  };

  // Ações: abrir Reel em Reals.jsx (via callback)
  const handleOpenReel = (_reel, index) => {
    if (!onRequestOpenReelsView) return;
    onRequestOpenReelsView({ reels: filtered.reels, startIndex: index });
  };

  // Contas: seguir/seguindo/desseguir (somente UI local)
  const toggleFollow = (userId) => {
    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((acc) =>
        acc.id === userId ? { ...acc, following: !acc.following, askUnfollow: false } : acc
      ),
    }));
  };
  const askUnfollow = (userId, ask = true) => {
    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((acc) =>
        acc.id === userId ? { ...acc, askUnfollow: ask } : { ...acc, askUnfollow: false }
      ),
    }));
  };

  // ==== Renders ====
  const renderTabs = (
    <div style={styles.tabs}>
      <TabButton active={activeTab === "posts"} onClick={() => setActiveTab("posts")}>
        Posts
      </TabButton>
      <TabButton active={activeTab === "reels"} onClick={() => setActiveTab("reels")}>
        Reels
      </TabButton>
      <TabButton active={activeTab === "accounts"} onClick={() => setActiveTab("accounts")}>
        Contas
      </TabButton>
    </div>
  );

  // --- MOSAICO 3 colunas (Posts) ---
  const renderGridPosts = (
    <div className="ig-grid">
      {filtered.posts.map((item, idx) => (
        <div key={`p-${item.id}`} className={`ig-item ${getMosaicClass(idx)}`}>
          <button
            onClick={() => handleOpenPost(item)}
            className="ig-button"
            title={item.title}
            aria-label={`Abrir post ${item.title}`}
          >
            {item.type === "video" ? (
              <video
                src={item.src}
                className="ig-media"
                muted
                playsInline
                loop
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => e.currentTarget.pause()}
              />
            ) : (
              <img src={item.src} alt={item.title} className="ig-media" />
            )}
            <div className="ig-overlay">
              <span>❤ {item.likes}</span>
              <span>💬 {item.comments}</span>
            </div>
          </button>
        </div>
      ))}
    </div>
  );

  // --- MOSAICO 3 colunas (Reels) ---
  const renderGridReels = (
    <div className="ig-grid">
      {filtered.reels.map((item, idx) => (
        <div key={`r-${item.id}`} className={`ig-item ${getMosaicClass(idx)}`}>
          <button
            onClick={() => handleOpenReel(item, idx)}
            className="ig-button"
            title={item.title}
            aria-label={`Abrir reel ${item.title}`}
          >
            <video
              src={item.src}
              className="ig-media"
              muted
              playsInline
              loop
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => e.currentTarget.pause()}
            />
            <div className="ig-overlay">
              <span>▶ Reels</span>
            </div>
          </button>
        </div>
      ))}
    </div>
  );

  const renderAccounts = (
    <div style={styles.accountsWrap}>
      <div style={styles.accountsList}>
        {filtered.accounts.map((acc) => (
          <div key={acc.id} style={styles.accountRow}>
            <button
              style={styles.avatarBtn}
              onClick={() => onOpenProfile && onOpenProfile(acc)}
              title={`Abrir perfil de ${acc.fullName}`}
              aria-label={`Abrir perfil de ${acc.fullName}`}
            >
              <img src={acc.avatar} alt={acc.fullName} style={styles.avatar} />
            </button>

            <div style={styles.accountInfo}>
              <button
                onClick={() => onOpenProfile && onOpenProfile(acc)}
                style={styles.nameBtn}
                title={acc.fullName}
                aria-label={`Abrir perfil de ${acc.fullName}`}
              >
                {acc.fullName}
              </button>
              <button
                onClick={() => onOpenProfile && onOpenProfile(acc)}
                style={styles.usernameBtn}
                title={acc.username}
                aria-label={`Abrir perfil de ${acc.username}`}
              >
                {acc.username}
              </button>
            </div>

            {!acc.following ? (
              <button
                style={styles.followBtn}
                onClick={() => toggleFollow(acc.id)}
                aria-label={`Seguir ${acc.fullName}`}
              >
                Seguir
              </button>
            ) : (
              <div style={{ position: "relative" }}>
                <button
                  style={styles.followingBtn}
                  onClick={() => askUnfollow(acc.id, !acc.askUnfollow)}
                  aria-label={`Opções de seguindo para ${acc.fullName}`}
                >
                  Seguindo
                </button>
                {acc.askUnfollow && (
                  <div style={styles.unfollowMenu}>
                    <button
                      style={styles.unfollowDanger}
                      onClick={() => toggleFollow(acc.id)}
                    >
                      Deixar de seguir
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* CSS do mosaico IG */}
      <style>{igMosaicCSS}</style>

      {/* Barra de busca */}
      <div style={styles.searchWrap}>
        <input
          type="text"
          placeholder="Pesquisar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Abas */}
      {renderTabs}

      {/* Conteúdo */}
      <section style={styles.contentArea}>
        {activeTab === "posts" && renderGridPosts}
        {activeTab === "reels" && renderGridReels}
        {activeTab === "accounts" && renderAccounts}
      </section>

      {/* Modal de Post completo */}
      {postModal.open && (
        <div style={styles.modalBack} onClick={() => setPostModal({ open: false, post: null })}>
          <div style={styles.modalBody} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span>Post</span>
              <button
                onClick={() => setPostModal({ open: false, post: null })}
                style={styles.closeBtn}
                aria-label="Fechar modal"
              >
                ✕
              </button>
            </div>
            <div style={styles.modalContent}>
              {Post ? (
                <Post post={postModal.post} currentUser={currentUser} />
              ) : (
                <div style={{ color: "#fff" }}>
                  <p>Componente &lt;Post /&gt; não encontrado. Importe para exibir o post completo.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================= Mock Data ========================= */

function getMockExploreData() {
  const demoImgs = [
    "https://picsum.photos/id/1015/800/1200",
    "https://picsum.photos/id/1016/800/1200",
    "https://picsum.photos/id/1020/800/1200",
    "https://picsum.photos/id/1025/800/1200",
    "https://picsum.photos/id/1035/800/1200",
    "https://picsum.photos/id/1041/800/1200",
    "https://picsum.photos/id/1050/800/1200",
    "https://picsum.photos/id/1062/800/1200",
  ];
  const demoVideos = [
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  ];

  const posts = Array.from({ length: 21 }).map((_, i) => {
    const isVideo = i % 5 === 0;
    return {
      id: i + 1,
      type: isVideo ? "video" : "image",
      src: isVideo ? demoVideos[i % demoVideos.length] : demoImgs[i % demoImgs.length],
      title: isVideo ? `Vídeo ${i + 1}` : `Foto ${i + 1}`,
      tags: ["#demo", "#explore"],
      likes: Math.floor(Math.random() * 900) + 100,
      comments: Math.floor(Math.random() * 120),
      author: { id: 100 + i, username: `user${i}`, fullName: `Usuário ${i}` },
    };
  });

  const reels = Array.from({ length: 18 }).map((_, i) => ({
    id: i + 100,
    src: demoVideos[i % demoVideos.length],
    title: `Reel ${i + 1}`,
    tags: ["#reels", "#fun"],
    author: { id: 200 + i, username: `reeler${i}`, fullName: `Reeler ${i}` },
  }));

  const accounts = Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1000,
    avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
    fullName: `Usuario Teste ${i + 1}`,
    username: `@usuarioteste${i + 1}`,
    bio: "Bio de demonstração",
    following: i % 3 === 0,
    askUnfollow: false,
  }));

  return { posts, reels, accounts };
}

/* ========================= UI Helpers ========================= */

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.tabBtn,
        background: active ? "#171717" : "transparent",
        borderColor: active ? "#262626" : "#1f2937",
        color: active ? "#fff" : "#d1d5db",
      }}
    >
      {children}
    </button>
  );
}

/* ========================= CSS do Mosaico 3 Colunas (IG-like) ========================= */

const igMosaicCSS = `
.ig-grid {
  --cell-size: clamp(110px, 18vw, 260px); /* tamanho base da linha */
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: var(--cell-size);
  gap: 2px; /* micro gap como no IG */
}

/* item base 1x1; variações usando spans */
.ig-item { position: relative; }
.ig-item.big  { grid-column: span 2; grid-row: span 2; }
.ig-item.wide { grid-column: span 2; grid-row: span 1; }
.ig-item.tall { grid-column: span 1; grid-row: span 2; }

.ig-button {
  position: relative;
  width: 100%;
  height: 100%;
  border: 0;
  padding: 0;
  margin: 0;
  background: transparent;
  cursor: pointer;
  overflow: hidden;
}

.ig-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.ig-overlay {
  position: absolute;
  left: 6px;
  bottom: 6px;
  display: inline-flex;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(0,0,0,0.35);
  color: #fff;
  font-size: 12px;
  backdrop-filter: blur(2px);
}
`;

/* ========================= Estilos gerais ========================= */

const styles = {
  container: {
    height: "100%",
    width: "100%",
    background: "#0a0a0a",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  searchWrap: {
    padding: "10px 12px",
    borderBottom: "1px solid #1f2937",
  },
  searchInput: {
    width: "100%",
    height: 40,
    borderRadius: 10,
    border: "1px solid #374151",
    background: "#111827",
    color: "#fff",
    padding: "0 12px",
    outline: "none",
  },
  tabs: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
    padding: 8,
    borderBottom: "1px solid #1f2937",
  },
  tabBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid",
    cursor: "pointer",
    fontWeight: 600,
  },
  contentArea: {
    flex: 1,
    overflow: "auto",
    padding: 8,
  },
  accountsWrap: {
    height: "100%",
    width: "100%",
    overflow: "hidden",
  },
  accountsList: {
    height: "100%",
    overflowY: "auto",
    padding: 8,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  accountRow: {
    display: "grid",
    gridTemplateColumns: "56px 1fr auto",
    alignItems: "center",
    gap: 10,
    background: "#0f0f0f",
    border: "1px solid #1f2937",
    borderRadius: 14,
    padding: 8,
  },
  avatarBtn: {
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    objectFit: "cover",
  },
  accountInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    overflow: "hidden",
  },
  nameBtn: {
    textAlign: "left",
    color: "#fff",
    fontWeight: 700,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  usernameBtn: {
    textAlign: "left",
    color: "#9ca3af",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
    fontSize: 14,
  },
  followBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 700,
  },
  followingBtn: {
    background: "#1f2937",
    color: "#fff",
    border: "1px solid #374151",
    padding: "8px 12px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 700,
  },
  unfollowMenu: {
    position: "absolute",
    right: 0,
    top: "110%",
    background: "#0b0b0b",
    border: "1px solid #27272a",
    borderRadius: 12,
    padding: 6,
    zIndex: 20,
  },
  unfollowDanger: {
    background: "#7f1d1d",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
  modalBack: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  modalBody: {
    width: "min(900px, 96vw)",
    maxHeight: "90vh",
    background: "#0b0b0b",
    border: "1px solid #27272a",
    borderRadius: 14,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    padding: "10px 12px",
    borderBottom: "1px solid #27272a",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: 700,
  },
  modalContent: {
    padding: 10,
    overflowY: "auto",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: 20,
    cursor: "pointer",
  },
};
