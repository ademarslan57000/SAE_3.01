document.addEventListener('DOMContentLoaded', () => {
    
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            item.classList.toggle('active');
        });
    });

    const searchInput = document.getElementById('searchBar');

    if(searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const term = e.target.value.toLowerCase();
            
            faqItems.forEach(item => {
                const questionText = item.querySelector('.faq-question').innerText.toLowerCase();
                const answerText = item.querySelector('.faq-answer').innerText.toLowerCase();

                if (questionText.includes(term) || answerText.includes(term)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                    item.classList.remove('active');
                }
            });

            const categories = document.querySelectorAll('.faq-category');
            categories.forEach(cat => {
                const visibleItems = Array.from(cat.querySelectorAll('.faq-item')).filter(item => item.style.display !== 'none');
                const title = cat.querySelector('.category-title');
                
                if (title) {
                    title.style.display = visibleItems.length > 0 ? 'block' : 'none';
                }
            });
        });
    }
});