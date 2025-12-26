function updateCheckoutPanel() {
    let panel = document.querySelector('.checkout-panel');
    
    if (!panel) {
        panel = document.createElement('div');
        panel.className = 'checkout-panel';
        document.body.appendChild(panel);
    }

    const selectedDishes = window.selectedDishes;
    const hasSelection = Object.values(selectedDishes).some(dish => dish !== null);

    if (!hasSelection) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'block';

    let totalPrice = 0;
    Object.values(selectedDishes).forEach(dish => {
        if (dish) {
            totalPrice += dish.price;
        }
    });

    const isValidCombo = checkComboValidity();

    panel.innerHTML = `
        <div class="checkout-panel-content">
            <div class="checkout-info">
                <p class="checkout-total">Итого: <strong>${totalPrice}₽</strong></p>
            </div>
            <a href="order.html" class="checkout-button ${!isValidCombo ? 'disabled' : ''}">
                Перейти к оформлению
            </a>
        </div>
    `;

    if (!isValidCombo) {
        const button = panel.querySelector('.checkout-button');
        button.addEventListener('click', function(event) {
            event.preventDefault();
        });
    }
}

function checkComboValidity() {
    const selected = window.selectedDishes;
    
    const hasSoup = selected.soup !== null;
    const hasMainCourse = selected.main_course !== null;
    const hasSalad = selected.salad !== null;
    const hasBeverage = selected.beverage !== null;
    const hasDessert = selected.dessert !== null;

    if (!hasSoup && !hasMainCourse && !hasSalad && !hasBeverage && !hasDessert) {
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

    return isValidCombo;
}
