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
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("データベース接続エラー: " . $e->getMessage());
}
?>