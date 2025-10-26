# Backend (PHP) — Rede Social Personalizada

## Requisitos
- XAMPP com Apache + MySQL
- PHP 8.0+ (PDO habilitado)

## Instalação rápida
1. Copie esta pasta `backend` para dentro do seu projeto XAMPP, por exemplo:
   - `C:\xampp\htdocs\rede-social-personalizada\backend` (Windows)
2. Crie o banco e tabelas:
   - Abra o phpMyAdmin e execute o conteúdo de `backend/social_network.sql`.
   - Os scripts PHP também verificam e criam/atualizam as tabelas essenciais (`users`, `posts`, etc.) ao conectar, corrigindo colunas ausentes como `password_hash` automaticamente.
3. Configure envs (opcional) via variáveis de ambiente ou edite `api/db.php`:
   - `DB_HOST` (padrão `127.0.0.1`)
   - `DB_NAME` (padrão `rede_social`)
   - `DB_USER` (padrão `root`)
   - `DB_PASS` (padrão vazio)
   - `DB_DSN` (opcional) para usar outro driver PDO — ex.: `sqlite:/path/social.db` para testes rápidos.
   - Ajuste `JWT_SECRET` em `api/jwt.php` para um valor forte.
4. Inicie Apache + MySQL no XAMPP.
5. **Frontend**: defina `VITE_API_BASE` ou use o proxy do `vite.config.js` apontando para `http://localhost/rede-social-personalizada/backend/api` (ou porta configurada).

## Endpoints (todos em `backend/api`)
- `POST /register.php` — `{ name, last_name, email, password, dob, gender? }`
- `POST /login.php` — `{ email, password }` → `{ token }`
- `POST /request_reset.php` — `{ email }`
- `POST /reset_password.php` — `{ token, password }`
- `POST /get_posts.php` — `{ page?, limit? }` (Auth Bearer)
- `POST /create_post.php` — `multipart/form-data` com `content`, `privacy?`, `location_label?`, `media[]` (Auth Bearer)
- `POST /delete_post.php` — `{ id }` (Auth Bearer, somente autor)
- `POST /like_post.php` — `{ id }` (Auth Bearer)
- `POST /comment_post.php` — `{ post_id, content, parent_id? }` (Auth Bearer)
- `GET  /get_profile.php?id?` — (Auth Bearer; `id` opcional)
- `POST /update_profile.php` — `{ bio?, location?, website? }` (Auth Bearer)
- `POST /follow_user.php` — `{ user_id }` (Auth Bearer)
- `POST /upload_media.php` — `multipart/form-data` com `file` (Auth Bearer)
- `GET  /get_notifications.php` — (Auth Bearer)

## Notas de compatibilidade com o frontend
- O frontend utiliza `src/utils/api.js` com base `VITE_API_BASE` (ex.: `http://localhost:8000/api` ou via proxy `/api`). Ajuste para apontar para `http://localhost/rede-social-personalizada/backend/api` caso use Apache padrão do XAMPP.
- As funções vistas no frontend (`loginApi`, `registerApi`, `getFeedApi`, `deletePostApi`, etc.) foram mapeadas para os endpoints acima.
- `CreatePost.jsx` suporta upload; utilize `multipart/form-data` conforme `create_post.php`.

## Segurança
- JWT HS256 (7 dias), ajuste `JWT_SECRET` em produção.
- Prepared statements.
- Upload com lista de extensões permitidas e limite no `.htaccess`.

## Dicas
- 401/403 geralmente indicam token ausente/expirado; verifique `Authorization: Bearer ...`.
- Se imagens não aparecem, confirme permissões da pasta `uploads/`.