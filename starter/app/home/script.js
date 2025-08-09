let logoutButton = document.getElementById("logout");

logoutButton.addEventListener("click", () => {
    fetch("/logout", {
        method: "POST"
    }).then(response => {
        location.assign("/");
    })
});