<?php
// MySQLサーバーのホスト名を指定します（例: localhost）。
$host = '';

// 使用するデータベース名を指定します。
$dbname = '';

// データベース接続用のユーザー名を指定します。
$username = '';

// データベース接続用のパスワードを指定します。
$password = '';

try {
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // データベース作成
    $pdo->exec("CREATE DATABASE IF NOT EXISTS $dbname");
    $pdo->exec("USE $dbname");

    // テーブル作成
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            kana_first_name VARCHAR(50) NOT NULL,
            kana_last_name VARCHAR(50) NOT NULL,
            gender ENUM('male', 'female', 'other') NOT NULL,
            birth_date DATE NOT NULL,
            phone_number VARCHAR(15),
            postal_code VARCHAR(10),
            address_prefecture VARCHAR(50),
            address_city VARCHAR(50),
            address_detail VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");

    echo json_encode(["success" => true, "message" => "データベースが初期化されました。"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "エラー: " . $e->getMessage()]);
}
?>