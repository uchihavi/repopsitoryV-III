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

  $hash = $u['password_hash'] ?? null;
  if (!$hash) {
    try {
      $legacyStmt = $pdo->prepare("SELECT id, name, last_name, email, password FROM users WHERE email = ? LIMIT 1");
      $legacyStmt->execute([$email]);
      $legacy = $legacyStmt->fetch();
      if ($legacy && isset($legacy['password']) && $legacy['password']) {
        $hash = $legacy['password'];
        $u = array_merge($u ?: [], $legacy);
        $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?")->execute([$hash, $legacy['id']]);
      }
    } catch (Exception $legacyError) {
      // Ignore legacy column errors; we'll handle invalid credentials below.
    }
  }

  if (!$u || !$hash || !password_verify($pwd, $hash)){
    respond([ "success"=>false, "message"=>"Credenciais inválidas" ], 401);
  }
  $token = jwt_sign([ "id"=>$u['id'], "email"=>$u['email'], "name"=>$u['name'], "last_name"=>$u['last_name'] ]);
  respond([
    "success"=>true,
    "token"=>$token,
    "user"=>[
      "id"=>$u['id'],
      "name"=>$u['name'],
      "last_name"=>$u['last_name'],
      "email"=>$u['email']
    ]
  ]);
} catch(Exception $e){
  respond([ "success"=>false, "message"=>"Erro no login", "error"=>$e->getMessage() ], 500);
}
?>