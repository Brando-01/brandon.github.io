// js/search.js - Lógica para la página de resultados de búsqueda (VERSIÓN CORREGIDA)

// Variables globales para la página de búsqueda
let currentFilters = {
    category: 'all',
    rarity: 'all',
    minPrice: '',
    maxPrice: ''
};
let currentSort = 'name-asc';
let currentView = 'grid';
let currentPage = 1;
const itemsPerPage = 12;
let currentResults = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeSearchPage();
});

function initializeSearchPage() {
    // Cargar datos del carrito
    loadCartFromStorage();
    updateCartDisplay();
    
    // Configurar event listeners
    setupSearchEventListeners();
    
    // Procesar la búsqueda
    processSearch();
    
    console.log('🔍 Página de búsqueda inicializada');
}

function setupSearchEventListeners() {
    // Búsqueda desde el input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Navegación por categorías
    const categoryLinks = document.querySelectorAll('[data-category]');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            searchByCategory(category);
        });
    });
}

function processSearch() {
    // Obtener parámetros de búsqueda
    const searchQuery = sessionStorage.getItem('lastSearchQuery') || '';
    const categoryFilter = sessionStorage.getItem('selectedCategory') || '';
    
    // Limpiar sessionStorage después de obtener los valores
    sessionStorage.removeItem('lastSearchQuery');
    sessionStorage.removeItem('selectedCategory');
    
    // Aplicar filtros iniciales
    if (categoryFilter) {
        currentFilters.category = categoryFilter;
        updateSearchTitle(`Poderes de ${getCategoryName(categoryFilter)}`);
    } else if (searchQuery) {
        updateSearchTitle(`Resultados para "${searchQuery}"`);
    }
    
    // Realizar la búsqueda
    performSearchInternal(searchQuery, categoryFilter);
}

function performSearchInternal(query = '', categoryFilter = '') {
    showLoading(true);
    
    setTimeout(() => {
        let results = [];
        
        if (categoryFilter) {
            // Búsqueda por categoría
            results = getProductsByCategory(categoryFilter);
        } else if (query) {
            // Búsqueda por texto
            results = searchProducts(query);
        } else {
            // Mostrar todos los productos si no hay búsqueda
            results = [...products];
        }
        
        currentResults = results;
        currentPage = 1;
        
        displaySearchResults();
        showLoading(false);
        
        // Actualizar contador de resultados
        updateResultsCount(results.length);
        
        // RECONECTAR EVENT LISTENERS después de renderizar
        reconnectProductEventListeners();
        
    }, 500);
}

function displaySearchResults() {
    const resultsContainer = document.getElementById('search-results');
    const noResultsElement = document.getElementById('no-results');
    const paginationContainer = document.getElementById('pagination-container');
    
    if (!resultsContainer) return;
    
    // Aplicar filtros y ordenamiento
    const filteredResults = window.utils.filterAndSortProducts(
        currentResults, 
        currentFilters, 
        currentSort
    );
    
    // Paginar resultados
    const paginated = window.utils.paginateItems(
        filteredResults, 
        currentPage, 
        itemsPerPage
    );
    
    if (paginated.items.length === 0) {
        resultsContainer.style.display = 'none';
        noResultsElement.style.display = 'block';
        paginationContainer.innerHTML = '';
        return;
    }
    
    resultsContainer.style.display = 'grid';
    noResultsElement.style.display = 'none';
    
    // Aplicar modo de vista
    resultsContainer.className = currentView === 'grid' ? 'products-grid' : 'products-list';
    
    // Renderizar resultados
    resultsContainer.innerHTML = paginated.items.map(product => 
        createSearchProductCard(product)
    ).join('');
    
    // Renderizar paginación
    paginationContainer.innerHTML = window.components.createPagination(
        currentPage, 
        paginated.totalPages, 
        'goToPage'
    );
    
    // Cargar filtros si no están cargados
    loadFilters();
}

// NUEVA FUNCIÓN: Crear tarjeta de producto con event listeners específicos
function createSearchProductCard(product) {
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
                <button class="btn btn-primary btn-small search-add-to-cart" data-product-id="${product.id}" 
                    ${product.stock === 0 ? 'disabled' : ''}>
                    🛒 Agregar
                </button>
                <button class="btn btn-outline btn-small search-view-detail" data-product-id="${product.id}">
                    👀 Ver Detalles
                </button>
            </div>
        </div>
    `;
}

// NUEVA FUNCIÓN: Reconectar event listeners para productos dinámicos
function reconnectProductEventListeners() {
    // Event listeners para botones "Agregar al carrito"
    const addToCartButtons = document.querySelectorAll('.search-add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            addToCartFromSearch(productId);
        });
    });
    
    // Event listeners para botones "Ver detalles"
    const viewDetailButtons = document.querySelectorAll('.search-view-detail');
    viewDetailButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            viewProductDetailFromSearch(productId);
        });
    });
}

// NUEVAS FUNCIONES: Manejo de eventos específicos para búsqueda
function addToCartFromSearch(productId) {
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
    updateSearchProductButton(productId);
}

function viewProductDetailFromSearch(productId) {
    // Guardar el ID del producto para la página de detalle
    sessionStorage.setItem('selectedProductId', productId);
    
    // Redirigir a la página de detalle de producto
    window.location.href = 'product-detail.html';
}

function updateSearchProductButton(productId) {
    const product = products.find(p => p.id === productId);
    const productElement = document.querySelector(`[data-product-id="${productId}"]`);
    
    if (productElement && product) {
        const addButton = productElement.querySelector('.search-add-to-cart');
        if (addButton && product.stock === 0) {
            addButton.disabled = true;
            addButton.textContent = 'Agotado';
        }
    }
}

// El resto del código permanece igual...
function loadFilters() {
    const filtersSidebar = document.getElementById('filters-sidebar');
    if (!filtersSidebar || filtersSidebar.innerHTML !== '') return;
    
    filtersSidebar.innerHTML = window.components.createSearchFilters(currentFilters);
}

function updateSearchTitle(title) {
    const titleElement = document.getElementById('search-title');
    if (titleElement) {
        titleElement.textContent = title;
    }
}

function updateResultsCount(count) {
    const countElement = document.getElementById('search-results-count');
    if (countElement) {
        const plural = count === 1 ? 'poder encontrado' : 'poderes encontrados';
        countElement.textContent = `${count} ${plural}`;
    }
}

function showLoading(show) {
    const loadingElement = document.getElementById('loading-spinner');
    const resultsContainer = document.getElementById('search-results');
    
    if (loadingElement && resultsContainer) {
        loadingElement.style.display = show ? 'block' : 'none';
        resultsContainer.style.display = show ? 'none' : 'grid';
    }
}

// Funciones de filtrado y ordenamiento
function applyFilters() {
    currentFilters = {
        category: document.getElementById('category-filter')?.value || 'all',
        rarity: document.getElementById('rarity-filter')?.value || 'all',
        minPrice: document.getElementById('min-price')?.value || '',
        maxPrice: document.getElementById('max-price')?.value || ''
    };
    
    currentPage = 1;
    displaySearchResults();
}

function applySorting() {
    currentSort = document.getElementById('results-sort')?.value || 'name-asc';
    displaySearchResults();
}

function clearFilters() {
    currentFilters = {
        category: 'all',
        rarity: 'all',
        minPrice: '',
        maxPrice: ''
    };
    
    // Resetear controles de UI
    const categoryFilter = document.getElementById('category-filter');
    const rarityFilter = document.getElementById('rarity-filter');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    
    if (categoryFilter) categoryFilter.value = 'all';
    if (rarityFilter) rarityFilter.value = 'all';
    if (minPriceInput) minPriceInput.value = '';
    if (maxPriceInput) maxPriceInput.value = '';
    
    currentPage = 1;
    displaySearchResults();
}

// Funciones de vista y paginación
function setViewMode(mode) {
    currentView = mode;
    
    // Actualizar botones de vista
    const gridBtn = document.getElementById('view-grid');
    const listBtn = document.getElementById('view-list');
    
    if (gridBtn && listBtn) {
        gridBtn.classList.toggle('active', mode === 'grid');
        listBtn.classList.toggle('active', mode === 'list');
    }
    
    displaySearchResults();
}

function goToPage(page) {
    currentPage = page;
    displaySearchResults();
    
    // Scroll to top de resultados
    const resultsContainer = document.getElementById('search-results');
    if (resultsContainer) {
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// Funciones de búsqueda específicas
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput ? searchInput.value.trim() : '';
    
    if (query) {
        sessionStorage.setItem('lastSearchQuery', query);
        sessionStorage.removeItem('selectedCategory');
        window.location.reload();
    }
}

function searchByCategory(category) {
    sessionStorage.setItem('selectedCategory', category);
    sessionStorage.removeItem('lastSearchQuery');
    window.location.reload();
}

// Funciones helper
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

// Funciones del carrito (similares a main.js)
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
window.performSearch = performSearch;
window.applyFilters = applyFilters;
window.applySorting = applySorting;
window.clearFilters = clearFilters;
window.setViewMode = setViewMode;
window.goToPage = goToPage;