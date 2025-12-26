function displayDishes() {
    const categories = ['soup', 'main', 'drink', 'salad', 'dessert'];

    categories.forEach(cat => {
        const grid = document.getElementById(cat + '-grid');
        const filterBar = document.getElementById(cat + '-filters');

        if (!grid) return;

        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888;">Загрузка блюд...</p>';
        if (filterBar) filterBar.innerHTML = '';

        // Создаём фильтры
        const kindsInCategory = [...new Set(
            dishes.filter(d => d.category === cat).map(d => d.kind)
        )];

        if (filterBar && kindsInCategory.length > 0) {
            const allBtn = document.createElement('button');
            allBtn.textContent = 'Все';
            allBtn.className = 'filter-btn active';
            allBtn.dataset.kind = 'all';
            filterBar.appendChild(allBtn);

            kindsInCategory.forEach(kind => {
                const btn = document.createElement('button');
                btn.textContent = kindNames[kind] || kind;
                btn.className = 'filter-btn';
                btn.dataset.kind = kind;
                filterBar.appendChild(btn);
            });
        }

        renderCategory(cat);
    });
}

function renderCategory(cat) {
    const grid = document.getElementById(cat + '-grid');
    if (!grid) return;

    let filtered = dishes.filter(d => d.category === cat);

    if (currentFilters[cat]) {
        filtered = filtered.filter(d => d.kind === currentFilters[cat]);
    }

    filtered.sort((a, b) => a.name.localeCompare(b.name));

    grid.innerHTML = '';

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px 20px;">Нет блюд в этой категории или по выбранному фильтру</p>';
        return;
    }

    filtered.forEach(dish => {
        const isSelected = selectedDishes[dish.category]?.keyword === dish.keyword;

        const el = document.createElement('div');
        el.className = 'dish';
        el.dataset.dish = dish.keyword;
        el.innerHTML = `
            <img src="${dish.image}" alt="${dish.name}" onerror="this.src='img/no-photo.jpg'">
            <p class="price">${dish.price} ₽</p>
            <p class="title">${dish.name}</p>
            <p class="weight">${dish.count}</p>
            <button class="add-btn ${isSelected ? 'remove' : ''}">
                ${isSelected ? 'Убрать' : 'Добавить'}
            </button>
        `;
        grid.appendChild(el);
    });
}

// Инициализация отображения меню
document.addEventListener('DOMContentLoaded', async () => {
    await loadDishes();
    displayDishes();
    updateOrderSection();
});