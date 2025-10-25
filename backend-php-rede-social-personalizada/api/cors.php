<?php
// api/cors.php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With');
  header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
  http_response_code(204);
  exit;
}
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
?>