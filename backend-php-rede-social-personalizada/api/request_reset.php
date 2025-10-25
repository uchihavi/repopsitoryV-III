<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';

$in = jsonInput();
required($in, ['email']);
$email = strtolower(trim($in['email']));

try {
  $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
  $stmt->execute([$email]);
  $u = $stmt->fetch();
  if ($u){
    $token = bin2hex(random_bytes(24));
    $pdo->prepare("INSERT INTO password_resets (user_id, token, created_at) VALUES (?, ?, NOW())")->execute([$u['id'],$token]);
    // Em produção, enviar e-mail com link contendo $token
  }
  respond([ "success"=>true, "message"=>"Se existir, enviaremos instruções de reset." ]);
} catch(Exception $e){
  respond([ "success"=>false, "message"=>"Erro ao solicitar reset", "error"=>$e->getMessage() ], 500);
}
?>