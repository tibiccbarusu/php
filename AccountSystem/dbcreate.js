document.addEventListener("DOMContentLoaded", () => {
    const initializeDbButton = document.getElementById("initializeDbButton");
    const statusMessage = document.getElementById("statusMessage");

    initializeDbButton.addEventListener("click", () => {
        fetch("dbcreate.php", { method: "POST" })
            .then(response => response.json())
            .then(data => {
                statusMessage.textContent = data.message;
                statusMessage.style.color = data.success ? "green" : "red";
            })
            .catch(error => {
                statusMessage.textContent = "エラーが発生しました。";
                statusMessage.style.color = "red";
                console.error(error);
            });
    });
});