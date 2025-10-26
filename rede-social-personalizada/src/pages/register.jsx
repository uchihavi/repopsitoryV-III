import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerApi } from '../utils/api'
import demoVideo from '../assets/video/demo.mp4'
import postsImage from '../assets/image/posts.png'
import BeeLogo from '../assets/image/beeLogo.png'

export default function Register(){
  const [form, setForm] = useState({ name:'', last_name:'', email:'', password:'', dob:'', gender:'Other' })
  const [ok, setOk] = useState('')
  const [err, setErr] = useState('')
  const [dobError, setDobError] = useState('')
  const nav = useNavigate()

  function setField(k, v) {
    setForm(prev => ({ ...prev, [k]: v }))
    if (k === 'dob') {
      validateDateOfBirth(v)
    }
  }

  // Validate date of birth
  function validateDateOfBirth(dob) {
    setDobError('')
    
    // Regex for DD/MM/YYYY format
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
    if (!dateRegex.test(dob)) {
      setDobError('Please enter a valid date in DD/MM/YYYY format.')
      return false
    }

    // Parse date components
    const [, day, month, year] = dob.match(dateRegex)
    const dayNum = parseInt(day, 10)
    const monthNum = parseInt(month, 10)
    const yearNum = parseInt(year, 10)

    // Check valid month
    if (monthNum < 1 || monthNum > 12) {
      setDobError('Month must be between 01 and 12.')
      return false
    }

    // Check valid day
    const daysInMonth = [31, (isLeapYear(yearNum) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if (dayNum < 1 || dayNum > daysInMonth[monthNum - 1]) {
      setDobError('Invalid day for the given month.')
      return false
    }

    // Check if date is in the future
    const inputDate = new Date(yearNum, monthNum - 1, dayNum)
    const today = new Date()
    if (inputDate > today) {
      setDobError('Date of birth cannot be in the future.')
      return false
    }

    // Check minimum age (13 years)
    const minAgeDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate())
    if (inputDate > minAgeDate) {
      setDobError('You must be at least 13 years old.')
      return false
    }

    return true
  }

  // Check if year is a leap year
  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
  }

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    setOk('')
    
    // Validate date before submission
    if (!validateDateOfBirth(form.dob)) {
      setErr('Please fix the date of birth error.')
      return
    }

    const payload = { ...form, dob: normalizeDob(form.dob) }

    try {
      const res = await registerApi(payload)
      if (res?.success) {
        setOk('Conta criada com sucesso.')
        setTimeout(() => nav('/login'), 800)
      } else {
        setErr(res?.message || 'Falha ao criar conta.')
      }
    } catch (error) {
      setErr(error?.data?.message || error.message || 'Falha ao criar conta.')
    }
  }

  return (
    <div
      className="register-root"
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
      {/* CSS responsivo (apenas estilo) */}
      <style>{`
        .bg-split { position: fixed; inset: 0; display: flex; z-index: 0; }
        .bg-left  { width: 60%; height: 100%; }
        .bg-right { width: 40%; height: 100%; background-size: cover; background-position: center; background-repeat: no-repeat; }

        .overlay-gradient-desktop {
          position: fixed; inset: 0;
          background: linear-gradient(to right, rgba(0, 114, 255, 0.5) 0%, rgba(255, 255, 255, 0.8) 45%, rgb(255, 255, 255) 60%, rgba(0, 198, 255, 0.5) 70%, rgba(0, 198, 255, 0.5) 100%);
          display: none;
        }

        .overlay-gradient-mobile {
          position: fixed; inset: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.70), rgba(0,0,0,0.30));
          display: block;
        }

        .dark-veil { position: fixed; inset: 0; background: rgba(0,0,0,0.40); }

        .register-card {
          background: linear-gradient(to bottom, rgba(0, 191, 255, 1), rgba(255, 20, 147, 1));
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          padding: 28px 36px;
          width: 100%;
          max-width: 420px;
          color: #fff;
          z-index: 2;
        }

        @media (max-width: 768px) {
          .bg-left  { width: 100%; }
          .bg-right { display: none; }
          .overlay-gradient-desktop { display: none; }
          .overlay-gradient-mobile { display: block; }
          .register-root { padding: 12px !important; }
          .register-card { max-width: 94vw; padding: 22px 16px; border-radius: 10px; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        }

        @media (min-width: 769px) {
          .overlay-gradient-desktop { display: block; }
          .overlay-gradient-mobile { display: none; }
        }

        .btn-primary:hover { filter: brightness(1.03); }
        .link:hover { text-decoration: underline; }
      `}</style>

      {/* BACKGROUND: vídeo (esq) + imagem (dir) */}
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
        <div
          className="bg-right"
          style={{ backgroundImage:`url(${postsImage})` }}
        />
      </div>

      <div className="overlay-gradient-mobile" />
      <div className="overlay-gradient-desktop" />
      <div className="dark-veil" />

      {/* CARD */}
      <div className="register-card">
        <div style={{ width:'100%', marginBottom:12 }}>
          <img
            src={BeeLogo}
            alt="Logo da abelha"
            style={{ width:'100%', height:'auto', borderRadius:8, objectFit:'cover' }}
          />
        </div>

        <p style={{ textAlign:'center', margin:'6px 0 10px', color:'#fff' }}>Bee Yourself</p>
        <h2 style={{ fontSize:24, fontWeight:'bold', margin:'0 0 14px', textAlign:'center' }}>Criar Conta</h2>

        {ok && <div style={{ color:'#10b981', marginBottom:8 }}>{ok}</div>}
        {err && <div style={{ color:'#ef4444', marginBottom:8 }}>{err}</div>}
        {dobError && <div style={{ color:'#ef4444', marginBottom:8 }}>{dobError}</div>}

        <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }} className="grid-2">
            <input
              placeholder="Name"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              required
              style={inputStyle}
            />
            <input
              placeholder="Last Name"
              value={form.last_name}
              onChange={e => setField('last_name', e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <input
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={e => setField('email', e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setField('password', e.target.value)}
            required
            style={inputStyle}
          />

          <input
            placeholder="Date of Birth (DD/MM/YYYY)"
            value={form.dob}
            onChange={e => setField('dob', e.target.value)}
            required
            style={inputStyle}
          />

          <label htmlFor="gender">Gender</label>
          <select
            value={form.gender}
            onChange={e => setField('gender', e.target.value)}
            style={{ ...inputStyle, background:'#fff', color:'#111' }}
          >
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
          </select>

          <small style={{ color:'#e5e7eb', lineHeight:1.4 }}>
            People who use our service may have uploaded their contact information to Social Network. <span style={{ color:'#5bff46' }}>Learn more.</span>
          </small>
          <small style={{ color:'#e5e7eb', lineHeight:1.4 }}>
            By clicking Sign Up, you agree to our Terms, Privacy Policy, and Cookie Policy. You can opt out of receiving SMS notifications and unsubscribe at any time.
          </small>

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
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fbe166'; e.currentTarget.style.color = '#000' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#fff' }}
          >
            Sign up
          </button>
        </form>

        <p style={{ marginTop:12, textAlign:'center', color:'#fff', fontWeight:700 }}>
          Já tem uma conta?{' '}
          <Link to="/login" className="link" style={{ color:'#43aaff', textDecoration:'none' }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}

const inputStyle = {
  width:'100%',
  borderRadius:8,
  border:'1px solid #ccc',
  padding:'10px 12px',
  fontSize:14,
  outline:'none',
  background:'#fff',
  color:'#111'
}

function normalizeDob(dob) {
  const match = dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return dob
  const [, day, month, year] = match
  return `${year}-${month}-${day}`
}