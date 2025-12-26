let dishes = [];

async function loadDishes() {
    try {
        const response = await fetch('https://edu.std-900.ist.mospolytech.ru/labs/api/dishes');
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }
        const data = await response.json();
        
        dishes = data.map(dish => ({
            ...dish,
            category: dish.category === 'main-course' ? 'main_course' : 
                     dish.category === 'drink' ? 'beverage' : 
                     dish.category
        }));
        
        return dishes;
    } catch (error) {
        console.error('Ошибка при загрузке блюд:', error);
        return [];
    }
}
