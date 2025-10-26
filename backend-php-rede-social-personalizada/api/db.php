<?php
// api/db.php
$DB_HOST = getenv('DB_HOST') ?: '127.0.0.1';
$DB_NAME = getenv('DB_NAME') ?: 'rede_social';
$DB_USER = getenv('DB_USER') ?: 'root';
$DB_PASS = getenv('DB_PASS') ?: '';
$DB_DSN  = getenv('DB_DSN');

try {
if ($DB_DSN) {
    $pdo = new PDO($DB_DSN, $DB_USER, $DB_PASS, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
  } else {
    $pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4", $DB_USER, $DB_PASS, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
  }
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([ "success" => false, "message" => "DB connection failed", "error" => $e->getMessage() ]);
  exit;
}

initialize_database($pdo);


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


function initialize_database(PDO $pdo){
  static $ran = false;
  if ($ran) return;
  $ran = true;

  $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
  if ($driver === 'mysql') {
    initialize_mysql_schema($pdo);
  } elseif ($driver === 'sqlite') {
    initialize_sqlite_schema($pdo);
  }
}

function initialize_mysql_schema(PDO $pdo){
  $tableSql = [
    "CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(80) NOT NULL,
      last_name VARCHAR(80) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      dob DATE NULL,
      gender VARCHAR(20) DEFAULT 'Other',
      bio VARCHAR(280) DEFAULT NULL,
      location VARCHAR(120) DEFAULT NULL,
      website VARCHAR(200) DEFAULT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS password_resets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token VARCHAR(64) NOT NULL,
      created_at DATETIME NOT NULL,
      used_at DATETIME NULL,
      INDEX(user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )",
    "CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      content TEXT,
      privacy ENUM('public','following','private') DEFAULT 'public',
      location_label VARCHAR(120) DEFAULT NULL,
      created_at DATETIME NOT NULL,
      INDEX(user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )",
    "CREATE TABLE IF NOT EXISTS media (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      file_name VARCHAR(200) NOT NULL,
      created_at DATETIME NOT NULL,
      INDEX(post_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )",
    "CREATE TABLE IF NOT EXISTS post_likes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      user_id INT NOT NULL,
      created_at DATETIME NOT NULL,
      UNIQUE KEY uniq_like (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )",
    "CREATE TABLE IF NOT EXISTS comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      user_id INT NOT NULL,
      content TEXT NOT NULL,
      parent_id INT NULL,
      created_at DATETIME NOT NULL,
      INDEX(post_id),
      INDEX(parent_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )",
    "CREATE TABLE IF NOT EXISTS follows (
      id INT AUTO_INCREMENT PRIMARY KEY,
      follower_id INT NOT NULL,
      following_id INT NOT NULL,
      created_at DATETIME NOT NULL,
      UNIQUE KEY uniq_follow (follower_id, following_id),
      FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
    )",
    "CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      type VARCHAR(60) NOT NULL,
      payload JSON DEFAULT NULL,
      is_read TINYINT(1) DEFAULT 0,
      created_at DATETIME NOT NULL,
      INDEX(user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )"
  ];

  foreach ($tableSql as $sql) {
    $pdo->exec($sql);
  }

  ensure_mysql_columns($pdo);
}

function ensure_mysql_columns(PDO $pdo){
  if (!column_exists($pdo, 'users', 'password_hash')) {
    $pdo->exec("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL AFTER email");
    if (column_exists($pdo, 'users', 'password')) {
      $pdo->exec("UPDATE users SET password_hash = password WHERE password_hash IS NULL AND password IS NOT NULL");
    }
    $pdo->exec("ALTER TABLE users MODIFY password_hash VARCHAR(255) NOT NULL");
  }

  if (!column_exists($pdo, 'users', 'dob')) {
    $pdo->exec("ALTER TABLE users ADD COLUMN dob DATE NULL AFTER password_hash");
  }
  if (!column_exists($pdo, 'users', 'gender')) {
    $pdo->exec("ALTER TABLE users ADD COLUMN gender VARCHAR(20) DEFAULT 'Other' AFTER dob");
  }
  if (!column_exists($pdo, 'users', 'bio')) {
    $pdo->exec("ALTER TABLE users ADD COLUMN bio VARCHAR(280) DEFAULT NULL AFTER gender");
  }
  if (!column_exists($pdo, 'users', 'location')) {
    $pdo->exec("ALTER TABLE users ADD COLUMN location VARCHAR(120) DEFAULT NULL AFTER bio");
  }
  if (!column_exists($pdo, 'users', 'website')) {
    $pdo->exec("ALTER TABLE users ADD COLUMN website VARCHAR(200) DEFAULT NULL AFTER location");
  }
  if (!column_exists($pdo, 'users', 'created_at')) {
    $pdo->exec("ALTER TABLE users ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER website");
  }
}

function initialize_sqlite_schema(PDO $pdo){
  $pdo->exec("CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    dob TEXT NULL,
    gender TEXT DEFAULT 'Other',
    bio TEXT DEFAULT NULL,
    location TEXT DEFAULT NULL,
    website TEXT DEFAULT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )");

  $pdo->exec("CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    created_at TEXT NOT NULL,
    used_at TEXT NULL
  )");

  $pdo->exec("CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT,
    privacy TEXT DEFAULT 'public',
    location_label TEXT DEFAULT NULL,
    created_at TEXT NOT NULL
  )");

  $pdo->exec("CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    created_at TEXT NOT NULL
  )");

  $pdo->exec("CREATE TABLE IF NOT EXISTS post_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(post_id, user_id)
  )");

  $pdo->exec("CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    parent_id INTEGER NULL,
    created_at TEXT NOT NULL
  )");

  $pdo->exec("CREATE TABLE IF NOT EXISTS follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(follower_id, following_id)
  )");

  $pdo->exec("CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    payload TEXT DEFAULT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  )");
}

function column_exists(PDO $pdo, $table, $column){
  $stmt = $pdo->prepare("SHOW COLUMNS FROM `$table` LIKE ?");
  try {
    $stmt->execute([$column]);
    return (bool) $stmt->fetch();
  } catch (Exception $e) {
    return false;
  }
}
?>