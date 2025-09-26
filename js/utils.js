// js/utils.js - Funciones utilitarias y helpers

// Formatear precio con símbolo de moneda
function formatPrice(price) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    }).format(price);
}

// Formatear rating con estrellas
function formatRating(rating) {
    const stars = '⭐'.repeat(Math.floor(rating));
    const halfStar = rating % 1 >= 0.5 ? '⭐' : '';
    return stars + halfStar + ` (${rating})`;
}

// Generar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validar contraseña (mínimo 6 caracteres)
function isValidPassword(password) {
    return password.length >= 6;
}

// Mostrar notificación toast
function showToast(message, type = 'info') {
    // Crear elemento toast si no existe
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            max-width: 300px;
        `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // Estilos del toast
    toast.style.cssText = `
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem;
        margin-bottom: 0.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
    `;

    toast.querySelector('.toast-content').style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;

    toast.querySelector('.toast-close').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: 1rem;
    `;

    toastContainer.appendChild(toast);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

// Animación slideIn para toasts
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Debounce para búsquedas
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Filtrar y ordenar productos
function filterAndSortProducts(products, filters = {}, sortBy = 'name') {
    let filteredProducts = [...products];

    // Aplicar filtros
    if (filters.category && filters.category !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
            product.category === filters.category
        );
    }

    if (filters.minPrice) {
        filteredProducts = filteredProducts.filter(product => 
            product.price >= parseFloat(filters.minPrice)
        );
    }

    if (filters.maxPrice) {
        filteredProducts = filteredProducts.filter(product => 
            product.price <= parseFloat(filters.maxPrice)
        );
    }

    if (filters.rarity && filters.rarity !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
            product.rarity === filters.rarity
        );
    }

    // Ordenar productos
    switch (sortBy) {
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
        default:
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filteredProducts;
}

// Paginación
function paginateItems(items, currentPage, itemsPerPage) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const totalPages = Math.ceil(items.length / itemsPerPage);

    return {
        items: items.slice(startIndex, endIndex),
        currentPage,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
    };
}

// Calcular total del carrito
function calculateCartTotal(cartItems) {
    return cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
}

// Guardar en localStorage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error guardando en localStorage:', error);
        return false;
    }
}

// Cargar desde localStorage
function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error cargando desde localStorage:', error);
        return null;
    }
}

// Validar formulario
function validateForm(formData, rules) {
    const errors = {};

    for (const [field, rule] of Object.entries(rules)) {
        const value = formData[field];
        
        if (rule.required && (!value || value.trim() === '')) {
            errors[field] = `${field} es requerido`;
            continue;
        }

        if (rule.minLength && value.length < rule.minLength) {
            errors[field] = `${field} debe tener al menos ${rule.minLength} caracteres`;
            continue;
        }

        if (rule.maxLength && value.length > rule.maxLength) {
            errors[field] = `${field} no puede tener más de ${rule.maxLength} caracteres`;
            continue;
        }

        if (rule.type === 'email' && !isValidEmail(value)) {
            errors[field] = 'Email inválido';
            continue;
        }

        if (rule.type === 'password' && !isValidPassword(value)) {
            errors[field] = 'La contraseña debe tener al menos 6 caracteres';
            continue;
        }

        if (rule.match && value !== formData[rule.match]) {
            errors[field] = `Los campos no coinciden`;
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

// Generar código QR aleatorio (simulado)
function generateQRCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Formatear fecha
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-PE', options);
}

// Calcular días hasta la expiración
function daysUntilExpiry(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Obtener rareza en español
function getRaritySpanish(rarity) {
    const rarityMap = {
        'common': 'Común',
        'rare': 'Raro',
        'epic': 'Épico',
        'legendary': 'Legendario'
    };
    return rarityMap[rarity] || rarity;
}

// Obtener nivel en español
function getLevelSpanish(level) {
    const levelMap = {
        'basic': 'Básico',
        'intermediate': 'Intermedio',
        'advanced': 'Avanzado',
        'master': 'Maestro'
    };
    return levelMap[level] || level;
}

// Exportar funciones para uso global
window.utils = {
    formatPrice,
    formatRating,
    generateId,
    isValidEmail,
    isValidPassword,
    showToast,
    debounce,
    filterAndSortProducts,
    paginateItems,
    calculateCartTotal,
    saveToLocalStorage,
    loadFromLocalStorage,
    validateForm,
    generateQRCode,
    formatDate,
    daysUntilExpiry,
    getRaritySpanish,
    getLevelSpanish
};