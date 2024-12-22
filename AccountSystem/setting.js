document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("settingForm");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const passwordInput = document.getElementById("password");
    const errorMessage = document.getElementById("errorMessage");
    const searchAddressButton = document.getElementById("searchAddress");
    const backToSuccessButton = document.getElementById("backToSuccess");

    // パスワード一致確認
    form.addEventListener("submit", (event) => {
        if (passwordInput.value && passwordInput.value !== confirmPasswordInput.value) {
            event.preventDefault();
            errorMessage.textContent = "パスワードが一致しません。";
        }
    });

    // 郵便番号検索
    searchAddressButton.addEventListener("click", () => {
        const postalCode = document.getElementById("postalCode").value;
        errorMessage.textContent = ""; // エラーメッセージを初期化

        if (/^\d{7}$/.test(postalCode)) {
            fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("APIリクエストエラー");
                    }
                    return response.json();
                })
                .then((data) => {
                    if (data.results) {
                        const result = data.results[0];
                        document.getElementById("prefecture").value = result.address1 || "";
                        document.getElementById("city").value = (result.address2 || "") + (result.address3 || "");
                        errorMessage.textContent = ""; // エラーメッセージをクリア
                    } else {
                        errorMessage.textContent = "住所が見つかりませんでした。";
                    }
                })
                .catch((error) => {
                    console.error("エラー:", error);
                    errorMessage.textContent = "住所検索中にエラーが発生しました。";
                });
        } else {
            errorMessage.textContent = "正しい郵便番号を入力してください。";
        }
    });

    // 「ログイン成功ページに戻る」ボタンの処理
    backToSuccessButton.addEventListener("click", () => {
        window.location.href = "success.php";
    });
});