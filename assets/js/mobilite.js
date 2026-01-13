// Gestion des onglets
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const targetTab = button.getAttribute("data-tab");

        // Retirer la classe active de tous les boutons et contenus
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        tabContents.forEach((content) => content.classList.remove("active"));

        // Ajouter la classe active au bouton cliqué et au contenu correspondant
        button.classList.add("active");
        document.getElementById(targetTab).classList.add("active");
    });
});

// Animation au scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, observerOptions);

// Observer tous les éléments avec animation
document.querySelectorAll(".service-card, .tip-card, .planner-card").forEach(
    (el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
        observer.observe(el);
    },
);
