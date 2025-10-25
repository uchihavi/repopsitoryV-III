<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_middleware.php';
$auth = require_auth();

$user_id = intval($_GET['id'] ?? $auth['id']);
try{
  $stmt = $pdo->prepare("
    SELECT u.id, u.name, u.last_name, u.email, u.bio, u.location, u.website, u.created_at,
      (SELECT COUNT(*) FROM follows f WHERE f.following_id = u.id) as followers,
      (SELECT COUNT(*) FROM follows f WHERE f.follower_id = u.id) as following
    FROM users u WHERE u.id = ?
  ");
  $stmt->execute([$user_id]);
  $u = $stmt->fetch();
  if(!$u) respond([ "success"=>false, "message"=>"Usuário não encontrado" ], 404);
  respond([ "success"=>true, "data"=>$u ]);
} catch(Exception $e){ respond([ "success"=>false, "message"=>"Erro ao carregar perfil", "error"=>$e->getMessage() ], 500); }
?>