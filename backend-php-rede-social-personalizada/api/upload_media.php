<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/auth_middleware.php';
$auth = require_auth();

if (!isset($_FILES['file'])){
  http_response_code(400);
  echo json_encode([ "success"=>false, "message"=>"Arquivo não enviado" ]);
  exit;
}
$ext = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
if (!in_array($ext, ['jpg','jpeg','png','gif','mp4','webm'])){
  http_response_code(400);
  echo json_encode([ "success"=>false, "message"=>"Extensão não permitida" ]);
  exit;
}

$fname = uniqid('u_').'.'.$ext;
$dest = __DIR__ . '/../uploads/'.$fname;
if (move_uploaded_file($_FILES['file']['tmp_name'], $dest)){
  echo json_encode([ "success"=>true, "file"=>$fname, "url"=>"/uploads/".$fname ]);
} else {
  http_response_code(500);
  echo json_encode([ "success"=>false, "message"=>"Falha no upload" ]);
}
?>