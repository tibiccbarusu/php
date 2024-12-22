<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/vendor/autoload.php'; // ComposerでインストールされたPHPMailerを読み込む

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // フォームデータを取得し、エスケープ処理
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $message = htmlspecialchars($_POST['message']);

    // PHPMailerのインスタンスを作成
    $mail = new PHPMailer(true);

    // 差出人メールアドレス
    $senderEmail = ''; // SMTPユーザー名と一致する必要があります

    //宛先人メールアドレス
    $recipientEmail = '';

    try {
        // SMTP設定
        $mail->SMTPDebug = 2; // デバッグ出力（0にすると非表示）
        $mail->Debugoutput = 'html'; // デバッグ出力形式
        $mail->isSMTP(); // SMTPモードを有効化
        $mail->Host       = ''; // SMTPサーバー
        $mail->SMTPAuth   = true; // SMTP認証を有効化
        $mail->Username   = $senderEmail; // SMTPユーザー名
        $mail->Password   = ''; // SMTPパスワード
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // 暗号化方式
        $mail->Port       = 587; // SMTPポート番号
        $mail->CharSet    = "utf-8"; // 文字コード設定
        $mail->Encoding   = "base64"; // エンコード方式

        // 差出人情報
        $mail->setFrom($senderEmail, 'お問い合わせフォーム');
        $mail->addReplyTo($email, $name); // 返信用アドレスにフォームの送信者を設定

        // 宛先情報
        $mail->addAddress($recipientEmail, 'サンプル宛先名');

        // メールの内容
        $mail->isHTML(false); // プレーンテキスト形式
        $mail->Subject = 'お問い合わせ: ' . $name; // 件名
        $mail->Body    = "名前: $name\nメールアドレス: $email\n\nメッセージ:\n$message"; // 本文

        // メール送信
        $mail->send();
        echo "<p>メールが送信されました！</p>";
    } catch (Exception $e) {
        // エラーが発生した場合の処理
        echo "<p>メール送信に失敗しました。</p>";
        echo "<p>エラー詳細: {$mail->ErrorInfo}</p>";

        // PHP ini 設定情報を出力（デバッグ用）
        echo "<h3>PHP ini 設定情報</h3>";
        echo "<p><b>sendmail_path:</b> " . ini_get('sendmail_path') . "</p>";
        echo "<p><b>SMTP:</b> " . ini_get('SMTP') . "</p>";
        echo "<p><b>smtp_port:</b> " . ini_get('smtp_port') . "</p>";
        echo "<p><b>open_basedir:</b> " . ini_get('open_basedir') . "</p>";
    }
}
?>