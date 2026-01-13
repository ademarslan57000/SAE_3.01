// Gestion du menu déroulant
document.addEventListener("DOMContentLoaded", () => {
    const btnMenu = document.getElementById("btnMenu");
    const dropdownContent = document.getElementById("dropdownContent");

    btnMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdownContent.classList.toggle("show");
    });

    // Fermer le menu si on clique ailleurs
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".dropdown-menu")) {
            dropdownContent.classList.remove("show");
        }
    });
});

// Fonction pour afficher la liste des parkings
function afficherListeParkings() {
    window.location.href = "liste-parkings.html";
    document.getElementById("dropdownContent").classList.remove("show");
}

// Fonction pour afficher la FAQ
function afficherFAQ() {
    window.location.href = "FAQ.html";
    document.getElementById("dropdownContent").classList.remove("show");
}

function afficherReservation(){
    window.location.href = "reservation.html";
    document.getElementById("dropdownContent").classList.remove("show");
}
