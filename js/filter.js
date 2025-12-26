document.addEventListener('DOMContentLoaded', function() {

    const sections = document.querySelectorAll('main section:has(.filter-buttons)');

    sections.forEach(section => {
        const filterButtons = section.querySelectorAll('.filter-btn');
        const dishesGrid = section.querySelector('.dishes-grid');

        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const selectedKind = this.getAttribute('data-kind');

                if (this.classList.contains('active')) {
                    this.classList.remove('active');
                    showAllDishes(dishesGrid);
                } else {
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    filterDishesByKind(dishesGrid, selectedKind);
                }
            });
        });
    });

    function filterDishesByKind(dishesGrid, kind) {
        const dishCards = dishesGrid.querySelectorAll('.dish-card');

        dishCards.forEach(card => {
            const dishKeyword = card.getAttribute('data-dish');
            const dish = dishes.find(d => d.keyword === dishKeyword);

            if (dish && dish.kind === kind) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    function showAllDishes(dishesGrid) {
        const dishCards = dishesGrid.querySelectorAll('.dish-card');
        dishCards.forEach(card => {
            card.style.display = '';
        });
    }
});
