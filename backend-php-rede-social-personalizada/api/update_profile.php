<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_middleware.php';
$auth = require_auth();

$in = jsonInput();
$bio = trim($in['bio'] ?? '');
$location = trim($in['location'] ?? '');
$website = trim($in['website'] ?? '');

try {
  $stmt = $pdo->prepare("UPDATE users SET bio=?, location=?, website=? WHERE id=?");
  $stmt->execute([$bio,$location,$website,$auth['id']]);
  respond([ "success"=>true ]);
} catch(Exception $e){ respond([ "success"=>false, "message"=>"Erro ao atualizar perfil", "error"=>$e->getMessage() ], 500); }
?>