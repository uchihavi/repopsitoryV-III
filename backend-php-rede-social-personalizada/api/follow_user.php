<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_middleware.php';
$auth = require_auth();
$in = jsonInput();
required($in, ['user_id']);
$target = intval($in['user_id']);
if ($target === intval($auth['id'])) respond([ "success"=>false, "message"=>"Não pode seguir a si mesmo" ], 400);

try{
  // toggle follow
  $pdo->prepare("DELETE FROM follows WHERE follower_id=? AND following_id=?")->execute([$auth['id'],$target]);
  $pdo->prepare("INSERT INTO follows (follower_id,following_id,created_at) VALUES (?,?,NOW())")->execute([$auth['id'],$target]);
  respond([ "success"=>true ]);
} catch(Exception $e){ respond([ "success"=>false, "message"=>"Erro ao seguir", "error"=>$e->getMessage() ], 500); }
?>