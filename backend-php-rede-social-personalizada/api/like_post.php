<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_middleware.php';
$auth = require_auth();
$in = jsonInput();
$id = intval($in['id'] ?? 0);
if ($id<=0) respond([ "success"=>false, "message"=>"ID inválido" ], 400);

try {
  // toggle like
  $pdo->prepare("DELETE FROM post_likes WHERE post_id = ? AND user_id = ?")->execute([$id,$auth['id']]);
  $pdo->prepare("INSERT INTO post_likes (post_id, user_id, created_at) VALUES (?,?,NOW())")->execute([$id,$auth['id']]);
  respond([ "success"=>true ]);
} catch(Exception $e){ respond([ "success"=>false, "message"=>"Erro ao curtir", "error"=>$e->getMessage() ], 500); }
?>