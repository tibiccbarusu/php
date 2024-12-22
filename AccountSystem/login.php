<?php
session_start();
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];

    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            header("Location: success.php");
            exit;
        } else {
            $error_message = "ログイン情報が間違っています。";
        }
    } catch (PDOException $e) {
        $error_message = "エラー: " . $e->getMessage();
    }
}
?>

<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ログインエラー</title>
</head>
<body>
    <div style="text-align: center; margin-top: 50px;">
        <?php if (isset($error_message)): ?>
            <p style="color: red; font-size: 1.2em;"> <?php echo htmlspecialchars($error_message); ?> </p>
        <?php endif; ?>
        <a href="index.html">ログインページに戻る</a>
    </div>
</body>
</html>