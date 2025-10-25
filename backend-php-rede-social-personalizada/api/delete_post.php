<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_middleware.php';
$auth = require_auth();

$in = jsonInput();
$id = intval($in['id'] ?? 0);
if ($id <= 0) respond([ "success"=>false, "message"=>"ID inválido" ], 400);

try {
  $stmt = $pdo->prepare("SELECT user_id FROM posts WHERE id = ?");
  $stmt->execute([$id]);
  $p = $stmt->fetch();
  if (!$p) respond([ "success"=>false, "message"=>"Post não encontrado" ], 404);
  if (intval($p['user_id']) !== intval($auth['id'])) respond([ "success"=>false, "message"=>"Não autorizado" ], 403);

  $pdo->prepare("DELETE FROM comments WHERE post_id = ?")->execute([$id]);
  $pdo->prepare("DELETE FROM post_likes WHERE post_id = ?")->execute([$id]);
  $pdo->prepare("DELETE FROM media WHERE post_id = ?")->execute([$id]);
  $pdo->prepare("DELETE FROM posts WHERE id = ?")->execute([$id]);

  respond([ "success"=>true, "message"=>"Post excluído" ]);
} catch(Exception $e){
  respond([ "success"=>false, "message"=>"Erro ao excluir post", "error"=>$e->getMessage() ], 500);
}
?>