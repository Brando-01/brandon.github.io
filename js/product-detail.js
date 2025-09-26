// js/product-detail.js - Lógica para la página de detalle de producto

let currentProduct = null;
let currentQuantity = 1;

document.addEventListener('DOMContentLoaded', function() {
    initializeProductDetail();
});

function initializeProductDetail() {
    // Cargar datos del carrito
    loadCartFromStorage();
    updateCartDisplay();
    
    // Cargar el producto
    loadProductDetail();
    
    // Configurar event listeners
    setupDetailEventListeners();
}

function loadProductDetail() {
    const productId = parseInt(sessionStorage.getItem('selectedProductId'));
    
    if (!productId) {
        showError('No se seleccionó ningún producto');
        return;
    }
    
    currentProduct = products.find(p => p.id === productId);
    
    if (!currentProduct) {
        showError('Producto no encontrado');
        return;
    }
    
    displayProductDetail();
    loadRelatedProducts();
}

function displayProductDetail() {
    if (!currentProduct) return;
    
    // Actualizar título de la página
    document.title = `${currentProduct.name} - PowerMarket`;
    
    // Actualizar breadcrumb
    updateBreadcrumb();
    
    // Actualizar información básica
    document.getElementById('product-title').textContent = currentProduct.name;
    document.getElementById('main-product-image').innerHTML = currentProduct.icon;
    document.getElementById('product-description').textContent = currentProduct.description;
    document.getElementById('product-requirements').textContent = currentProduct.requirements || 'Ninguno requerido';
    
    // Actualizar badges
    updateProductBadges();
    
    // Actualizar precio
    updatePricing();
    
    // Actualizar meta información
    updateMetaInfo();
    
    // Actualizar rating
    updateRating();
    
    // Actualizar botón de agregar al carrito
    updateAddToCartButton();
}

function updateBreadcrumb() {
    const categoryElement = document.getElementById('breadcrumb-category');
    const currentElement = document.getElementById('breadcrumb-current');
    
    if (categoryElement) {
        categoryElement.textContent = getCategoryName(currentProduct.category);
        categoryElement.href = `search-results.html?category=${currentProduct.category}`;
    }
    
    if (currentElement) {
        currentElement.textContent = currentProduct.name;
    }
}

function updateProductBadges() {
    const badgesContainer = document.getElementById('product-badges');
    if (!badgesContainer) return;
    
    let badgesHTML = '';
    
    if (currentProduct.new) {
        badgesHTML += '<span class="badge badge-new">Nuevo</span>';
    }
    
    if (currentProduct.bestSeller) {
        badgesHTML += '<span class="badge badge-hot">Más Vendido</span>';
    }
    
    if (currentProduct.rarity) {
        badgesHTML += `<span class="badge rarity-${currentProduct.rarity}">${window.utils.getRaritySpanish(currentProduct.rarity)}</span>`;
    }
    
    badgesContainer.innerHTML = badgesHTML;
}

function updatePricing() {
    const currentPriceElement = document.getElementById('current-price');
    const originalPriceElement = document.getElementById('original-price');
    const discountBadgeElement = document.getElementById('discount-badge');
    
    if (currentPriceElement) {
        currentPriceElement.textContent = window.utils.formatPrice(currentProduct.price);
    }
    
    const hasDiscount = currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price;
    
    if (hasDiscount && originalPriceElement) {
        originalPriceElement.textContent = window.utils.formatPrice(currentProduct.originalPrice);
        originalPriceElement.style.display = 'block';
        
        const discountPercent = Math.round((1 - currentProduct.price / currentProduct.originalPrice) * 100);
        if (discountBadgeElement) {
            discountBadgeElement.textContent = `-${discountPercent}% OFF`;
            discountBadgeElement.style.display = 'inline-block';
        }
    } else {
        if (originalPriceElement) originalPriceElement.style.display = 'none';
        if (discountBadgeElement) discountBadgeElement.style.display = 'none';
    }
}

function updateMetaInfo() {
    document.getElementById('meta-rarity').textContent = window.utils.getRaritySpanish(currentProduct.rarity);
    document.getElementById('meta-level').textContent = window.utils.getLevelSpanish(currentProduct.level);
    document.getElementById('meta-duration').textContent = currentProduct.duration;
    
    const stockElement = document.getElementById('meta-stock');
    if (stockElement) {
        if (currentProduct.stock > 10) {
            stockElement.textContent = 'Disponible';
            stockElement.style.color = 'var(--success-color)';
        } else if (currentProduct.stock > 0) {
            stockElement.textContent = `Últimas ${currentProduct.stock} unidades`;
            stockElement.style.color = 'var(--accent-color)';
        } else {
            stockElement.textContent = 'Agotado';
            stockElement.style.color = 'var(--error-color)';
        }
    }
}

function updateRating() {
    const ratingElement = document.getElementById('product-rating');
    if (ratingElement) {
        ratingElement.innerHTML = window.utils.formatRating(currentProduct.rating);
    }
}

function updateAddToCartButton() {
    const button = document.getElementById('add-to-cart-btn');
    if (!button) return;
    
    if (currentProduct.stock === 0) {
        button.disabled = true;
        button.textContent = '🛑 Agotado';
        button.style.opacity = '0.6';
    } else {
        button.disabled = false;
        button.textContent = '🛒 Agregar al Cinturón';
        button.style.opacity = '1';
    }
}

function loadRelatedProducts() {
    const relatedContainer = document.getElementById('related-products');
    if (!relatedContainer) return;
    
    // Obtener productos de la misma categoría (excluyendo el actual)
    const relatedProducts = products
        .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
        .slice(0, 4);
    
    if (relatedProducts.length === 0) {
        relatedContainer.innerHTML = '<p>No hay productos relacionados disponibles.</p>';
        return;
    }
    
    relatedContainer.innerHTML = relatedProducts.map(product => 
        window.components.createProductCard(product)
    ).join('');
}

// Funciones de cantidad
function increaseQuantity() {
    const maxQuantity = Math.min(currentProduct.stock, 10);
    if (currentQuantity < maxQuantity) {
        currentQuantity++;
        updateQuantityDisplay();
    }
}

function decreaseQuantity() {
    if (currentQuantity > 1) {
        currentQuantity--;
        updateQuantityDisplay();
    }
}

function updateQuantityDisplay() {
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        quantityInput.value = currentQuantity;
    }
}

// Funciones de acciones
function addToCartFromDetail() {
    if (!currentProduct) return;
    
    if (currentProduct.stock === 0) {
        window.utils.showToast('Este poder está agotado', 'error');
        return;
    }
    
    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === currentProduct.id);
    
    if (existingItem) {
        const newQuantity = existingItem.quantity + currentQuantity;
        if (newQuantity > currentProduct.stock) {
            window.utils.showToast('No hay suficientes unidades disponibles', 'error');
            return;
        }
        existingItem.quantity = newQuantity;
    } else {
        cart.push({
            ...currentProduct,
            quantity: currentQuantity,
            addedAt: new Date().toISOString()
        });
    }
    
    // Guardar en localStorage
    localStorage.setItem('superpowers_cart', JSON.stringify(cart));
    
    // Actualizar display
    updateCartDisplay();
    
    window.utils.showToast(
        `¡${currentQuantity} ${currentProduct.name} agregado(s) al cinturón de utilidades!`, 
        'success'
    );
    
    // Resetear cantidad
    currentQuantity = 1;
    updateQuantityDisplay();
}

function addToWishlist() {
    if (!currentProduct) return;
    
    // Simular guardado en lista de deseos
    let wishlist = JSON.parse(localStorage.getItem('superpowers_wishlist')) || [];
    
    if (!wishlist.find(item => item.id === currentProduct.id)) {
        wishlist.push({
            ...currentProduct,
            savedAt: new Date().toISOString()
        });
        localStorage.setItem('superpowers_wishlist', JSON.stringify(wishlist));
        window.utils.showToast('¡Poder guardado para después!', 'success');
    } else {
        window.utils.showToast('Este poder ya está en tu lista', 'info');
    }
}

// Funciones helper
function setupDetailEventListeners() {
    // Input de cantidad
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        quantityInput.addEventListener('change', function() {
            const value = parseInt(this.value);
            const maxQuantity = Math.min(currentProduct.stock, 10);
            
            if (isNaN(value) || value < 1) {
                currentQuantity = 1;
            } else if (value > maxQuantity) {
                currentQuantity = maxQuantity;
            } else {
                currentQuantity = value;
            }
            
            updateQuantityDisplay();
        });
    }
    
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

function getCategoryName(categorySlug) {
    const categoryMap = {
        'elementales': 'Poderes Elementales',
        'mentales': 'Poderes Mentales', 
        'fisicos': 'Poderes Físicos',
        'transformacion': 'Transformación',
        'teleportacion': 'Teletransportación',
        'especiales': 'Poderes Especiales'
    };
    return categoryMap[categorySlug] || categorySlug;
}

function showError(message) {
    const container = document.querySelector('.product-detail-container');
    if (container) {
        container.innerHTML = `
            <div class="error-state">
                <h2>🚫 Error</h2>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="window.location.href='search-results.html'">
                    Volver a la Búsqueda
                </button>
            </div>
        `;
    }
}

// Funciones del carrito
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('superpowers_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function updateCartDisplay() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

// Hacer funciones globales
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.addToCartFromDetail = addToCartFromDetail;
window.addToWishlist = addToWishlist;
window.performSearch = performSearch;
window.viewProductDetailFromList = viewProductDetailFromList; 
// Función para manejar la navegación desde páginas de listado
function viewProductDetailFromList(productId) {
    sessionStorage.setItem('selectedProductId', productId);
    window.location.href = 'product-detail.html';
}