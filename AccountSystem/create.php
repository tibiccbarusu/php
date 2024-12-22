<?php
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'];
    $username = $_POST['username'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
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

    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetchColumn() > 0) {
            echo "アカウント名が既に使用されています。";
            exit;
        }

        $stmt = $pdo->prepare("
            INSERT INTO users (email, username, password, first_name, last_name, kana_first_name, kana_last_name, gender, birth_date, phone_number, postal_code, address_prefecture, address_city, address_detail)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$email, $username, $password, $firstName, $lastName, $kanaFirstName, $kanaLastName, $gender, $birthDate, $phone, $postalCode, $prefecture, $city, $addressDetail]);

        header("Location: success.php");
        exit;
    } catch (PDOException $e) {
        echo "エラー: " . $e->getMessage();
    }
}
?>