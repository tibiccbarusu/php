<?php
session_start();
include 'db.php';

// ログイン状態を確認
if (!isset($_SESSION['user_id'])) {
    header("Location: index.html");
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (isset($_POST['delete_account'])) {
            // アカウント削除処理
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$user_id]);
            session_unset();
            session_destroy();
            echo "<script>alert('アカウントが削除されました。'); window.location.href = 'index.html';</script>";
            exit;
        } else {
            // アカウント情報更新処理
            $email = $_POST['email'];
            $username = $_POST['username'];
            $password = !empty($_POST['password']) ? password_hash($_POST['password'], PASSWORD_DEFAULT) : null;
            $lastName = $_POST['lastName'];
            $firstName = $_POST['firstName'];
            $kanaLastName = $_POST['kanaLastName'];
            $kanaFirstName = $_POST['kanaFirstName'];
            $gender = $_POST['gender'];
            $birthDate = $_POST['birthDate'];
            $phone = $_POST['phone'];
            $postalCode = $_POST['postalCode'];
            $prefecture = $_POST['prefecture'];
            $city = $_POST['city'];
            $addressDetail = $_POST['addressDetail'];

            // ユーザー名重複チェック
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ? AND id != ?");
            $stmt->execute([$username, $user_id]);
            if ($stmt->fetchColumn() > 0) {
                echo "<script>alert('アカウント名が既に使用されています。');</script>";
            } else {
                $query = "UPDATE users SET email = ?, username = ?, last_name = ?, first_name = ?, kana_last_name = ?, kana_first_name = ?, gender = ?, birth_date = ?, phone_number = ?, postal_code = ?, address_prefecture = ?, address_city = ?, address_detail = ?";
                $params = [$email, $username, $lastName, $firstName, $kanaLastName, $kanaFirstName, $gender, $birthDate, $phone, $postalCode, $prefecture, $city, $addressDetail];

                if ($password) {
                    $query .= ", password = ?";
                    $params[] = $password;
                }

                $query .= " WHERE id = ?";
                $params[] = $user_id;

                $stmt = $pdo->prepare($query);
                $stmt->execute($params);

                echo "<script>alert('アカウント情報が更新されました。');</script>";
            }
        }
    }

    // 現在のユーザー情報取得
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    echo "エラー: " . $e->getMessage();
}
?>

<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>アカウント設定</title>
    <link rel="stylesheet" href="setting.css">
</head>
<body>
    <div class="container">
        <h1>アカウント設定</h1>
        <form id="settingForm" method="POST">
            <label for="email">メールアドレス</label>
            <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($user['email']); ?>" required>

            <label for="username">アカウント名 (英数字のみ)</label>
            <input type="text" id="username" name="username" value="<?php echo htmlspecialchars($user['username']); ?>" pattern="[0-9a-zA-Z]+" required>

            <label for="password">パスワード (変更する場合のみ入力)</label>
            <input type="password" id="password" name="password" pattern="[0-9a-zA-Z]{5,}">

            <label for="confirmPassword">パスワード確認</label>
            <input type="password" id="confirmPassword">

            <label for="lastName">姓</label>
            <input type="text" id="lastName" name="lastName" value="<?php echo htmlspecialchars($user['last_name']); ?>" required>

            <label for="firstName">名</label>
            <input type="text" id="firstName" name="firstName" value="<?php echo htmlspecialchars($user['first_name']); ?>" required>

            <label for="kanaLastName">フリガナ (姓)</label>
            <input type="text" id="kanaLastName" name="kanaLastName" value="<?php echo htmlspecialchars($user['kana_last_name']); ?>" required>

            <label for="kanaFirstName">フリガナ (名)</label>
            <input type="text" id="kanaFirstName" name="kanaFirstName" value="<?php echo htmlspecialchars($user['kana_first_name']); ?>" required>

            <label for="gender">性別</label>
            <select id="gender" name="gender" required>
                <option value="male" <?php if ($user['gender'] === 'male') echo 'selected'; ?>>男性</option>
                <option value="female" <?php if ($user['gender'] === 'female') echo 'selected'; ?>>女性</option>
                <option value="other" <?php if ($user['gender'] === 'other') echo 'selected'; ?>>その他</option>
            </select>

            <label for="birthDate">生年月日</label>
            <input type="date" id="birthDate" name="birthDate" value="<?php echo $user['birth_date']; ?>" required>

            <label for="phone">電話番号</label>
            <input type="tel" id="phone" name="phone" value="<?php echo htmlspecialchars($user['phone_number']); ?>" required>

            <label for="postalCode">郵便番号</label>
            <input type="text" id="postalCode" name="postalCode" value="<?php echo htmlspecialchars($user['postal_code']); ?>" required>
            <button type="button" id="searchAddress">住所検索</button>

            <label for="prefecture">都道府県</label>
            <input type="text" id="prefecture" name="prefecture" value="<?php echo htmlspecialchars($user['address_prefecture']); ?>" required readonly>

            <label for="city">市町村</label>
            <input type="text" id="city" name="city" value="<?php echo htmlspecialchars($user['address_city']); ?>" required readonly>

            <label for="addressDetail">番地以下</label>
            <input type="text" id="addressDetail" name="addressDetail" value="<?php echo htmlspecialchars($user['address_detail']); ?>" required>

            <button type="submit">更新</button>
            <button type="submit" name="delete_account" onclick="return confirm('本当にアカウントを削除しますか？');">アカウント削除</button>
        </form>
        <button id="backToSuccess">ログイン成功ページに戻る</button>
        <p id="errorMessage"></p>
    </div>
    <script src="setting.js"></script>
</body>
</html>