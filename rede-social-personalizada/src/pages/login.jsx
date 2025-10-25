// src/pages/login.jsx
import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
//import { loginApi } from '../utils/api'
import BeeLogo from '../assets/image/beeLogo.png'
import demoVideo from '../assets/video/demo.mp4'
import postsImage from '../assets/image/posts.png'

import useAuth from '../hooks/useAuth'
import { isValidEmail } from '../utils/validators'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!isValidEmail(email)) return setError('Informe um e-mail válido.')
    if (!password) return setError('Digite sua senha.')
    setLoading(true)

    try {
      const res = await login(email, password)
      if (res?.token) {
        const from = location.state?.from?.pathname || '/home'
        nav(from, { replace: true })
      } else {
        setError(res?.message || 'Falha no login.')
      }
    } catch (err) {
      setError(err?.data?.message || err.message || 'Erro de rede.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="login-root"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* CSS responsivo (apenas estilização) */}
      <style>{`
        .bg-split { position: fixed; inset: 0; display: flex; }
        .bg-left  { width: 60%; height: 100%; }
        .bg-right { width: 40%; height: 100%; background-size: cover; background-position: center; background-repeat: no-repeat; }
        .overlay-gradient-desktop {
          position: fixed; inset: 0;
          background: linear-gradient(to right, rgba(0, 114, 255, 0.5) 0%, rgba(255, 255, 255, 0.8) 45%, rgb(255, 255, 255) 60%, rgba(0, 198, 255, 0.5) 70%, rgba(0, 198, 255, 0.5) 100%);
          display: none; /* Hidden by default */
        }
        .overlay-gradient-mobile {
          position: fixed; inset: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.70), rgba(0,0,0,0.30));
          display: block; /* Shown by default */
        }
        .dark-veil { position: fixed; inset: 0; background: rgba(0,0,0,0.40); }

        .login-card {
          background: linear-gradient(to bottom, rgba(0, 191, 255, 1), rgba(255, 20, 147, 1));
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          padding: 32px 40px;
          width: 100%;
          max-width: 420px;
          color: #fff;
          z-index: 1;
        }

        /* ====== MOBILE (≤768px) ====== */
        @media (max-width: 768px) {
          .bg-left  { width: 100%; }
          .bg-right { display: none; }
          .overlay-gradient-desktop { display: none; } /* Ensure desktop gradient is hidden */
          .overlay-gradient-mobile { display: block; } /* Show mobile gradient */
          .login-root { padding: 12px !important; }
          .login-card { max-width: 94vw; padding: 24px 18px; border-radius: 10px; }
        }

        /* ====== DESKTOP (>768px) ====== */
        @media (min-width: 769px) {
          .overlay-gradient-desktop { display: block; } /* Show desktop gradient */
          .overlay-gradient-mobile { display: none; } /* Hide mobile gradient */
        }

        /* micro-interações */
        .btn-primary:hover { filter: brightness(1.03); }
        .link:hover { text-decoration: underline; }
      `}</style>

      {/* ==== Background: vídeo e imagem ==== */}
      <div className="bg-split">
        {/* Vídeo (esquerda / 100% no mobile) */}
        <div className="bg-left">
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <video
              autoPlay
              loop
              muted
              playsInline
              aria-label="Vídeo de demonstração"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            >
              <source src={demoVideo} type="video/mp4" />
              Seu navegador não suporta vídeos HTML5.
            </video>
          </div>
        </div>

        {/* Imagem (direita / escondida no mobile) */}
        <div
          className="bg-right"
          style={{ backgroundImage: `url(${postsImage})` }}
        />
      </div>

      {/* Camadas de opacidade/gradiente */}
      <div className="overlay-gradient-mobile" />
      <div className="overlay-gradient-desktop" />
      <div className="dark-veil" />

      {/* ==== Card de login ==== */}
      <div className="login-card">
        {/* Logo */}
        <div style={{ width: '100%', marginBottom: 12 }}>
          <img
            src={BeeLogo}
            alt="Logo da abelha"
            style={{ width: '100%', height: 'auto', borderRadius: 8, objectFit: 'cover' }}
          />
        </div>

        <p style={{ textAlign: 'center', color: '#fff', marginBottom: 10, fontSize: 16 }}>
          Bee Yourself
        </p>
        <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#fff' }}>
          Entrar
        </h2>

        {error && <p style={{ color: '#ef4444', marginBottom: 8 }}>{error}</p>}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              borderRadius: 8,
              border: '1px solid #ccc',
              padding: '10px 12px',
              fontSize: 14,
              outline: 'none',
              background: '#fff',
              color: '#111',
            }}
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              borderRadius: 8,
              border: '1px solid #ccc',
              padding: '10px 12px',
              fontSize: 14,
              outline: 'none',
              background: '#fff',
              color: '#111',
            }}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '10px 0',
              backgroundColor: '#000',
              color: '#fff',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: 999,
              cursor: 'pointer',
              transition: '0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fbe166'
              e.currentTarget.style.color = '#000'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#000'
              e.currentTarget.style.color = '#fff'
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ marginTop: 8, textAlign: 'center' }}>
          <Link
            to="/reset-password"
            className="link"
            style={{ color: '#5bff46', textDecoration: 'none', fontSize: 14 }}
          >
            Esqueceu sua senha?
          </Link>
        </p>

        <p style={{ marginTop: 20, marginBottom: 10, textAlign: 'center', color: '#fff' }}>
          Não tem uma conta?{' '}
          <Link
            to="/register"
            className="link"
            style={{ color: '#43aaff', textDecoration: 'none', fontSize: 14 }}
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}