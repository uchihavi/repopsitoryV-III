<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';

$in = jsonInput();
required($in, ['token','password']);
$token = $in['token'];
$pwd = $in['password'];

try {
  $stmt = $pdo->prepare("SELECT pr.user_id FROM password_resets pr WHERE pr.token = ? AND pr.used_at IS NULL ORDER BY pr.id DESC LIMIT 1");
  $stmt->execute([$token]);
  $r = $stmt->fetch();
  if(!$r) respond([ "success"=>false, "message"=>"Token inválido" ], 400);
  $hash = password_hash($pwd, PASSWORD_DEFAULT);
  $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?")->execute([$hash, $r['user_id']]);
  $pdo->prepare("UPDATE password_resets SET used_at = NOW() WHERE token = ?")->execute([$token]);
  respond([ "success"=>true, "message"=>"Senha alterada" ]);
} catch(Exception $e){
  respond([ "success"=>false, "message"=>"Erro ao resetar", "error"=>$e->getMessage() ], 500);
}
?>