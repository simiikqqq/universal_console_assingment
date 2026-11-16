export function initNotifications() {
    const container = document.getElementById("notifications");

    setTimeout(() => {
        showNotification("Nová obytná zóna byla postavena.");
    }, 2000);

    setTimeout(() => {
        showNotification("Rozpočet města byl aktualizován.");
    }, 4000);

    function showNotification(message) {
        const div = document.createElement("div");
        div.classList.add("notification");
        div.textContent = message;

        container.appendChild(div);

        setTimeout(() => {
            div.remove();
        }, 5000);
    }
}
