<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <?php
    //データ送信があったかどうか
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        //データの取得
        $recaptchaResponse = $_POST['g-recaptcha-response'];
        //reCAPTCHAの検証
        $recaptchaSecret = "";//シークレットキー
        $recaptchaVerifyUrl = "https://www.google.com/recaptcha/api/siteverify";
        $recaptchaVerifyData = [
            'secret' => $recaptchaSecret,
            'response' => $recaptchaResponse
        ];
        $recaptchaContext = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
                'content' => http_build_query($recaptchaVerifyData)
            ]
        ]);
        $recaptchaVerifyResult = file_get_contents($recaptchaVerifyUrl, false, $recaptchaContext);
        $recaptchaVerifyResult = json_decode($recaptchaVerifyResult, true);
        //reCAPTCHAの検証結果
        if (!$recaptchaVerifyResult['success']) {
            //失敗
            echo "reCAPTCHAの検証に失敗しました。";
        } else {
            //成功
            echo "reCAPTCHAの検証に成功しました。";
        }
    } else {
        //リダイレクト
        header("Location: recaptcha.html");
        exit;
    }
    ?>
    <br>
    <a href="recaptcha.html">戻る</a>
</body>
</html>