<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_middleware.php';

$auth = require_auth();
$in = $_POST;
$content = trim($in['content'] ?? '');
$privacy = $in['privacy'] ?? 'public';
$location_label = $in['location_label'] ?? null;

if ($content === '' && empty($_FILES['media'])){
  respond([ "success"=>false, "message"=>"Conteúdo vazio" ], 400);
}

try {
  $stmt = $pdo->prepare("INSERT INTO posts (user_id, content, privacy, location_label, created_at) VALUES (?, ?, ?, ?, NOW())");
  $stmt->execute([$auth['id'], $content, $privacy, $location_label]);
  $post_id = $pdo->lastInsertId();

  $uploaded = [];
  if (!empty($_FILES['media'])){
    $files = $_FILES['media'];
    $count = is_array($files['name']) ? count($files['name']) : 1;
    for($i=0;$i<$count;$i++){
      $name = is_array($files['name']) ? $files['name'][$i] : $files['name'];
      $tmp = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
      $err = is_array($files['error']) ? $files['error'][$i] : $files['error'];
      if ($err === UPLOAD_ERR_OK){
        $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        if (!in_array($ext, ['jpg','jpeg','png','gif','mp4','webm'])) continue;
        $new = uniqid('m_').'.'.$ext;
        $dest = __DIR__ . '/../uploads/'.$new;
        if (move_uploaded_file($tmp, $dest)){
          $pdo->prepare("INSERT INTO media (post_id, file_name, created_at) VALUES (?, ?, NOW())")
              ->execute([$post_id, $new]);
          $uploaded[] = $new;
        }
      }
    }
  }

  respond([ "success"=>true, "id"=>$post_id, "uploaded"=>$uploaded ]);
} catch(Exception $e){
  respond([ "success"=>false, "message"=>"Erro ao criar post", "error"=>$e->getMessage() ], 500);
}
?>