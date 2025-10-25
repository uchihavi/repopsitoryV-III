// src/components/SuggestedProfiles.jsx
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Props opcionais:
 * - fetchProfiles?: () => Promise<Array<{id:number|string, name:string, avatar?:string}>>
 *     → Passe uma função que busque no seu backend. Se não vier, usa mocks locais.
 * - refreshMs?: number  (padrão: 1 hora = 3_600_000 ms)
 * - onFollow?: (user) => void
 */
export default function SuggestedProfiles({
  fetchProfiles,
  refreshMs = 3_600_000, // 1 hora
  onFollow,
}) {
  const defaultSuggestions = useMemo(
    () => [
      { id: 1, name: "Ana Souza", avatar: `https://i.pravatar.cc/120?img=11` },
      { id: 2, name: "Carlos Lima", avatar: `https://i.pravatar.cc/120?img=22` },
      { id: 3, name: "Beatriz Alves", avatar: `https://i.pravatar.cc/120?img=33` },
      { id: 4, name: "Marcos Pereira", avatar: `https://i.pravatar.cc/120?img=44` },
      { id: 5, name: "Julia Santos", avatar: `https://i.pravatar.cc/120?img=55` },
      { id: 6, name: "Rafael Costa", avatar: `https://i.pravatar.cc/120?img=66` },
      { id: 7, name: "Paula Fernandes", avatar: `https://i.pravatar.cc/120?img=77` },
      { id: 8, name: "Luiza Ramos", avatar: `https://i.pravatar.cc/120?img=12` },
    ],
    []
  );

  const [profiles, setProfiles] = useState(defaultSuggestions);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const timerRef = useRef(null);

  // Fisher–Yates shuffle (não muta o array original)
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Carrega perfis (backend futuro ou mocks)
  const load = async () => {
    try {
      setLoading(true);
      setErr(null);

      if (typeof fetchProfiles === "function") {
        const data = await fetchProfiles();
        if (Array.isArray(data) && data.length) {
          setProfiles(shuffle(data));
        } else {
          setProfiles(shuffle(defaultSuggestions));
        }
      } else {
        // fallback: mocks locais
        setProfiles(shuffle(defaultSuggestions));
      }
    } catch (e) {
      setErr("Falha ao carregar sugestões.");
      setProfiles(shuffle(defaultSuggestions));
    } finally {
      setLoading(false);
    }
  };

  // Monta: carrega + agenda embaralhamento periódico
  useEffect(() => {
    load();
    // embaralhar periodicamente
    timerRef.current = setInterval(() => {
      setProfiles((prev) => shuffle(prev));
    }, refreshMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshMs]);

  return (
    <div
      className="card"
      style={{
        height: "30vh",              // 1) ocupa 30% do viewport height
        display: "flex",
        flexDirection: "column",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Cabeçalho */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0px 12px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <h3 style={{ margin: 0, fontSize: 14 }}>Sugestões para seguir</h3>

        {/* Botão para forçar reload manual (útil em dev) */}
        <button className="nav-btn" style={{ maxWidth: 140 }} onClick={load}>
          Atualizar
        </button>
      </div>

      {/* Lista rolável */}
      <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
        {loading && (
          <div style={{ fontSize: 13, color: "#6b7280", padding: "6px 4px" }}>
            Carregando sugestões...
          </div>
        )}
        {err && (
          <div style={{ fontSize: 13, color: "#ef4444", padding: "6px 4px" }}>{err}</div>
        )}

        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {profiles.map((s) => (
            <li
              key={s.id}
              style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr auto",
                alignItems: "center",
                gap: 10,
                padding: "8px 6px",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <img
                src={s.avatar || `https://i.pravatar.cc/120?u=${s.id}`}
                alt={s.name}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.name}
              </span>
              <button
                className="nav-btn"
                style={{ maxWidth: 120 }}
                onClick={() => onFollow?.(s)}
              >
                Seguir
              </button>
            </li>
          ))}
        </ul>
      </div>

      
    </div>
  );
}
