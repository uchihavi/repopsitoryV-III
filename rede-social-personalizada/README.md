# Rede Social Personalizada — Atualizações (Seções 2–4)

Inclui:
- `src/utils/api.js`
- `src/guards/AuthGuard.jsx`
- `src/utils/sanitize.js`
- `src/hooks/useAuth.js`
- `src/App.jsx`
- `index.html`
- `.env.example`, `.eslintrc.json`, `.prettierrc`, `.editorconfig`, `SECURITY.md`

## Uso
1. Copie os arquivos deste pacote para o seu projeto (mantendo as pastas).
2. `cp .env.example .env` e ajuste `VITE_API_BASE` (ex.: `http://localhost:8000/api`).
3. Instale: `npm i dompurify`
4. Ajuste os endpoints de `src/utils/api.js` conforme suas rotas PHP.
5. Confirme que existem as páginas:
   - `src/pages/login.jsx`
   - `src/pages/register.jsx`
   - `src/pages/reset-password.jsx`
   - `src/pages/homepage.jsx`
6. `npm run dev`

### Fluxos de Auth
- **JWT localStorage**: salve o token com `setToken(res.token)` após o login.
- **Cookies HttpOnly**: use `withCredentials: true` e envie `csrfToken` no header `X-CSRF-Token`.
