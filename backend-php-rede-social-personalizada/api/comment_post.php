<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_middleware.php';
$auth = require_auth();
$in = jsonInput();
required($in, ['post_id','content']);
$post_id = intval($in['post_id']);
$content = trim($in['content']);
$parent_id = isset($in['parent_id']) ? intval($in['parent_id']) : null;

try {
  $stmt = $pdo->prepare("INSERT INTO comments (post_id, user_id, content, parent_id, created_at) VALUES (?,?,?,?,NOW())");
  $stmt->execute([$post_id,$auth['id'],$content,$parent_id]);
  respond([ "success"=>true ]);
} catch(Exception $e){ respond([ "success"=>false, "message"=>"Erro ao comentar", "error"=>$e->getMessage() ], 500); }
?>