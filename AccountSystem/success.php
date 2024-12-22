<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: index.html");
    exit;
}
?>

<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ログイン成功</title>
    <link rel="stylesheet" href="success.css">
</head>
<body>
    <div class="container">
        <h1>ログイン成功</h1>
        <p>ようこそ、<?php echo htmlspecialchars($_SESSION['username']); ?>さん！</p>
        <button id="logoutButton">ログアウト</button>
        <button id="settingsButton">アカウント設定</button>
    </div>
    <script src="success.js"></script>
</body>
</html>