<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';

$in = jsonInput();
required($in, ['email','password']);
$email = strtolower(trim($in['email']));
$pwd = $in['password'];

try {
  $stmt = $pdo->prepare("SELECT id, name, last_name, email, password_hash FROM users WHERE email = ? LIMIT 1");
  $stmt->execute([$email]);
  $u = $stmt->fetch();
  if (!$u || !password_verify($pwd, $u['password_hash'])){
    respond([ "success"=>false, "message"=>"Credenciais inválidas" ], 401);
  }
  $token = jwt_sign([ "id"=>$u['id'], "email"=>$u['email'], "name"=>$u['name'], "last_name"=>$u['last_name'] ]);
  respond([ "success"=>true, "token"=>$token, "user"=>[ "id"=>$u['id'], "name"=>$u['name'], "last_name"=>$u['last_name'], "email"=>$u['email'] ] ]);
} catch(Exception $e){
  respond([ "success"=>false, "message"=>"Erro no login", "error"=>$e->getMessage() ], 500);
}
?>