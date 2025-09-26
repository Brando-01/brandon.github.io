// js/components.js - Componentes reutilizables para la interfaz

// Componente de tarjeta de producto
function createProductCard(product) {
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = hasDiscount 
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0;

    return `
        <div class="product-card" data-product-id="${product.id}">
            ${product.new ? '<span class="badge badge-new">Nuevo</span>' : ''}
            ${product.bestSeller ? '<span class="badge badge-hot">Más Vendido</span>' : ''}
            ${hasDiscount ? `<span class="badge badge-sale">-${discountPercent}%</span>` : ''}
            
            <div class="product-image">
                ${product.icon}
            </div>
            
            <h3>${product.name}</h3>
            <p class="product-description">${product.description}</p>
            
            <div class="product-meta">
                <span class="product-rarity rarity-${product.rarity}">
                    ${window.utils.getRaritySpanish(product.rarity)}
                </span>
                <span class="product-level">Nivel ${window.utils.getLevelSpanish(product.level)}</span>
            </div>
            
            <div class="product-price">
                ${window.utils.formatPrice(product.price)}
                ${hasDiscount ? 
                    `<span class="original-price">${window.utils.formatPrice(product.originalPrice)}</span>` 
                    : ''
                }
            </div>
            
            <div class="product-rating">
                ${window.utils.formatRating(product.rating)}
            </div>
            
            <div class="product-stock">
                ${product.stock > 5 ? 
                    '<span style="color: var(--success-color);">✓ En stock</span>' :
                    product.stock > 0 ?
                    `<span style="color: var(--accent-color);">⚠️ Últimas ${product.stock} unidades</span>` :
                    '<span style="color: var(--error-color);">✗ Agotado</span>'
                }
            </div>
            
            <div class="product-actions">
                <button class="btn btn-primary btn-small" onclick="addToCart(${product.id})" 
                    ${product.stock === 0 ? 'disabled' : ''}>
                    🛒 Agregar
                </button>
                <button class="btn btn-outline btn-small" onclick="viewProductDetail(${product.id})">
                    👀 Ver Detalles
                </button>
            </div>
        </div>
    `;
}

// Componente de tarjeta de categoría
function createCategoryCard(category) {
    return `
        <div class="category-card" data-category-id="${category.id}">
            <div class="category-image">
                ${category.icon}
            </div>
            <div class="category-info">
                <h3>${category.name}</h3>
                <p>${category.description}</p>
                <span class="category-count">${category.productCount} poderes disponibles</span>
                <button class="btn btn-primary" onclick="viewCategory('${category.name}')">
                    Explorar Poderes
                </button>
            </div>
        </div>
    `;
}

// Componente de panel de categoría
function createCategoryPanel(category) {
    return `
        <div class="category-panel">
            <div class="category-panel-image">
                ${category.icon}
            </div>
            <div class="category-panel-info">
                <h3>${category.name}</h3>
                <p>${category.description}</p>
                <div class="panel-stats">
                    <span>📊 ${category.productCount} poderes</span>
                    <span>⭐ Nuevos poderes semanales</span>
                </div>
                <button class="btn btn-primary" onclick="viewCategory('${category.name}')">
                    Descubrir Poderes ${category.icon}
                </button>
            </div>
        </div>
    `;
}

// Componente de item del carrito
function createCartItem(item) {
    return `
        <div class="cart-item" data-item-id="${item.id}">
            <div class="item-image">
                ${item.icon}
            </div>
            <div class="item-details">
                <h4>${item.name}</h4>
                <p class="item-category">${window.utils.getRaritySpanish(item.rarity)} • Nivel ${window.utils.getLevelSpanish(item.level)}</p>
                <p class="item-price">${window.utils.formatPrice(item.price)} c/u</p>
            </div>
            <div class="item-quantity">
                <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
            <div class="item-total">
                ${window.utils.formatPrice(item.price * item.quantity)}
            </div>
            <div class="item-actions">
                <button class="btn-icon" onclick="moveToSaved(${item.id})" title="Guardar para después">
                    💾
                </button>
                <button class="btn-icon" onclick="removeFromCart(${item.id})" title="Eliminar">
                    🗑️
                </button>
            </div>
        </div>
    `;
}

// Componente de item guardado
function createSavedItem(item) {
    return `
        <div class="saved-item" data-item-id="${item.id}">
            <div class="item-image">
                ${item.icon}
            </div>
            <div class="item-details">
                <h4>${item.name}</h4>
                <p class="item-category">${window.utils.getRaritySpanish(item.rarity)} • Nivel ${window.utils.getLevelSpanish(item.level)}</p>
                <p class="item-price">${window.utils.formatPrice(item.price)}</p>
            </div>
            <div class="item-actions">
                <button class="btn btn-primary btn-small" onclick="moveToCart(${item.id})">
                    Mover al Carrito
                </button>
                <button class="btn btn-outline btn-small" onclick="removeFromSaved(${item.id})">
                    Eliminar
                </button>
            </div>
        </div>
    `;
}

// Componente de filtros de búsqueda
function createSearchFilters(currentFilters = {}) {
    return `
        <div class="search-filters">
            <h3>Filtrar Poderes</h3>
            
            <div class="filter-group">
                <label for="category-filter">Categoría:</label>
                <select id="category-filter" onchange="applyFilters()">
                    <option value="all">Todas las categorías</option>
                    <option value="elementales" ${currentFilters.category === 'elementales' ? 'selected' : ''}>Elementales</option>
                    <option value="mentales" ${currentFilters.category === 'mentales' ? 'selected' : ''}>Mentales</option>
                    <option value="fisicos" ${currentFilters.category === 'fisicos' ? 'selected' : ''}>Físicos</option>
                    <option value="transformacion" ${currentFilters.category === 'transformacion' ? 'selected' : ''}>Transformación</option>
                    <option value="teleportacion" ${currentFilters.category === 'teleportacion' ? 'selected' : ''}>Teletransportación</option>
                    <option value="especiales" ${currentFilters.category === 'especiales' ? 'selected' : ''}>Especiales</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label for="rarity-filter">Rareza:</label>
                <select id="rarity-filter" onchange="applyFilters()">
                    <option value="all">Todas las rarezas</option>
                    <option value="common" ${currentFilters.rarity === 'common' ? 'selected' : ''}>Común</option>
                    <option value="rare" ${currentFilters.rarity === 'rare' ? 'selected' : ''}>Raro</option>
                    <option value="epic" ${currentFilters.rarity === 'epic' ? 'selected' : ''}>Épico</option>
                    <option value="legendary" ${currentFilters.rarity === 'legendary' ? 'selected' : ''}>Legendario</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label for="price-range">Rango de precio:</label>
                <div class="price-inputs">
                    <input type="number" id="min-price" placeholder="Mínimo" 
                           value="${currentFilters.minPrice || ''}" onchange="applyFilters()">
                    <span>-</span>
                    <input type="number" id="max-price" placeholder="Máximo" 
                           value="${currentFilters.maxPrice || ''}" onchange="applyFilters()">
                </div>
            </div>
            
            <div class="filter-group">
                <label for="sort-by">Ordenar por:</label>
                <select id="sort-by" onchange="applySorting()">
                    <option value="name-asc">Nombre (A-Z)</option>
                    <option value="name-desc">Nombre (Z-A)</option>
                    <option value="price-asc">Precio (Menor a Mayor)</option>
                    <option value="price-desc">Precio (Mayor a Menor)</option>
                    <option value="rating">Mejor Valorados</option>
                </select>
            </div>
            
            <button class="btn btn-outline" onclick="clearFilters()">Limpiar Filtros</button>
        </div>
    `;
}

// Componente de paginación
function createPagination(currentPage, totalPages, onPageChange) {
    if (totalPages <= 1) return '';

    let paginationHTML = '<div class="pagination">';
    
    // Botón anterior
    if (currentPage > 1) {
        paginationHTML += `<button class="page-btn" onclick="${onPageChange}(${currentPage - 1})">← Anterior</button>`;
    }
    
    // Números de página
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<span class="page-current">${i}</span>`;
        } else if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `<button class="page-btn" onclick="${onPageChange}(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += '<span class="page-ellipsis">...</span>';
        }
    }
    
    // Botón siguiente
    if (currentPage < totalPages) {
        paginationHTML += `<button class="page-btn" onclick="${onPageChange}(${currentPage + 1})">Siguiente →</button>`;
    }
    
    paginationHTML += '</div>';
    return paginationHTML;
}

// Componente de header actualizado con carrito
function updateHeaderCart() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartLink = document.getElementById('cart-link');
    if (cartLink) {
        cartLink.innerHTML = `Cinturón de Utilidades (<span id="cart-count">${cartCount}</span>)`;
    }
}

// Componente de modal genérico
function createModal(title, content, buttons = []) {
    const modalId = 'modal-' + Date.now();
    
    const modalHTML = `
        <div id="${modalId}" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="closeModal('${modalId}')">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    ${buttons.map(btn => 
                        `<button class="btn ${btn.class || 'btn-primary'}" onclick="${btn.onclick}">${btn.text}</button>`
                    ).join('')}
                </div>
            </div>
        </div>
    `;
    
    // Agregar modal al body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Estilos del modal
    const style = document.createElement('style');
    style.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s;
        }
        
        .modal-content {
            background: white;
            border-radius: 10px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            animation: slideUp 0.3s;
        }
        
        .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-body {
            padding: 1.5rem;
        }
        
        .modal-footer {
            padding: 1.5rem;
            border-top: 1px solid var(--border-color);
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--text-light);
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from { 
                transform: translateY(50px);
                opacity: 0;
            }
            to { 
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;
    
    if (!document.querySelector('#modal-styles')) {
        style.id = 'modal-styles';
        document.head.appendChild(style);
    }
    
    return modalId;
}

// Función para cerrar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// Componente de loading
function createLoadingSpinner(text = 'Cargando...') {
    return `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>${text}</p>
        </div>
    `;
}

// Añadir estilos para los componentes
const componentStyles = `
    .product-meta {
        display: flex;
        justify-content: space-between;
        margin: 0.5rem 0;
        font-size: 0.9rem;
    }
    
    .product-level {
        color: var(--text-light);
    }
    
    .original-price {
        text-decoration: line-through;
        color: var(--text-light);
        font-size: 1rem;
        margin-left: 0.5rem;
    }
    
    .product-rating {
        margin: 0.5rem 0;
        font-size: 0.9rem;
    }
    
    .product-stock {
        margin: 0.5rem 0;
        font-size: 0.9rem;
        font-weight: 600;
    }
    
    .cart-item, .saved-item {
        display: flex;
        align-items: center;
        padding: 1rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        margin-bottom: 1rem;
        gap: 1rem;
    }
    
    .item-image {
        font-size: 2rem;
        min-width: 60px;
        text-align: center;
    }
    
    .item-details {
        flex: 1;
    }
    
    .item-details h4 {
        margin: 0 0 0.5rem 0;
    }
    
    .item-category {
        color: var(--text-light);
        font-size: 0.9rem;
        margin: 0;
    }
    
    .item-quantity {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .quantity-btn {
        width: 30px;
        height: 30px;
        border: 1px solid var(--border-color);
        background: white;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .quantity {
        min-width: 30px;
        text-align: center;
        font-weight: bold;
    }
    
    .item-total {
        font-weight: bold;
        font-size: 1.1rem;
        min-width: 100px;
        text-align: right;
    }
    
    .item-actions {
        display: flex;
        gap: 0.5rem;
    }
    
    .btn-icon {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.5rem;
    }
    
    .search-filters {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        margin-bottom: 2rem;
    }
    
    .filter-group {
        margin-bottom: 1rem;
    }
    
    .filter-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
    }
    
    .filter-group select, .filter-group input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--border-color);
        border-radius: 4px;
    }
    
    .price-inputs {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .price-inputs input {
        flex: 1;
    }
    
    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        margin: 2rem 0;
    }
    
    .page-btn, .page-current, .page-ellipsis {
        padding: 0.5rem 1rem;
        border: 1px solid var(--border-color);
        background: white;
        border-radius: 4px;
    }
    
    .page-btn {
        cursor: pointer;
    }
    
    .page-btn:hover {
        background: var(--bg-light);
    }
    
    .page-current {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
    }
    
    .loading-spinner {
        text-align: center;
        padding: 2rem;
    }
    
    .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid var(--primary-color);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// Injectar estilos en el documento
const styleSheet = document.createElement('style');
styleSheet.textContent = componentStyles;
document.head.appendChild(styleSheet);

// Exportar componentes para uso global
window.components = {
    createProductCard,
    createCategoryCard,
    createCategoryPanel,
    createCartItem,
    createSavedItem,
    createSearchFilters,
    createPagination,
    updateHeaderCart,
    createModal,
    closeModal,
    createLoadingSpinner
};