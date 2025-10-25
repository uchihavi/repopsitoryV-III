<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';

$in = jsonInput();
required($in, ['name','last_name','email','password','dob']);

$name = trim($in['name']);
$last_name = trim($in['last_name']);
$email = strtolower(trim($in['email']));
$pwd = $in['password'];
$dob = $in['dob'];
$gender = $in['gender'] ?? 'Other';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) respond([ "success"=>false, "message"=>"E-mail inválido" ], 400);
if (strlen($pwd) < 6) respond([ "success"=>false, "message"=>"Senha muito curta" ], 400);

// Age >= 13
$dob_ts = strtotime($dob);
if ($dob_ts === false) respond([ "success"=>false, "message"=>"Data inválida" ], 400);
$age = (int) floor((time() - $dob_ts) / (365.25*24*3600));
if ($age < 13) respond([ "success"=>false, "message"=>"Idade mínima 13 anos" ], 400);

try {
  $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
  $stmt->execute([$email]);
  if ($stmt->fetch()) respond([ "success"=>false, "message"=>"E-mail já registrado" ], 409);

  $hash = password_hash($pwd, PASSWORD_DEFAULT);
  $stmt = $pdo->prepare("INSERT INTO users (name,last_name,email,password_hash,dob,gender,created_at) VALUES (?,?,?,?,?,?,NOW())");
  $stmt->execute([$name,$last_name,$email,$hash,date('Y-m-d', $dob_ts),$gender]);

  respond([ "success"=>true, "message"=>"Conta criada com sucesso" ]);
} catch(Exception $e){
  respond([ "success"=>false, "message"=>"Erro ao registrar", "error"=>$e->getMessage() ], 500);
}
?>