# Segurança — Rede Social Personalizada

## Frontend
- CSP rígida no `index.html`.
- DOMPurify para sanitização de HTML.
- Sem segredos no bundle (usar `VITE_*` e `.env`).
- Sourcemaps desativados em produção.
- AuthGuard para rotas privadas.
- HTTP centralizado em `src/utils/api.js` (headers consistentes, `withCredentials` opcional, normalização de erros).

## Backend (PHP)
- JWT (curta duração + refresh) **ou** cookies HttpOnly + CSRF.
- CSRF: token enviado em `X-CSRF-Token`.
- CORS: restringir origem e permitir `credentials` se usar cookies.
- Rate limit em login e endpoints sensíveis.
- Prepared statements + validação server-side.
- Uploads: checar MIME/extensão; diretório isolado.
- Cabeçalhos: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (ou CSP), `Referrer-Policy: same-origin`.
