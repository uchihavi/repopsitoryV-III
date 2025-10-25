<?php
// api/db.php
$DB_HOST = getenv('DB_HOST') ?: '127.0.0.1';
$DB_NAME = getenv('DB_NAME') ?: 'rede_social';
$DB_USER = getenv('DB_USER') ?: 'root';
$DB_PASS = getenv('DB_PASS') ?: '';

try {
  $pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4", $DB_USER, $DB_PASS, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([ "success" => false, "message" => "DB connection failed", "error" => $e->getMessage() ]);
  exit;
}

function jsonInput() {
  $raw = file_get_contents('php://input');
  if (!$raw) return [];
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}
function respond($arr, $code=200){ http_response_code($code); echo json_encode($arr); exit; }
function required($arr, $keys){
  foreach($keys as $k){ if(!isset($arr[$k]) || $arr[$k]===''){ respond([ "success"=>false, "message"=>"Missing: $k"], 400); } }
}
?>