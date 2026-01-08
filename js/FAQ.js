document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Gestion de l'Accordéon ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Fermer les autres (Optionnel : gardez ou supprimez ce bloc si vous voulez permettre plusieurs ouverts)
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Basculer l'état actuel
            item.classList.toggle('active');
        });
    });

    // --- 2. Gestion de la Recherche ---
    const searchInput = document.getElementById('searchBar');

    if(searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const term = e.target.value.toLowerCase();
            
            faqItems.forEach(item => {
                const questionText = item.querySelector('.faq-question').innerText.toLowerCase();
                const answerText = item.querySelector('.faq-answer').innerText.toLowerCase();

                // Si le terme est trouvé dans la question OU la réponse
                if (questionText.includes(term) || answerText.includes(term)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                    item.classList.remove('active'); // On referme si on cache
                }
            });

            // Gestion de l'affichage des titres de catégories
            const categories = document.querySelectorAll('.faq-category');
            categories.forEach(cat => {
                // On vérifie s'il reste des items visibles dans cette catégorie
                const visibleItems = Array.from(cat.querySelectorAll('.faq-item')).filter(item => item.style.display !== 'none');
                const title = cat.querySelector('.category-title');
                
                if (title) {
                    title.style.display = visibleItems.length > 0 ? 'block' : 'none';
                }
            });
        });
    }
});