// js/checkout.js - Lógica para el proceso de checkout

let currentStep = 1;
let orderData = {
    shipping: {},
    payment: {},
    items: [],
    totals: {}
};

document.addEventListener('DOMContentLoaded', function() {
    initializeCheckout();
});

function initializeCheckout() {
    // Verificar autenticación
    if (!checkAuthentication()) {
        return;
    }
    
    // Verificar que el carrito no esté vacío
    if (!checkCart()) {
        return;
    }
    
    // Cargar datos iniciales
    loadCartData();
    loadUserData();
    setupEventListeners();
    updateCheckoutSummary();
    
    console.log('🛒 Checkout inicializado');
}

function checkAuthentication() {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    
    if (!currentUser) {
        window.utils.showToast('Debes iniciar sesión para realizar una compra', 'error');
        setTimeout(() => {
            // Guardar la URL actual para redirigir después del login
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = 'login.html';
        }, 2000);
        return false;
    }
    
    // Actualizar bienvenida
    const welcomeElement = document.getElementById('user-welcome');
    if (welcomeElement) {
        welcomeElement.textContent = `Bienvenido, ${currentUser.firstname}`;
    }
    
    return true;
}

function checkCart() {
    if (cart.length === 0) {
        window.utils.showToast('Tu carrito está vacío', 'error');
        setTimeout(() => {
            window.location.href = 'cart.html';
        }, 2000);
        return false;
    }
    
    // Verificar stock
    const outOfStockItems = cart.filter(item => {
        const product = products.find(p => p.id === item.id);
        return product && item.quantity > product.stock;
    });
    
    if (outOfStockItems.length > 0) {
        window.utils.showToast('Algunos productos no tienen suficiente stock', 'error');
        setTimeout(() => {
            window.location.href = 'cart.html';
        }, 2000);
        return false;
    }
    
    return true;
}

function loadCartData() {
    orderData.items = [...cart];
    updateCartDisplay();
}

function loadUserData() {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (!currentUser) return;
    
    // Rellenar datos del usuario en el formulario
    document.getElementById('shipping-firstname').value = currentUser.firstname || '';
    document.getElementById('shipping-lastname').value = currentUser.lastname || '';
    document.getElementById('shipping-email').value = currentUser.email || '';
}

function setupEventListeners() {
    // Tabs de métodos de pago
    const paymentTabs = document.querySelectorAll('.payment-tab');
    paymentTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            switchPaymentMethod(this.getAttribute('data-method'));
        });
    });
    
    // Cambios en método de entrega
    const deliveryOptions = document.querySelectorAll('input[name="delivery-method"]');
    deliveryOptions.forEach(option => {
        option.addEventListener('change', updateShippingCost);
    });
    
    // Validación en tiempo real
    setupRealTimeValidation();
}

function setupRealTimeValidation() {
    // Validar email
    const emailInput = document.getElementById('shipping-email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            validateCheckoutEmail(this.value);
        });
    }
}

// Navegación entre pasos
function goToStep(step) {
    // Validar paso actual antes de avanzar
    if (step > currentStep && !validateCurrentStep()) {
        return;
    }
    
    // Ocultar paso actual
    document.querySelector(`.checkout-step[data-step="${currentStep}"]`).classList.remove('active');
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
    
    // Mostrar nuevo paso
    currentStep = step;
    document.querySelector(`.checkout-step[data-step="${step}"]`).classList.add('active');
    document.querySelector(`.step[data-step="${step}"]`).classList.add('active');
    
    // Guardar datos del paso anterior
    saveStepData();
    
    // Actualizar resumen si es el paso 3
    if (step === 3) {
        updateConfirmationSummary();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            return validateShippingStep();
        case 2:
            return validatePaymentStep();
        default:
            return true;
    }
}

function validateShippingStep() {
    const requiredFields = [
        'shipping-firstname', 'shipping-lastname', 'shipping-email',
        'shipping-phone', 'shipping-address', 'shipping-city', 'shipping-zip'
    ];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            window.utils.showToast('Completa todos los campos requeridos', 'error');
            field?.focus();
            return false;
        }
    }
    
    // Validar email
    const email = document.getElementById('shipping-email').value;
    if (!window.utils.isValidEmail(email)) {
        window.utils.showToast('Email inválido', 'error');
        return false;
    }
    
    return true;
}

function validatePaymentStep() {
    const activeMethod = document.querySelector('.payment-tab.active').getAttribute('data-method');
    
    switch (activeMethod) {
        case 'credit-card':
            return validateCreditCard();
        case 'qr':
        case 'crypto':
            // QR y Crypto no requieren validación adicional
            return true;
        default:
            return true;
    }
}

function validateCreditCard() {
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCvc = document.getElementById('card-cvc').value;
    const cardName = document.getElementById('card-name').value;
    
    if (!cardNumber || cardNumber.length < 16) {
        window.utils.showToast('Número de tarjeta inválido', 'error');
        return false;
    }
    
    if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        window.utils.showToast('Fecha de expiración inválida', 'error');
        return false;
    }
    
    if (!cardCvc || cardCvc.length < 3) {
        window.utils.showToast('CVC inválido', 'error');
        return false;
    }
    
    if (!cardName) {
        window.utils.showToast('Nombre en la tarjeta requerido', 'error');
        return false;
    }
    
    return true;
}

// Métodos de pago
function switchPaymentMethod(method) {
    // Desactivar todas las tabs
    document.querySelectorAll('.payment-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.payment-method').forEach(method => {
        method.classList.remove('active');
    });
    
    // Activar tab seleccionada
    document.querySelector(`.payment-tab[data-method="${method}"]`).classList.add('active');
    document.getElementById(`${method}-method`).classList.add('active');
    
    // Actualizar datos de pago
    orderData.payment.method = method;
}

function copyCryptoAddress() {
    const address = document.getElementById('crypto-address').textContent;
    navigator.clipboard.writeText(address).then(() => {
        window.utils.showToast('Dirección copiada al portapapeles', 'success');
    });
}

// Cálculos y resúmenes
function updateShippingCost() {
    const selectedMethod = document.querySelector('input[name="delivery-method"]:checked').value;
    let shippingCost = 0;
    
    switch (selectedMethod) {
        case 'express':
            shippingCost = 99.00;
            break;
        case 'instant':
            shippingCost = 199.00;
            break;
        default:
            shippingCost = 0;
    }
    
    orderData.shipping.method = selectedMethod;
    orderData.shipping.cost = shippingCost;
    updateCheckoutSummary();
}

function updateCheckoutSummary() {
    const subtotal = window.utils.calculateCartTotal(cart);
    const shipping = orderData.shipping.cost || 0;
    const tax = subtotal * 0.18;
    const total = subtotal + shipping + tax;
    
    // Actualizar UI
    document.getElementById('summary-subtotal').textContent = window.utils.formatPrice(subtotal);
    document.getElementById('summary-shipping').textContent = window.utils.formatPrice(shipping);
    document.getElementById('summary-tax').textContent = window.utils.formatPrice(tax);
    document.getElementById('summary-total').textContent = window.utils.formatPrice(total);
    
    // Actualizar QR y Crypto
    document.getElementById('qr-amount').textContent = window.utils.formatPrice(total);
    document.getElementById('crypto-amount').textContent = window.utils.formatPrice(total);
    
    // Guardar totales
    orderData.totals = { subtotal, shipping, tax, total };
    
    // Actualizar items del resumen
    updateCheckoutItems();
}

function updateCheckoutItems() {
    const container = document.getElementById('checkout-items');
    if (!container) return;
    
    container.innerHTML = orderData.items.map(item => `
        <div class="checkout-item">
            <div class="item-image">${item.icon}</div>
            <div class="item-details">
                <span class="item-name">${item.name}</span>
                <span class="item-quantity">Cantidad: ${item.quantity}</span>
            </div>
            <div class="item-price">${window.utils.formatPrice(item.price * item.quantity)}</div>
        </div>
    `).join('');
}

function updateConfirmationSummary() {
    // Resumen de items
    const itemsContainer = document.getElementById('order-summary-items');
    itemsContainer.innerHTML = orderData.items.map(item => `
        <div class="confirmation-item">
            <span>${item.name} x${item.quantity}</span>
            <span>${window.utils.formatPrice(item.price * item.quantity)}</span>
        </div>
    `).join('');
    
    // Resumen de envío
    const shippingContainer = document.getElementById('shipping-summary');
    const shippingMethod = getShippingMethodName(orderData.shipping.method);
    shippingContainer.innerHTML = `
        <p><strong>${orderData.shipping.firstname} ${orderData.shipping.lastname}</strong></p>
        <p>${orderData.shipping.address}</p>
        <p>${orderData.shipping.city}, ${orderData.shipping.zip}</p>
        <p>${orderData.shipping.country}</p>
        <p><strong>Método:</strong> ${shippingMethod}</p>
    `;
    
    // Resumen de pago
    const paymentContainer = document.getElementById('payment-summary');
    const paymentMethod = getPaymentMethodName(orderData.payment.method);
    paymentContainer.innerHTML = `
        <p><strong>Método:</strong> ${paymentMethod}</p>
        ${orderData.payment.method === 'credit-card' ? 
            `<p><strong>Tarjeta:</strong> **** ${orderData.payment.cardNumber.slice(-4)}</p>` : 
            ''
        }
    `;
    
    // Total
    document.getElementById('confirmation-total').textContent = window.utils.formatPrice(orderData.totals.total);
}

// Finalizar orden
function completeOrder() {
    if (!validateCurrentStep()) return;
    
    saveStepData();
    
    // Simular procesamiento
    window.utils.showToast('Procesando tu pedido...', 'info');
    
    setTimeout(() => {
        // Crear orden
        const order = createOrder();
        
        // Guardar orden
        saveOrder(order);
        
        // Limpiar carrito
        clearCart();
        
        // Mostrar modal de éxito
        showSuccessModal(order);
        
    }, 2000);
}

function createOrder() {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    
    return {
        id: 'PM-' + Date.now(),
        userId: currentUser.id,
        userInfo: {
            firstname: orderData.shipping.firstname,
            lastname: orderData.shipping.lastname,
            email: orderData.shipping.email,
            phone: orderData.shipping.phone
        },
        shipping: orderData.shipping,
        payment: orderData.payment,
        items: orderData.items,
        totals: orderData.totals,
        status: 'completed',
        createdAt: new Date().toISOString(),
        estimatedDelivery: calculateDeliveryDate()
    };
}

function calculateDeliveryDate() {
    const today = new Date();
    let deliveryDays = 5; // estándar
    
    switch (orderData.shipping.method) {
        case 'express':
            deliveryDays = 1;
            break;
        case 'instant':
            deliveryDays = 0;
            break;
    }
    
    today.setDate(today.getDate() + deliveryDays);
    return today.toISOString();
}

function saveOrder(order) {
    let orders = JSON.parse(localStorage.getItem('superpowers_orders')) || [];
    orders.push(order);
    localStorage.setItem('superpowers_orders', JSON.stringify(orders));
}

function clearCart() {
    cart = [];
    localStorage.setItem('superpowers_cart', JSON.stringify(cart));
    updateCartDisplay();
}

function showSuccessModal(order) {
    document.getElementById('order-number').textContent = order.id;
    document.getElementById('delivery-date').textContent = 
        new Date(order.estimatedDelivery).toLocaleDateString('es-PE');
    
    document.getElementById('success-modal').style.display = 'flex';
}

// Funciones helper
function saveStepData() {
    if (currentStep === 1) {
        orderData.shipping = {
            firstname: document.getElementById('shipping-firstname').value,
            lastname: document.getElementById('shipping-lastname').value,
            email: document.getElementById('shipping-email').value,
            phone: document.getElementById('shipping-phone').value,
            address: document.getElementById('shipping-address').value,
            city: document.getElementById('shipping-city').value,
            zip: document.getElementById('shipping-zip').value,
            country: document.getElementById('shipping-country').value,
            method: document.querySelector('input[name="delivery-method"]:checked').value
        };
    }
    
    if (currentStep === 2) {
        const method = document.querySelector('.payment-tab.active').getAttribute('data-method');
        orderData.payment.method = method;
        
        if (method === 'credit-card') {
            orderData.payment.cardNumber = document.getElementById('card-number').value;
            orderData.payment.cardExpiry = document.getElementById('card-expiry').value;
            orderData.payment.cardCvc = document.getElementById('card-cvc').value;
            orderData.payment.cardName = document.getElementById('card-name').value;
        }
    }
}

function getShippingMethodName(method) {
    const methods = {
        'standard': 'Entrega Estándar (3-5 días)',
        'express': 'Entrega Express (24 horas)',
        'instant': 'Entrega Instantánea'
    };
    return methods[method] || method;
}

function getPaymentMethodName(method) {
    const methods = {
        'credit-card': 'Tarjeta de Crédito',
        'qr': 'Código QR',
        'crypto': 'Cripto-Energía'
    };
    return methods[method] || method;
}

function validateCheckoutEmail(email) {
    if (!email) return;
    
    if (!window.utils.isValidEmail(email)) {
        window.utils.showToast('Email inválido', 'error');
        return false;
    }
    
    return true;
}

// Funciones del modal de éxito
function viewOrder() {
    // En una implementación real, redirigiría a la página de detalle de orden
    window.location.href = 'user-profile.html';
}

function goHome() {
    window.location.href = '../index.html';
}

// Funciones del carrito
function updateCartDisplay() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

// Hacer funciones globales
window.goToStep = goToStep;
window.switchPaymentMethod = switchPaymentMethod;
window.copyCryptoAddress = copyCryptoAddress;
window.completeOrder = completeOrder;
window.viewOrder = viewOrder;
window.goHome = goHome;