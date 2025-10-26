<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_middleware.php';
header("Content-Security-Policy: default-src 'self'; frame-ancestors 'self' http://localhost:5173/");

$auth = require_auth();
$in = jsonInput();

$page = max(1, intval($in['page'] ?? 1));
$limit = max(1, min(50, intval($in['limit'] ?? 10)));
$offset = ($page - 1) * $limit;

try {
  $stmt = $pdo->prepare("
    SELECT p.id, p.user_id, p.content, p.privacy, p.location_label, p.created_at,
           u.name, u.last_name,
           (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS like_count,
           (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
    FROM posts p
    JOIN users u ON u.id = p.user_id
    ORDER BY p.created_at DESC
    LIMIT :lim OFFSET :off
  ");
  $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
  $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
  $stmt->execute();
  $rows = $stmt->fetchAll();
  respond([ "success"=>true, "data"=>$rows, "page"=>$page, "limit"=>$limit ]);
} catch(Exception $e){
  respond([ "success"=>false, "message"=>"Erro ao carregar feed", "error"=>$e->getMessage() ], 500);
}
?>