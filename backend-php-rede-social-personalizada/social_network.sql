-- backend/social_network.sql
CREATE DATABASE IF NOT EXISTS rede_social CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rede_social;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  dob DATE NOT NULL,
  gender VARCHAR(20) DEFAULT 'Other',
  bio VARCHAR(280) DEFAULT NULL,
  location VARCHAR(120) DEFAULT NULL,
  website VARCHAR(200) DEFAULT NULL,
  created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(64) NOT NULL,
  created_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  INDEX(user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  content TEXT,
  privacy ENUM('public','following','private') DEFAULT 'public',
  location_label VARCHAR(120) DEFAULT NULL,
  created_at DATETIME NOT NULL,
  INDEX(user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  file_name VARCHAR(200) NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX(post_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at DATETIME NOT NULL,
  UNIQUE KEY uniq_like (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
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
);

CREATE TABLE IF NOT EXISTS follows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  follower_id INT NOT NULL,
  following_id INT NOT NULL,
  created_at DATETIME NOT NULL,
  UNIQUE KEY uniq_follow (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(60) NOT NULL,
  payload JSON DEFAULT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at DATETIME NOT NULL,
  INDEX(user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);