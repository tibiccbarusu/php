document.addEventListener("DOMContentLoaded", () => {
    const createAccountButton = document.getElementById("createAccountButton");

    createAccountButton.addEventListener("click", () => {
        window.location.href = "create.html";
    });
});