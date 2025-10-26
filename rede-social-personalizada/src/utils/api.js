// src/utils/api.js
const rawBase = import.meta.env.VITE_API_BASE
const API_BASE = (rawBase && rawBase.trim() !== '' ? rawBase : '/api').replace(/\/+$/, '')

function buildUrl(path) {
  if (!path) return API_BASE
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${normalizedPath}`
}

export function getToken() {
  try { return localStorage.getItem('token') || '' } catch { return '' }
}

export function setToken(token) {
  try { token ? localStorage.setItem('token', token) : localStorage.removeItem('token') } catch {}
}

export async function request(
  path,
  { method = 'GET', body, headers = {}, withCredentials = false, csrfToken } = {}
) {
  const token = getToken()
  const res = await fetch(buildUrl(path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      ...headers
    },
    credentials: withCredentials ? 'include' : 'same-origin',
    body: body ? JSON.stringify(body) : undefined
  })

  const raw = await res.text()
  let data; try { data = raw ? JSON.parse(raw) : {} } catch { data = { message: raw } }

  if (!res.ok) {
    const err = new Error(data?.message || `HTTP ${res.status}`)
    err.status = res.status; err.data = data; throw err
  }
  return data
}

export function loginApi(email, password) {
  return request('/login.php', { method: 'POST', body: { email, password } })
}
export function registerApi(payload) {
  return request('/register.php', { method: 'POST', body: payload })
}
export function requestResetApi(email) {
  return request('/request_reset.php', { method: 'POST', body: { email } })
}
export function resetPasswordApi({ token, password }) {
  return request('/reset_password.php', { method: 'POST', body: { token, password } })
}
export function getFeedApi(params) {
  return request('/get_posts.php', { method: 'POST', body: params })
}
export function deletePostApi(id) {
  return request('/delete_post.php', { method: 'POST', body: { id } })
}
