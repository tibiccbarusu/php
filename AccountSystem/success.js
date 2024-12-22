document.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.getElementById("logoutButton");
    const settingsButton = document.getElementById("settingsButton");

    // ログアウトボタンの処理
    logoutButton.addEventListener("click", () => {
        window.location.href = "logout.php";
    });

    // アカウント設定ボタンの処理
    settingsButton.addEventListener("click", () => {
        window.location.href = "setting.php";
    });
});