document.getElementById('send-button').addEventListener('click', () => {
    const userInput = document.getElementById('user-input').value.trim();
    if (userInput === '') return;

    // ユーザーの質問をチャットに追加
    addMessageToChat(userInput, 'user-message');

    // フィールドをクリア
    document.getElementById('user-input').value = '';

    // サーバーに質問を送信
    fetch('chat.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userInput }),
    })
        .then(response => {
            // 応答が空の場合エラー
            if (!response.ok) {
                throw new Error(`HTTPエラー: ${response.status}`);
            }
            return response.text(); // 一旦テキスト形式で取得
        })
        .then(text => {
            try {
                const data = JSON.parse(text); // JSONに変換
                // サーバーの応答をチャットに追加
                if (data.details && Array.isArray(data.details)) {
                    data.details.forEach(detail => {
                        addMessageToChat(detail, 'bot-message');
                    });
                } else if (data.response) {
                    addMessageToChat(data.response, 'bot-message');
                } else {
                    addMessageToChat('申し訳ありませんが、適切な応答を生成できませんでした。', 'bot-message');
                }
            } catch (error) {
                console.error('JSON解析エラー:', error);
                console.error('サーバー応答:', text);
                addMessageToChat('サーバーからの応答が正しくありません。もう一度お試しください。', 'bot-message');
            }
        })
        .catch(error => {
            console.error('エラー:', error);
            addMessageToChat('エラーが発生しました。もう一度お試しください。', 'bot-message');
        });
});

function addMessageToChat(message, className) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = message; // HTMLをサポートするために innerHTML を使用
    messageDiv.className = `message ${className}`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // 常に最新メッセージを表示
}