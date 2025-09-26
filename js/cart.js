// js/cart.js - Lógica para la página del carrito

let savedItems = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeCartPage();
});

function initializeCartPage() {
    // Cargar datos del carrito y guardados
    loadCartFromStorage();
    loadSavedItemsFromStorage();
    
    // Actualizar displays
    updateCartDisplay();
    displayCartContent();
    displaySavedItems();
    loadRecommendedProducts();
    
    // Configurar event listeners
    setupCartEventListeners();
}

function displayCartContent() {
    const emptyCartElement = document.getElementById('empty-cart');
    const cartWithItemsElement = document.getElementById('cart-with-items');
    const cartItemsContainer = document.getElementById('cart-items-container');
    
    if (cart.length === 0) {
        // Mostrar carrito vacío
        emptyCartElement.style.display = 'block';
        cartWithItemsElement.style.display = 'none';
        return;
    }
    
    // Mostrar carrito con items
    emptyCartElement.style.display = 'none';
    cartWithItemsElement.style.display = 'block';
    
    // Renderizar items del carrito
    cartItemsContainer.innerHTML = cart.map(item => 
        window.components.createCartItem(item)
    ).join('');
    
    // Actualizar resumen del pedido
    updateOrderSummary();
}

function displaySavedItems() {
    const savedContainer = document.getElementById('saved-items-container');
    const emptySavedElement = document.getElementById('empty-saved');
    
    if (!savedContainer || !emptySavedElement) return;
    
    if (savedItems.length === 0) {
        savedContainer.style.display = 'none';
        emptySavedElement.style.display = 'block';
        return;
    }
    
    savedContainer.style.display = 'block';
    emptySavedElement.style.display = 'none';
    
    savedContainer.innerHTML = savedItems.map(item => 
        window.components.createSavedItem(item)
    ).join('');
}

function updateOrderSummary() {
    const subtotal = window.utils.calculateCartTotal(cart);
    const tax = subtotal * 0.18; // 18% de impuestos
    const total = subtotal + tax;
    
    // Actualizar montos en la UI
    document.getElementById('subtotal-amount').textContent = window.utils.formatPrice(subtotal);
    document.getElementById('tax-amount').textContent = window.utils.formatPrice(tax);
    document.getElementById('total-amount').innerHTML = `<strong>${window.utils.formatPrice(total)}</strong>`;
}

// Funciones de gestión del carrito
function updateCartQuantity(productId, newQuantity) {
    const cartItem = cart.find(item => item.id === productId);
    
    if (!cartItem) return;
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    if (newQuantity > cartItem.stock) {
        window.utils.showToast('No hay suficientes unidades disponibles', 'error');
        return;
    }
    
    cartItem.quantity = newQuantity;
    saveCartToStorage();
    displayCartContent();
    updateCartDisplay();
}

function removeFromCart(productId) {
    const product = products.find(p => p.id === productId);
    cart = cart.filter(item => item.id !== productId);
    
    saveCartToStorage();
    displayCartContent();
    updateCartDisplay();
    
    if (product) {
        window.utils.showToast(`${product.name} removido del cinturón`, 'info');
    }
}

function moveToSaved(productId) {
    const cartItem = cart.find(item => item.id === productId);
    
    if (!cartItem) return;
    
    // Remover del carrito
    removeFromCart(productId);
    
    // Agregar a guardados (si no existe ya)
    if (!savedItems.find(item => item.id === productId)) {
        savedItems.push({
            ...cartItem,
            savedAt: new Date().toISOString()
        });
        saveSavedItemsToStorage();
        displaySavedItems();
        
        window.utils.showToast('Poder guardado para después', 'success');
    }
}

function moveToCart(productId) {
    const savedItem = savedItems.find(item => item.id === productId);
    
    if (!savedItem) return;
    
    // Remover de guardados
    savedItems = savedItems.filter(item => item.id !== productId);
    saveSavedItemsToStorage();
    displaySavedItems();
    
    // Agregar al carrito
    const existingCartItem = cart.find(item => item.id === productId);
    
    if (existingCartItem) {
        if (existingCartItem.quantity + 1 > savedItem.stock) {
            window.utils.showToast('No hay suficientes unidades disponibles', 'error');
            return;
        }
        existingCartItem.quantity += 1;
    } else {
        cart.push({
            ...savedItem,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    
    saveCartToStorage();
    displayCartContent();
    updateCartDisplay();
    
    window.utils.showToast('Poder movido al cinturón', 'success');
}

function removeFromSaved(productId) {
    const savedItem = savedItems.find(item => item.id === productId);
    savedItems = savedItems.filter(item => item.id !== productId);
    
    saveSavedItemsToStorage();
    displaySavedItems();
    
    if (savedItem) {
        window.utils.showToast('Poder removido de guardados', 'info');
    }
}

// Funciones de navegación y checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        window.utils.showToast('El carrito está vacío', 'error');
        return;
    }
    
    // Verificar stock antes de proceder
    const outOfStockItems = cart.filter(item => {
        const product = products.find(p => p.id === item.id);
        return product && item.quantity > product.stock;
    });
    
    if (outOfStockItems.length > 0) {
        window.utils.showToast('Algunos poderes no tienen suficiente stock', 'error');
        return;
    }
    
    // Redirigir al checkout
    window.location.href = 'checkout.html';
}

function continueShopping() {
    window.location.href = 'search-results.html';
}

function loadRecommendedProducts() {
    const recommendedContainer = document.getElementById('recommended-products');
    if (!recommendedContainer) return;
    
    // Recomendar productos de categorías similares a las del carrito
    const cartCategories = [...new Set(cart.map(item => item.category))];
    
    let recommendedProducts = [];
    
    if (cartCategories.length > 0) {
        // Productos de las mismas categorías (excluyendo los que ya están en el carrito)
        recommendedProducts = products.filter(product => 
            cartCategories.includes(product.category) && 
            !cart.find(item => item.id === product.id)
        );
    } else {
        // Si el carrito está vacío, mostrar productos populares
        recommendedProducts = products.filter(product => product.bestSeller);
    }
    
    // Tomar máximo 4 productos
    recommendedProducts = recommendedProducts.slice(0, 4);
    
    if (recommendedProducts.length === 0) {
        recommendedContainer.innerHTML = '<p>No hay productos recomendados en este momento.</p>';
        return;
    }
    
    recommendedContainer.innerHTML = recommendedProducts.map(product => 
        window.components.createProductCard(product)
    ).join('');
}

// Funciones de almacenamiento
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('superpowers_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function loadSavedItemsFromStorage() {
    const saved = localStorage.getItem('superpowers_wishlist');
    if (saved) {
        savedItems = JSON.parse(saved);
    }
}

function saveCartToStorage() {
    localStorage.setItem('superpowers_cart', JSON.stringify(cart));
}

function saveSavedItemsToStorage() {
    localStorage.setItem('superpowers_wishlist', JSON.stringify(savedItems));
}

function updateCartDisplay() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

// Configurar event listeners
function setupCartEventListeners() {
    // Búsqueda desde el input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

function performSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput ? searchInput.value.trim() : '';
    
    if (query) {
        sessionStorage.setItem('lastSearchQuery', query);
        window.location.href = 'search-results.html';
    }
}

// Función para limpiar todo el carrito (útil para testing)
function clearEntireCart() {
    if (cart.length === 0) {
        window.utils.showToast('El carrito ya está vacío', 'info');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres vaciar todo tu cinturón de utilidades?')) {
        cart = [];
        saveCartToStorage();
        displayCartContent();
        updateCartDisplay();
        window.utils.showToast('Cinturón vaciado completamente', 'success');
    }
}

// Hacer funciones globales
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.moveToSaved = moveToSaved;
window.moveToCart = moveToCart;
window.removeFromSaved = removeFromSaved;
window.proceedToCheckout = proceedToCheckout;
window.continueShopping = continueShopping;
window.performSearch = performSearch;
window.clearEntireCart = clearEntireCart;