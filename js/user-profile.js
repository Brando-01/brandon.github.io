// js/user-profile.js - Lógica para el perfil de usuario

let currentUser = null;
let userOrders = [];
let currentOrdersPage = 1;
const ordersPerPage = 5;

document.addEventListener('DOMContentLoaded', function() {
    initializeUserProfile();
});

function initializeUserProfile() {
    // Verificar autenticación
    if (!checkAuthentication()) {
        return;
    }
    
    // Cargar datos del usuario
    loadUserData();
    
    // Cargar datos del perfil
    loadProfileData();
    
    // Configurar event listeners
    setupProfileEventListeners();
    
    console.log('👤 Perfil de usuario inicializado');
}

function checkAuthentication() {
    currentUser = JSON.parse(localStorage.getItem('current_user'));
    
    if (!currentUser) {
        window.utils.showToast('Debes iniciar sesión para acceder a esta página', 'error');
        setTimeout(() => {
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

function loadUserData() {
    // Actualizar datos del carrito
    updateCartDisplay();
}

function loadProfileData() {
    // Cargar órdenes del usuario
    loadUserOrders();
    
    // Cargar información del perfil
    loadProfileInfo();
    
    // Cargar poderes adquiridos
    loadAcquiredPowers();
}

function loadProfileInfo() {
    // Información básica
    document.getElementById('profile-name').textContent = 
        `${currentUser.firstname} ${currentUser.lastname}`;
    document.getElementById('profile-email').textContent = currentUser.email;
    
    // Información personal en settings
    document.getElementById('settings-firstname').value = currentUser.firstname || '';
    document.getElementById('settings-lastname').value = currentUser.lastname || '';
    document.getElementById('settings-email').value = currentUser.email || '';
    document.getElementById('settings-phone').value = currentUser.phone || '';
    
    // Preferencias
    document.getElementById('pref-newsletter').checked = currentUser.newsletter || false;
    document.getElementById('pref-notifications').checked = currentUser.notifications !== false;
    document.getElementById('pref-sms').checked = currentUser.sms || false;
    
    // Fecha de unión
    const joinDateElement = document.getElementById('join-date');
    if (joinDateElement && currentUser.createdAt) {
        joinDateElement.textContent = window.utils.formatDate(currentUser.createdAt);
    }
}

function loadUserOrders() {
    const allOrders = JSON.parse(localStorage.getItem('superpowers_orders')) || [];
    userOrders = allOrders.filter(order => order.userId === currentUser.id);
    
    // Actualizar estadísticas
    updateProfileStats();
    
    // Mostrar órdenes
    displayOrders();
}

function updateProfileStats() {
    // Órdenes completadas
    const completedOrders = userOrders.filter(order => order.status === 'completed').length;
    document.getElementById('stat-orders').textContent = completedOrders;
    
    // Poderes adquiridos (suma de cantidades de todos los pedidos)
    const totalPowers = userOrders.reduce((total, order) => {
        return total + order.items.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);
    document.getElementById('stat-powers').textContent = totalPowers;
    
    // Nivel heroico basado en órdenes
    const memberLevel = getMemberLevel(completedOrders);
    document.getElementById('stat-member').textContent = memberLevel;
    
    // Misión reciente
    displayRecentOrder();
}

function getMemberLevel(orderCount) {
    if (orderCount >= 10) return 'Legendario';
    if (orderCount >= 5) return 'Épico';
    if (orderCount >= 3) return 'Avanzado';
    if (orderCount >= 1) return 'Intermedio';
    return 'Novato';
}

function displayRecentOrder() {
    const recentOrderContainer = document.getElementById('recent-order');
    if (userOrders.length === 0) {
        recentOrderContainer.innerHTML = '<p class="no-data">No hay misiones recientes</p>';
        return;
    }
    
    const recentOrder = userOrders[0]; // La más reciente
    recentOrderContainer.innerHTML = `
        <div class="recent-order">
            <div class="order-header">
                <strong>Misión #${recentOrder.id}</strong>
                <span class="order-status status-${recentOrder.status}">${getOrderStatusText(recentOrder.status)}</span>
            </div>
            <div class="order-date">${window.utils.formatDate(recentOrder.createdAt)}</div>
            <div class="order-total">Total: ${window.utils.formatPrice(recentOrder.totals.total)}</div>
            <button class="btn btn-outline btn-small" onclick="viewOrderDetail('${recentOrder.id}')">
                Ver Detalles
            </button>
        </div>
    `;
}

function displayOrders() {
    const ordersList = document.getElementById('orders-list');
    const paginationContainer = document.getElementById('orders-pagination');
    
    if (userOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="no-orders">
                <div class="no-data-icon">📦</div>
                <h3>¡Aún no tienes misiones!</h3>
                <p>Realiza tu primera compra y comienza tu historial heroico</p>
                <button class="btn btn-primary" onclick="window.location.href='search-results.html'">
                    Explorar Poderes
                </button>
            </div>
        `;
        paginationContainer.innerHTML = '';
        return;
    }
    
    // Aplicar filtros
    const filteredOrders = applyOrderFilters(userOrders);
    
    // Paginar
    const paginated = window.utils.paginateItems(filteredOrders, currentOrdersPage, ordersPerPage);
    
    // Mostrar órdenes
    ordersList.innerHTML = paginated.items.map(order => `
        <div class="order-item" data-order-id="${order.id}">
            <div class="order-main">
                <div class="order-info">
                    <div class="order-id">Misión #${order.id}</div>
                    <div class="order-date">${window.utils.formatDate(order.createdAt)}</div>
                    <div class="order-items">${order.items.length} poder(es)</div>
                </div>
                <div class="order-status">
                    <span class="status-badge status-${order.status}">${getOrderStatusText(order.status)}</span>
                </div>
                <div class="order-total">${window.utils.formatPrice(order.totals.total)}</div>
            </div>
            <div class="order-actions">
                <button class="btn btn-outline btn-small" onclick="viewOrderDetail('${order.id}')">
                    👀 Ver Detalles
                </button>
                ${order.status === 'pending' ? `
                    <button class="btn btn-danger btn-small" onclick="cancelOrder('${order.id}')">
                        🚫 Cancelar
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    // Mostrar paginación
    paginationContainer.innerHTML = window.components.createPagination(
        currentOrdersPage,
        paginated.totalPages,
        'goToOrdersPage'
    );
}

function applyOrderFilters(orders) {
    const statusFilter = document.getElementById('order-status').value;
    const dateFilter = document.getElementById('order-date').value;
    
    let filtered = [...orders];
    
    // Filtrar por estado
    if (statusFilter !== 'all') {
        filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Filtrar por fecha
    if (dateFilter !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateFilter) {
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case '3months':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
        }
        
        filtered = filtered.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate;
        });
    }
    
    // Ordenar por fecha (más reciente primero)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return filtered;
}

function loadAcquiredPowers() {
    const powersGrid = document.getElementById('powers-grid');
    const noPowersElement = document.getElementById('no-powers');
    
    // Obtener todos los poderes adquiridos (de todas las órdenes)
    const acquiredPowers = getAllAcquiredPowers();
    
    if (acquiredPowers.length === 0) {
        powersGrid.style.display = 'none';
        noPowersElement.style.display = 'block';
        return;
    }
    
    powersGrid.style.display = 'grid';
    noPowersElement.style.display = 'none';
    
    powersGrid.innerHTML = acquiredPowers.map(power => `
        <div class="power-card acquired">
            <div class="power-icon">${power.icon}</div>
            <div class="power-info">
                <h4>${power.name}</h4>
                <p class="power-meta">${window.utils.getRaritySpanish(power.rarity)} • Nivel ${window.utils.getLevelSpanish(power.level)}</p>
                <p class="power-acquired">Adquirido: ${window.utils.formatDate(power.acquiredAt)}</p>
            </div>
            <div class="power-actions">
                <button class="btn btn-outline btn-small" onclick="usePower('${power.id}')">
                    🎯 Usar Poder
                </button>
            </div>
        </div>
    `).join('');
}

function getAllAcquiredPowers() {
    const acquiredPowers = [];
    
    userOrders.forEach(order => {
        if (order.status === 'completed') {
            order.items.forEach(item => {
                // Agregar cada unidad como un poder adquirido
                for (let i = 0; i < item.quantity; i++) {
                    acquiredPowers.push({
                        ...item,
                        acquiredAt: order.createdAt,
                        orderId: order.id
                    });
                }
            });
        }
    });
    
    return acquiredPowers;
}

// Navegación entre pestañas
function setupProfileEventListeners() {
    // Tabs del perfil
    const profileTabs = document.querySelectorAll('.profile-tab');
    profileTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            switchProfileTab(this.getAttribute('data-tab'));
        });
    });
    
    // Formularios
    const personalForm = document.getElementById('personal-info-form');
    if (personalForm) {
        personalForm.addEventListener('submit', updatePersonalInfo);
    }
    
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', changePassword);
    }
}

function switchProfileTab(tabName) {
    // Desactivar todas las tabs
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.profile-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Activar tab seleccionada
    document.querySelector(`.profile-tab[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Funciones de órdenes
function filterOrders() {
    currentOrdersPage = 1;
    displayOrders();
}

function goToOrdersPage(page) {
    currentOrdersPage = page;
    displayOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function viewOrderDetail(orderId) {
    sessionStorage.setItem('selectedOrderId', orderId);
    // En una implementación real, redirigiría a una página de detalle de orden
    window.utils.showToast('Funcionalidad en desarrollo', 'info');
}

function cancelOrder(orderId) {
    if (confirm('¿Estás seguro de que quieres cancelar esta misión?')) {
        // Actualizar estado de la orden
        const orders = JSON.parse(localStorage.getItem('superpowers_orders')) || [];
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = 'cancelled';
            localStorage.setItem('superpowers_orders', JSON.stringify(orders));
            
            // Recargar datos
            loadUserOrders();
            window.utils.showToast('Misión cancelada exitosamente', 'success');
        }
    }
}

// Funciones de configuración
function updatePersonalInfo(event) {
    event.preventDefault();
    
    const formData = {
        firstname: document.getElementById('settings-firstname').value,
        lastname: document.getElementById('settings-lastname').value,
        email: document.getElementById('settings-email').value,
        phone: document.getElementById('settings-phone').value
    };
    
    // Validación básica
    if (!formData.firstname || !formData.lastname || !formData.email) {
        window.utils.showToast('Completa todos los campos requeridos', 'error');
        return;
    }
    
    if (!window.utils.isValidEmail(formData.email)) {
        window.utils.showToast('Email inválido', 'error');
        return;
    }
    
    // Actualizar usuario
    const users = JSON.parse(localStorage.getItem('superpowers_users')) || [];
    const userIndex = users.findIndex(user => user.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...formData };
        localStorage.setItem('superpowers_users', JSON.stringify(users));
        
        // Actualizar sesión actual
        currentUser = { ...currentUser, ...formData };
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        
        // Actualizar UI
        loadProfileInfo();
        
        window.utils.showToast('Información actualizada exitosamente', 'success');
    }
}

function changePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validación
    if (!currentPassword || !newPassword || !confirmPassword) {
        window.utils.showToast('Completa todos los campos', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        window.utils.showToast('La nueva contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        window.utils.showToast('Las contraseñas no coinciden', 'error');
        return;
    }
    
    // Verificar contraseña actual (en realidad, esto debería ser con hash)
    const users = JSON.parse(localStorage.getItem('superpowers_users')) || [];
    const user = users.find(user => user.id === currentUser.id);
    
    if (!user || user.password !== currentPassword) {
        window.utils.showToast('Contraseña actual incorrecta', 'error');
        return;
    }
    
    // Actualizar contraseña
    user.password = newPassword; // En realidad, debería hashearse
    localStorage.setItem('superpowers_users', JSON.stringify(users));
    
    // Limpiar formulario
    event.target.reset();
    
    window.utils.showToast('Contraseña cambiada exitosamente', 'success');
}

// Funciones de utilidad
function getOrderStatusText(status) {
    const statusMap = {
        'pending': 'Pendiente',
        'completed': 'Completada',
        'cancelled': 'Cancelada',
        'shipped': 'Enviada'
    };
    return statusMap[status] || status;
}

function usePower(powerId) {
    window.utils.showToast('¡Poder activado! 🚀', 'success');
}

function editAvatar() {
    window.utils.showToast('Funcionalidad en desarrollo', 'info');
}

function exportData() {
    const userData = {
        profile: currentUser,
        orders: userOrders,
        acquiredPowers: getAllAcquiredPowers()
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Crear enlace de descarga
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `powermarket-data-${currentUser.id}.json`;
    link.click();
    
    window.utils.showToast('Datos exportados exitosamente', 'success');
}

function requestAccountDeletion() {
    if (confirm('¿Estás seguro de que quieres solicitar la eliminación de tu cuenta? Esta acción no se puede deshacer.')) {
        window.utils.showToast('Solicitud de eliminación enviada', 'info');
    }
}

// Funciones del carrito
function updateCartDisplay() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

// Logout
function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('current_user');
        localStorage.removeItem('remember_session');
        window.utils.showToast('Sesión cerrada correctamente', 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// Hacer funciones globales
window.switchProfileTab = switchProfileTab;
window.filterOrders = filterOrders;
window.goToOrdersPage = goToOrdersPage;
window.viewOrderDetail = viewOrderDetail;
window.cancelOrder = cancelOrder;
window.usePower = usePower;
window.editAvatar = editAvatar;
window.exportData = exportData;
window.requestAccountDeletion = requestAccountDeletion;
window.logout = logout;