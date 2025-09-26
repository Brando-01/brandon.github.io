// js/main.js - Lógica principal de la aplicación

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Cargar datos del carrito desde localStorage
    loadCartFromStorage();
    
    // Actualizar el header con la cantidad del carrito
    updateCartDisplay();
    
    // Cargar las secciones de la landing page
    loadFeaturedCategories();
    loadBestSellers();
    loadNewCategories();
    loadNewProducts();
    
    // Configurar event listeners
    setupEventListeners();
    
    console.log('🚀 PowerMarket inicializado correctamente');
}

// Cargar carrito desde localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('superpowers_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Actualizar display del carrito
function updateCartDisplay() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

// Cargar categorías destacadas
function loadFeaturedCategories() {
    const featuredContainer = document.getElementById('featured-categories');
    if (!featuredContainer) return;
    
    const featuredCategories = categories.filter(cat => cat.featured).slice(0, 3);
    
    if (featuredCategories.length === 0) {
        featuredContainer.innerHTML = '<p>No hay categorías destacadas disponibles.</p>';
        return;
    }
    
    featuredContainer.innerHTML = featuredCategories.map(category => 
        window.components.createCategoryCard(category)
    ).join('');
}

// Cargar productos más vendidos
function loadBestSellers() {
    const bestSellersContainer = document.getElementById('best-sellers');
    if (!bestSellersContainer) return;
    
    const bestSellers = getBestSellers().slice(0, 12);
    
    if (bestSellers.length === 0) {
        bestSellersContainer.innerHTML = '<p>No hay productos más vendidos disponibles.</p>';
        return;
    }
    
    bestSellersContainer.innerHTML = bestSellers.map(product => 
        window.components.createProductCard(product)
    ).join('');
}

// Cargar nuevas categorías
function loadNewCategories() {
    const newCategoriesContainer = document.getElementById('new-categories');
    if (!newCategoriesContainer) return;
    
    const newCategories = categories.filter(cat => !cat.featured).slice(0, 3);
    
    if (newCategories.length === 0) {
        newCategoriesContainer.innerHTML = '<p>No hay nuevas categorías disponibles.</p>';
        return;
    }
    
    newCategoriesContainer.innerHTML = newCategories.map(category => 
        window.components.createCategoryPanel(category)
    ).join('');
}

// Cargar productos nuevos
function loadNewProducts() {
    const newProductsContainer = document.getElementById('new-products');
    if (!newProductsContainer) return;
    
    const newProducts = getNewProducts().slice(0, 6);
    
    if (newProducts.length === 0) {
        newProductsContainer.innerHTML = '<p>No hay productos nuevos disponibles.</p>';
        return;
    }
    
    newProductsContainer.innerHTML = newProducts.map(product => 
        window.components.createProductCard(product)
    ).join('');
}

// Configurar event listeners
function setupEventListeners() {
    // Búsqueda desde el input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Búsqueda en tiempo real con debounce
        searchInput.addEventListener('input', window.utils.debounce(function() {
            if (searchInput.value.length >= 3) {
                performSearch();
            }
        }, 500));
    }
    
    // Navegación por categorías
    const categoryLinks = document.querySelectorAll('[data-category]');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            viewCategory(category);
        });
    });
}

// Función de búsqueda
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput ? searchInput.value.trim() : '';
    
    if (query.length === 0) {
        window.utils.showToast('Ingresa un término de búsqueda', 'error');
        return;
    }
    
    // Guardar la búsqueda en sessionStorage para la página de resultados
    sessionStorage.setItem('lastSearchQuery', query);
    
    // Redirigir a la página de resultados de búsqueda
    window.location.href = 'pages/search-results.html';
}

// Ver categoría específica
function viewCategory(categoryName) {
    // Guardar la categoría seleccionada para la página de resultados
    sessionStorage.setItem('selectedCategory', categoryName);
    
    // Redirigir a la página de resultados de búsqueda
    window.location.href = 'pages/search-results.html';
}

// Ver detalle de producto
function viewProductDetail(productId) {
    // Guardar el ID del producto para la página de detalle
    sessionStorage.setItem('selectedProductId', productId);
    
    // Redirigir a la página de detalle de producto
    window.location.href = 'pages/product-detail.html';
}

// Agregar al carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        window.utils.showToast('Producto no encontrado', 'error');
        return;
    }
    
    if (product.stock === 0) {
        window.utils.showToast('Este poder está agotado', 'error');
        return;
    }
    
    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            window.utils.showToast('No hay más unidades disponibles', 'error');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    
    // Guardar en localStorage
    localStorage.setItem('superpowers_cart', JSON.stringify(cart));
    
    // Actualizar display
    updateCartDisplay();
    
    window.utils.showToast(`¡${product.name} agregado al cinturón de utilidades!`, 'success');
    
    // Actualizar el botón si es necesario
    updateProductButton(productId);
}

// Actualizar botón de producto después de agregar al carrito
function updateProductButton(productId) {
    const product = products.find(p => p.id === productId);
    const productElement = document.querySelector(`[data-product-id="${productId}"]`);
    
    if (productElement && product) {
        const addButton = productElement.querySelector('button');
        if (addButton && product.stock === 0) {
            addButton.disabled = true;
            addButton.textContent = 'Agotado';
        }
    }
}

// Funciones auxiliares para obtener datos (definidas en data.js)
function getBestSellers() {
    return products.filter(product => product.bestSeller);
}

function getNewProducts() {
    return products.filter(product => product.new);
}

// Verificar si el usuario está logueado
function checkAuth() {
    return currentUser !== null;
}

// Redirigir al login si no está autenticado
function requireAuth() {
    if (!checkAuth()) {
        window.utils.showToast('Debes iniciar sesión para acceder a esta función', 'error');
        setTimeout(() => {
            window.location.href = 'pages/login.html';
        }, 1500);
        return false;
    }
    return true;
}

// Cerrar sesión
function logout() {
    currentUser = null;
    localStorage.removeItem('current_user');
    window.utils.showToast('Sesión cerrada correctamente', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Función para simular una compra (para testing)
function simulatePurchase() {
    if (cart.length === 0) {
        window.utils.showToast('El carrito está vacío', 'error');
        return;
    }
    
    if (!requireAuth()) return;
    
    // Crear orden
    const order = {
        id: window.utils.generateId(),
        userId: currentUser.id,
        items: [...cart],
        total: window.utils.calculateCartTotal(cart),
        status: 'completed',
        createdAt: new Date().toISOString()
    };
    
    // Guardar orden
    orders.push(order);
    localStorage.setItem('superpowers_orders', JSON.stringify(orders));
    
    // Limpiar carrito
    cart = [];
    localStorage.setItem('superpowers_cart', JSON.stringify(cart));
    updateCartDisplay();
    
    window.utils.showToast('¡Compra realizada exitosamente!', 'success');
}

// Inicializar algunas funciones globales para debugging
window.debug = {
    getCart: () => cart,
    getProducts: () => products,
    getCategories: () => categories,
    addTestProduct: (productId = 1) => addToCart(productId),
    clearCart: () => {
        cart = [];
        localStorage.setItem('superpowers_cart', JSON.stringify(cart));
        updateCartDisplay();
        window.utils.showToast('Carrito limpiado', 'success');
    }
};

console.log('🔧 Funciones de debug disponibles en window.debug');
// Función para verificar autenticación y actualizar UI
function checkAuthStatus() {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    const userAccountElement = document.getElementById('user-account');
    
    if (currentUser && userAccountElement) {
        userAccountElement.textContent = `👤 ${currentUser.firstname}`;
        userAccountElement.href = 'pages/user-profile.html';
        
        // Si es admin, mostrar enlace al dashboard
        if (currentUser.role === 'admin') {
            const adminLink = document.createElement('a');
            adminLink.href = 'pages/admin/dashboard.html';
            adminLink.textContent = '⚙️ Admin';
            adminLink.style.marginLeft = '1rem';
            userAccountElement.parentNode.appendChild(adminLink);
        }
    }
}

// Actualizar la función initializeApp para incluir verificación de auth
function initializeApp() {
    // Cargar datos del carrito desde localStorage
    loadCartFromStorage();
    
    // Actualizar el header con la cantidad del carrito
    updateCartDisplay();
    
    // Verificar y actualizar estado de autenticación
    checkAuthStatus();
    
    // Cargar las secciones de la landing page
    loadFeaturedCategories();
    loadBestSellers();
    loadNewCategories();
    loadNewProducts();
    
    // Configurar event listeners
    setupEventListeners();
    
    console.log('🚀 PowerMarket inicializado correctamente');
}

// Función de logout global
function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('current_user');
        localStorage.removeItem('remember_session');
        window.utils.showToast('Sesión cerrada correctamente', 'success');
        
        setTimeout(() => {
            window.location.href = 'pages/login.html';
        }, 1000);
    }
}

// Agregar logout a las exportaciones globales
window.logout = logout;