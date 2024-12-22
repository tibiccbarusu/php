document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("createAccountForm");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const passwordInput = document.getElementById("password");
    const errorMessage = document.getElementById("errorMessage");
    const searchAddressButton = document.getElementById("searchAddress");

    form.addEventListener("submit", (event) => {
        if (passwordInput.value !== confirmPasswordInput.value) {
            event.preventDefault();
            errorMessage.textContent = "パスワードが一致しません。";
        }
    });

    searchAddressButton.addEventListener("click", () => {
        const postalCode = document.getElementById("postalCode").value;
        const errorMessage = document.getElementById("errorMessage");
        errorMessage.textContent = ""; // エラーメッセージを初期化
    
        if (/^\d{7}$/.test(postalCode)) { // 正規表現で郵便番号の形式を厳密に確認
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
});