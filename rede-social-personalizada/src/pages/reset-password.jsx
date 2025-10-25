// src/pages/reset-password.jsx
import { useState } from 'react'
import { Link} from 'react-router-dom'
import { requestResetApi } from '../utils/api'
import demoVideo from '../assets/video/demo.mp4'
import postsImage from '../assets/image/posts.png'
import BeeLogo from '../assets/image/beeLogo.png'

export default function ResetPassword(){
  const [email,setEmail] = useState('')
  const [msg,setMsg] = useState('')

  async function onSubmit(e){
    e.preventDefault()
    const res = await requestResetApi(email)
    setMsg(res?.success ? 'Enviamos um link de reset para seu e-mail.' : 'Falha ao enviar link.')
  }

  return (
    <div
      className="reset-root"
      style={{
        minHeight:'100vh',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        padding:16,
        position:'relative',
        overflow:'hidden'
      }}
    >
      {/* ===== CSS (background + card layout) ===== */}
      <style>{`
        .bg-split { position: fixed; inset: 0; display: flex; z-index: 0; }
        .bg-left  { width: 60%; height: 100%; }
        .bg-right { width: 40%; height: 100%; background-size: cover; background-position: center; background-repeat: no-repeat; }

        .overlay-gradient-desktop {
          position: fixed; inset: 0; z-index: 1;
          background: linear-gradient(to right,
            rgba(0, 114, 255, 0.5) 0%,
            rgba(255, 255, 255, 0.8) 45%,
            rgb(255, 255, 255) 60%,
            rgba(0, 198, 255, 0.5) 70%,
            rgba(0, 198, 255, 0.5) 100%
          );
          display: none;
        }
        .overlay-gradient-mobile {
          position: fixed; inset: 0; z-index: 1;
          background: linear-gradient(to right, rgba(0,0,0,0.70), rgba(0,0,0,0.30));
          display: block;
        }
        .dark-veil { position: fixed; inset: 0; z-index: 1; background: rgba(0,0,0,0.40); }

        .content-layer {
          background: linear-gradient(to bottom, rgba(0, 191, 255, 1), rgba(255, 20, 147, 1));
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          padding: 32px 40px;
          width: 100%;
          max-width: 420px;
          color: #fff;
          z-index: 2;
          position: relative;
        }

        /* ===== MOBILE (≤768px) ===== */
        @media (max-width: 768px) {
          .bg-left  { width: 100%; }
          .bg-right { display: none; }
          .overlay-gradient-desktop { display: none; }
          .overlay-gradient-mobile { display: block; }
          .reset-root { padding: 12px !important; }
          .content-layer { max-width: 94vw; padding: 24px 18px; border-radius: 10px; }
        }

        /* ===== DESKTOP (>768px) ===== */
        @media (min-width: 769px) {
          .overlay-gradient-desktop { display: block; }
          .overlay-gradient-mobile { display: none; }
        }

        .btn-primary:hover { filter: brightness(1.05); }
      `}</style>

      {/* ===== BACKGROUND ===== */}
      <div className="bg-split">
        <div className="bg-left">
          <div style={{ position:'relative', width:'100%', height:'100%', overflow:'hidden' }}>
            <video
              autoPlay
              loop
              muted
              playsInline
              aria-label="Vídeo de demonstração"
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
            >
              <source src={demoVideo} type="video/mp4" />
              Seu navegador não suporta vídeos HTML5.
            </video>
          </div>
        </div>
        <div className="bg-right" style={{ backgroundImage:`url(${postsImage})` }} />
      </div>

      {/* overlays */}
      <div className="overlay-gradient-mobile" />
      <div className="overlay-gradient-desktop" />
      <div className="dark-veil" />

      {/* ===== FORM (content-layer estilizado como login-card) ===== */}
      <div className="content-layer">
        {/* Logo */}
        <div style={{ width:'100%', marginBottom:12 }}>
          <img
            src={BeeLogo}
            alt="Logo da abelha"
            style={{ width:'100%', height:'auto', borderRadius:8, objectFit:'cover' }}
          />
        </div>

        <p style={{ textAlign:'center', color:'#fff', marginBottom:10, fontSize:16 }}>
          Bee Yourself
        </p>
        <h2 style={{ fontSize:24, fontWeight:'bold', marginBottom:20, textAlign:'center', color:'#fff' }}>
          Redefinir Senha
        </h2>

        <form onSubmit={onSubmit} style={{display:'flex', flexDirection:'column', gap:12}}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            required
            style={{
              width:'100%',
              borderRadius:8,
              border:'1px solid #ccc',
              padding:'10px 12px',
              fontSize:14,
              outline:'none',
              background:'#fff',
              color:'#111'
            }}
          />
          <button
            className="btn-primary"
            type="submit"
            style={{
              width:'100%',
              padding:'10px 0',
              background:'#000',
              color:'#fff',
              fontWeight:'bold',
              border:'none',
              borderRadius:999,
              cursor:'pointer',
              transition:'0.2s ease'
            }}
            onMouseEnter={(e)=>{
              e.currentTarget.style.background='#fbe166';
              e.currentTarget.style.color='#000';
            }}
            onMouseLeave={(e)=>{
              e.currentTarget.style.background='#000';
              e.currentTarget.style.color='#fff';
            }}
          >
            Enviar link de reset
          </button>

          <div>
            <p style={{ marginTop:12, textAlign:'center', color:'#fff', fontWeight:700 }}>
              <Link to="/login" className="link" style={{ color:'#43aaff', textDecoration:'none' }}>
                Voltar ao Login
              </Link>
            </p>
          </div>
        </form>

        {msg && (
          <div style={{
            marginTop:12,
            textAlign:'center',
            color:'#fff',
            fontWeight:600,
            fontSize:14
          }}>
            {msg}
          </div>
          
        )}
        
      </div>
        
    </div>
  )
}
