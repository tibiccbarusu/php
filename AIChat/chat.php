<?php
ob_start(); // 出力バッファリングを開始
header('Content-Type: application/json');

// OpenAI API設定
$api_url = "https://api.openai.com/v1/chat/completions";
$api_key = ""; // APIキーを入力してください

// ヘルプページデータ（IDを追加）
$help_pages = [
    ["id" => 1, "title" => "パスワードのリセット", "description" => "パスワードをリセットする手順", "link" => "/help/password-reset"],
    ["id" => 2, "title" => "支払い方法の変更", "description" => "支払い方法を変更する手順", "link" => "/help/payment-method"],
    ["id" => 3, "title" => "配送状況の確認", "description" => "配送状況を確認する手順", "link" => "/help/shipping-status"],
    ["id" => 4, "title" => "アカウント削除", "description" => "アカウントを削除する手順", "link" => "/help/account-delete"],
];

// 事前定義された回答（IDを追加）
$predefined_answers = [
    ["id" => 1, "question" => "営業時間", "answer" => "当店の営業時間は9:00～18:00です。"],
    ["id" => 2, "question" => "電話番号", "answer" => "サポートの電話番号は012-345-6789です。"],
    ["id" => 3, "question" => "送料", "answer" => "送料は全国一律500円です。"],
    ["id" => 4, "question" => "返品", "answer" => "返品は商品到着後30日以内で対応可能です。"],
];

// ユーザー入力を取得
$input = json_decode(file_get_contents('php://input'), true);
$user_input = trim($input['question'] ?? '');

// ユーザー入力が空の場合はエラーを返す
if (empty($user_input)) {
    echo json_encode(['response' => '質問が入力されていません。']);
    exit;
}

// OpenAI APIを使用して分割・分類・回答検索をまとめて行う
function process_input_with_ai($user_input, $predefined_answers, $help_pages, $api_url, $api_key) {
    $candidates = array_merge(
        array_map(fn($a) => ["id" => $a['id'], "type" => "回答", "content" => $a['question']], $predefined_answers),
        array_map(fn($h) => ["id" => $h['id'], "type" => "ヘルプ", "content" => "{$h['title']} ({$h['description']})"], $help_pages)
    );

    $prompt = "次の文章を複数部分に分割し、それぞれ「質問」「意見」「関係のない内容」に分類してください。また、分類が「質問」の場合、関連する回答またはヘルプページを選択してください。\n";
    $prompt .= "候補リスト: " . json_encode($candidates, JSON_UNESCAPED_UNICODE) . "\n";
    $prompt .= "出力形式: [{\"type\": \"質問\", \"content\": \"...\", \"match\": {\"id\": ..., \"type\": \"回答\" または \"ヘルプ\"}}, ...]";

    $messages = [
        ["role" => "system", "content" => $prompt],
        ["role" => "user", "content" => "入力: {$user_input}"]
    ];

    $data = json_encode([
        "model" => "gpt-4",
        "messages" => $messages,
        "temperature" => 0
    ]);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $api_key",
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

    $response = curl_exec($ch);

    // cURLエラーのチェック
    if (curl_errno($ch)) {
        file_put_contents('log.txt', "cURLエラー: " . curl_error($ch) . "\n", FILE_APPEND);
        echo json_encode(['response' => 'APIリクエストでエラーが発生しました。']);
        exit;
    }

    // レスポンスをログに記録
    file_put_contents('log.txt', "APIレスポンス: " . $response . "\n", FILE_APPEND);

    // JSONデコードのチェック
    $result = json_decode($response, true);
    if ($result === null && json_last_error() !== JSON_ERROR_NONE) {
        file_put_contents('log.txt', "JSONデコードエラー: " . json_last_error_msg() . "\nレスポンス内容: " . $response . "\n", FILE_APPEND);
        echo json_encode(['response' => 'APIレスポンスが不正です。']);
        exit;
    }

    // コンテンツから「出力: 」を削除
    $content = $result['choices'][0]['message']['content'] ?? '';
    $content = preg_replace('/^出力: /', '', $content); // 先頭の「出力: 」を削除

    // JSONデコード
    $processed_data = json_decode($content, true);

    // JSON解析エラーのチェック
    if ($processed_data === null && json_last_error() !== JSON_ERROR_NONE) {
        file_put_contents('log.txt', "JSONデコードエラー: " . json_last_error_msg() . "\n内容: " . $content . "\n", FILE_APPEND);
        echo json_encode(['response' => 'API応答の解析に失敗しました。']);
        exit;
    }

    return $processed_data;
}

// AIによる処理を実行
$processed_results = process_input_with_ai($user_input, $predefined_answers, $help_pages, $api_url, $api_key);

// デバッグ用ログ
file_put_contents('log.txt', "処理結果: " . print_r($processed_results, true) . "\n", FILE_APPEND);

// 処理結果に基づいてレスポンスを生成
$responses = [];
foreach ($processed_results as $result) {
    if ($result['type'] === '意見') {
        $responses[] = "ご意見ありがとうございます。今後のサービス向上に活かします。";
    } elseif ($result['type'] === '関係のない内容') {
        $responses[] = "申し訳ありませんが、その内容にはお答えできません。";
    } elseif ($result['type'] === '質問' && isset($result['match'])) {
        // マッチ結果から実際のデータを取得
        if ($result['match']['type'] === '回答') {
            $answer = array_filter($predefined_answers, fn($a) => $a['id'] === $result['match']['id']);
            $responses[] = reset($answer)['answer'];
        } elseif ($result['match']['type'] === 'ヘルプ') {
            $help = array_filter($help_pages, fn($h) => $h['id'] === $result['match']['id']);
            $help_page = reset($help);
            $responses[] = "関連するヘルプページ: <a href=\"{$help_page['link']}\">{$help_page['title']}</a>";
        }
    } else {
        $responses[] = "質問内容「{$result['content']}」に関連する回答が見つかりませんでした。他の質問をお試しください。";
    }
}

// 最終レスポンスを作成して返す
$response_data = [
    'response' => implode("\n", $responses),
    'details' => $responses
];

echo json_encode($response_data);
ob_end_flush();
?>