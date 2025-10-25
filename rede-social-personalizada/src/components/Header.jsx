// src/components/Header.jsx
import React, { useState } from 'react'; // <<=== IMPORT NECESSÁRIO
// se você estiver no runtime automático do Vite, o "React" pode não ser obrigatório,
// mas o { useState } sempre precisa ser importado.

export default function Header({ onSearch }) {
  const [q, setQ] = useState('');

  const submit = (e) => {
    e.preventDefault();
    onSearch?.(q);
  };

  return (
    <header style={{ display:'flex', alignItems:'center', padding:'8px 12px', borderBottom:'1px solid #e5e7eb' }}>
      {/* ... seus elementos de header (logo, etc.) ... */}
      <form onSubmit={submit} style={{ marginLeft:'auto', width:'min(480px, 60%)' }}>
        <input
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          placeholder="Pesquisar..."
          style={{
            width:'100%', height:36, borderRadius:8, border:'1px solid #d1d5db',
            padding:'0 10px', outline:'none'
          }}
        />
      </form>
    </header>
  );
}
