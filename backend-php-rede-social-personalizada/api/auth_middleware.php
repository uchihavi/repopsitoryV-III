<?php
// api/auth_middleware.php
require_once __DIR__ . '/jwt.php';

function require_auth(){
  $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if (!preg_match('/Bearer\s+(.+)/i', $hdr, $m)){
    http_response_code(401);
    echo json_encode([ "success"=>false, "message"=>"Missing bearer token" ]);
    exit;
  }
  $payload = jwt_verify($m[1]);
  if (!$payload){
    http_response_code(401);
    echo json_encode([ "success"=>false, "message"=>"Invalid or expired token" ]);
    exit;
  }
  return $payload; // expected: [id, email, name, ...]
}
?>