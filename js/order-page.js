const API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api';
const API_KEY = '2d451ee9-0077-47ae-9708-61c16e452353';

let orderDishes = {
    soup: null,
    main_course: null,
    salad: null,
    beverage: null,
    dessert: null
};

async function loadOrderPage() {
    const orderIds = loadOrderFromLocalStorage();

    if (!orderIds || !hasAnyDish(orderIds)) {
        displayEmptyOrder();
        return;
    }

    try {
        await loadDishes();

        if (orderIds.soup_id) {
            const dish = dishes.find(d => d.id === orderIds.soup_id);
            if (dish) orderDishes.soup = dish;
        }
        if (orderIds.main_course_id) {
            const dish = dishes.find(d => d.id === orderIds.main_course_id);
            if (dish) orderDishes.main_course = dish;
        }
        if (orderIds.salad_id) {
            const dish = dishes.find(d => d.id === orderIds.salad_id);
            if (dish) orderDishes.salad = dish;
        }
        if (orderIds.drink_id) {
            const dish = dishes.find(d => d.id === orderIds.drink_id);
            if (dish) orderDishes.beverage = dish;
        }
        if (orderIds.dessert_id) {
            const dish = dishes.find(d => d.id === orderIds.dessert_id);
            if (dish) orderDishes.dessert = dish;
        }

        displayOrderComposition();
        updateOrderSummary();
    } catch (error) {
        console.error('Ошибка при загрузке заказа:', error);
    }
}

function hasAnyDish(orderIds) {
    return orderIds.soup_id || orderIds.main_course_id || orderIds.salad_id ||
           orderIds.drink_id || orderIds.dessert_id;
}

function loadOrderFromLocalStorage() {
    const savedOrder = localStorage.getItem('proLunchOrder');
    if (savedOrder) {
        try {
            return JSON.parse(savedOrder);
        } catch (e) {
            console.error('Ошибка при загрузке заказа:', e);
        }
    }
    return null;
}

function displayEmptyOrder() {
    const compositionSection = document.querySelector('#order-composition .dishes-grid');
    if (compositionSection) {
        compositionSection.innerHTML = `
            <p class="empty-order-message">
                Ничего не выбрано. Чтобы добавить блюда в заказ, перейдите на страницу
                <a href="menu.html">Собрать ланч</a>.
            </p>
        `;
    }
    updateOrderSummary();
}

function displayOrderComposition() {
    const compositionSection = document.querySelector('#order-composition .dishes-grid');
    if (!compositionSection) return;

    compositionSection.innerHTML = '';

    Object.values(orderDishes).forEach(dish => {
        if (dish) {
            const dishCard = createOrderDishCard(dish);
            compositionSection.appendChild(dishCard);
        }
    });
}

function createOrderDishCard(dish) {
    const card = document.createElement('div');
    card.className = 'dish-card';
    card.setAttribute('data-dish-id', dish.id);

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
    button.textContent = 'Удалить';
    button.className = 'remove-btn';
    button.addEventListener('click', function() {
        removeDishFromOrder(dish.id);
    });

    card.appendChild(img);
    card.appendChild(price);
    card.appendChild(name);
    card.appendChild(weight);
    card.appendChild(button);

    return card;
}

function removeDishFromOrder(dishId) {
    for (let category in orderDishes) {
        if (orderDishes[category] && orderDishes[category].id === dishId) {
            orderDishes[category] = null;
            break;
        }
    }

    saveOrderToLocalStorage();

    const card = document.querySelector(`[data-dish-id="${dishId}"]`);
    if (card) {
        card.remove();
    }

    const hasAnyDish = Object.values(orderDishes).some(dish => dish !== null);
    if (!hasAnyDish) {
        displayEmptyOrder();
    } else {
        updateOrderSummary();
    }
}

function saveOrderToLocalStorage() {
    const orderIds = {
        soup_id: orderDishes.soup ? orderDishes.soup.id : null,
        main_course_id: orderDishes.main_course ? orderDishes.main_course.id : null,
        salad_id: orderDishes.salad ? orderDishes.salad.id : null,
        drink_id: orderDishes.beverage ? orderDishes.beverage.id : null,
        dessert_id: orderDishes.dessert ? orderDishes.dessert.id : null
    };
    localStorage.setItem('proLunchOrder', JSON.stringify(orderIds));
}

function updateOrderSummary() {
    const summarySection = document.querySelector('.order-summary');
    if (!summarySection) return;

    const categoryLabels = {
        soup: 'Суп',
        main_course: 'Главное блюдо',
        salad: 'Салат/стартер',
        beverage: 'Напиток',
        dessert: 'Десерт'
    };

    const emptyMessages = {
        soup: 'Не выбрано',
        main_course: 'Не выбрано',
        salad: 'Не выбрано',
        beverage: 'Не выбран',
        dessert: 'Не выбран'
    };

    summarySection.innerHTML = '';

    let totalPrice = 0;

    Object.keys(categoryLabels).forEach(category => {
        const item = document.createElement('div');
        item.className = 'summary-item';

        const label = document.createElement('p');
        label.innerHTML = `<strong>${categoryLabels[category]}</strong>`;

        const value = document.createElement('p');

        if (orderDishes[category]) {
            const dish = orderDishes[category];
            value.textContent = `${dish.name} ${dish.price}₽`;
            totalPrice += dish.price;
        } else {
            value.textContent = emptyMessages[category];
            value.style.color = '#999';
        }

        item.appendChild(label);
        item.appendChild(value);
        summarySection.appendChild(item);
    });

    const totalItem = document.createElement('div');
    totalItem.className = 'summary-total';
    totalItem.innerHTML = `
        <p><strong>Стоимость заказа</strong></p>
        <p class="total-price">${totalPrice}₽</p>
    `;
    summarySection.appendChild(totalItem);
}

async function submitOrder(event) {
    event.preventDefault();

    const isValid = validateCombo();
    if (!isValid) {
        return;
    }

    const form = event.target;
    const formData = new FormData(form);

    const deliveryType = formData.get('delivery_time_type');
    const deliveryTime = formData.get('delivery_time');

    const orderData = {
        full_name: formData.get('name'),
        email: formData.get('email'),
        subscribe: formData.get('subscribe') ? 1 : 0,
        phone: formData.get('phone'),
        delivery_address: formData.get('address'),
        delivery_type: deliveryType === 'asap' ? 'now' : 'by_time',
        delivery_time: deliveryType === 'specific_time' ? deliveryTime : '',
        comment: formData.get('comment') || '',
        soup_id: orderDishes.soup ? orderDishes.soup.id : null,
        main_course_id: orderDishes.main_course ? orderDishes.main_course.id : null,
        salad_id: orderDishes.salad ? orderDishes.salad.id : null,
        drink_id: orderDishes.beverage ? orderDishes.beverage.id : null,
        dessert_id: orderDishes.dessert ? orderDishes.dessert.id : null
    };

    try {
        const response = await fetch(`${API_URL}/orders?api_key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка при отправке заказа');
        }

        const result = await response.json();

        console.log('Отправляемые данные:', orderData);

        localStorage.removeItem('proLunchOrder');

        showSuccessNotification();


    } catch (error) {
        console.error('Ошибка:', error);
        showErrorNotification(error.message);
    }
}

function validateCombo() {
    const hasSoup = orderDishes.soup !== null;
    const hasMainCourse = orderDishes.main_course !== null;
    const hasSalad = orderDishes.salad !== null;
    const hasBeverage = orderDishes.beverage !== null;

    if (!hasSoup && !hasMainCourse && !hasSalad && !hasBeverage) {
        showNotification('Ничего не выбрано', 'Выберите блюда для заказа');
        return false;
    }

    const validCombos = [
        { soup: true, main_course: true, salad: true, beverage: true },
        { soup: true, main_course: true, salad: false, beverage: true },
        { soup: true, main_course: false, salad: true, beverage: true },
        { soup: false, main_course: true, salad: true, beverage: true },
        { soup: false, main_course: true, salad: false, beverage: true }
    ];

    const isValidCombo = validCombos.some(combo =>
        combo.soup === hasSoup &&
        combo.main_course === hasMainCourse &&
        combo.salad === hasSalad &&
        combo.beverage === hasBeverage
    );

    if (!isValidCombo) {
        let message = '';

        if ((hasSoup && hasMainCourse && hasSalad) ||
            (hasSoup && hasMainCourse) ||
            (hasSoup && hasSalad) ||
            (hasMainCourse && hasSalad) ||
            hasMainCourse) {
            if (!hasBeverage) {
                message = 'Выберите напиток';
            }
        }

        if (hasSoup && !hasMainCourse && !hasSalad) {
            message = 'Выберите главное блюдо/салат/стартер';
        }

        if (hasSalad && !hasSoup && !hasMainCourse) {
            message = 'Выберите суп или главное блюдо';
        }

        if (!hasSoup && !hasMainCourse && !hasSalad && hasBeverage) {
            message = 'Выберите главное блюдо';
        }

        if (!message) {
            message = 'Выберите подходящую комбинацию блюд';
        }

        showNotification('Некорректный состав заказа', message);
        return false;
    }

    return true;
}

function showNotification(title, message) {
    const existingNotification = document.querySelector('.notification-overlay');
    if (existingNotification) {
        existingNotification.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';

    const notification = document.createElement('div');
    notification.className = 'notification';

    const titleElement = document.createElement('h3');
    titleElement.textContent = title;

    const text = document.createElement('p');
    text.textContent = message;

    const button = document.createElement('button');
    button.textContent = 'Окей';

    button.addEventListener('click', function() {
        overlay.remove();
        window.location.href = 'menu.html';
    });

    notification.appendChild(titleElement);
    notification.appendChild(text);
    notification.appendChild(button);
    overlay.appendChild(notification);

    document.body.appendChild(overlay);
}

function showSuccessNotification() {
    showNotification('Заказ оформлен', 'Ваш заказ успешно отправлен!');
}

function showErrorNotification(message) {
    showNotification('Ошибка', `Не удалось оформить заказ: ${message}`);
}

document.addEventListener('DOMContentLoaded', function() {
    loadOrderPage();

    const form = document.querySelector('.order-form');
    if (form) {
        form.addEventListener('submit', submitOrder);
    }

    const asapRadio = document.getElementById('asap');
    const specificTimeRadio = document.getElementById('specific_time');
    const deliveryTimeInput = document.getElementById('delivery_time');

    function updateTimeField() {
        if (specificTimeRadio && specificTimeRadio.checked) {
            deliveryTimeInput.disabled = false;
            deliveryTimeInput.required = true;
        } else {
            deliveryTimeInput.disabled = true;
            deliveryTimeInput.required = false;
            deliveryTimeInput.value = '';
        }
    }

    if (deliveryTimeInput) {
        deliveryTimeInput.disabled = true;
        deliveryTimeInput.required = false;
    }

    if (asapRadio) {
        asapRadio.addEventListener('change', updateTimeField);
    }
    if (specificTimeRadio) {
        specificTimeRadio.addEventListener('change', updateTimeField);
    }
});
