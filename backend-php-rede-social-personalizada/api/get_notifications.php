<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_middleware.php';
$auth = require_auth();

try {
  $stmt = $pdo->prepare("SELECT id, type, payload, is_read, created_at FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 50");
  $stmt->execute([$auth['id']]);
  $rows = $stmt->fetchAll();
  respond([ "success"=>true, "data"=>$rows ]);
} catch(Exception $e){ respond([ "success"=>false, "message"=>"Erro ao carregar notificações", "error"=>$e->getMessage() ], 500); }
?>