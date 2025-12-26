document.addEventListener('DOMContentLoaded', async function() {
    await loadDishes();
    
    const sortedDishes = dishes.sort((a, b) => a.name.localeCompare(b.name));

    const categories = [
        { key: 'soup', title: 'Выберите суп' },
        { key: 'main_course', title: 'Выберите главное блюдо' },
        { key: 'salad', title: 'Выберите салат или стартер' },
        { key: 'beverage', title: 'Выберите напиток' },
        { key: 'dessert', title: 'Выберите десерт' }
    ];

    const sections = document.querySelectorAll('main section:has(.filter-buttons)');

    categories.forEach((category, index) => {
        const categoryDishes = sortedDishes.filter(dish => dish.category === category.key);

        const section = sections[index];
        if (!section) return;

        const h2 = section.querySelector('h2');
        if (h2) {
            h2.textContent = category.title;
        }

        let dishesGrid = section.querySelector('.dishes-grid');
        if (!dishesGrid) {
            dishesGrid = document.createElement('div');
            dishesGrid.className = 'dishes-grid';
            section.appendChild(dishesGrid);
        } else {
            dishesGrid.innerHTML = '';
        }

        categoryDishes.forEach(dish => {
            const dishCard = createDishCard(dish);
            dishesGrid.appendChild(dishCard);
        });
    });
});

function createDishCard(dish) {
    const card = document.createElement('div');
    card.className = 'dish-card';
    card.setAttribute('data-dish', dish.keyword);

    const img = document.createElement('img');
    img.src = dish.image;
    img.alt = dish.name;

    const price = document.createElement('p');
    price.className = 'price';
    price.textContent = dish.price + ' ₽';

    const name = document.createElement('p');
    name.className = 'dish-name';
    name.textContent = dish.name;

    const weight = document.createElement('p');
    weight.className = 'weight';
    weight.textContent = dish.count;

    const button = document.createElement('button');
    button.textContent = 'Добавить';

    card.appendChild(img);
    card.appendChild(price);
    card.appendChild(name);
    card.appendChild(weight);
    card.appendChild(button);

    return card;
}
