// js/admin-dashboard.js - Lógica para el dashboard de administración

let adminData = {
    period: 'month',
    stats: {},
    charts: {}
};

document.addEventListener('DOMContentLoaded', function() {
    initializeAdminDashboard();
});

function initializeAdminDashboard() {
    // Verificar permisos de administrador
    if (!checkAdminPermissions()) {
        return;
    }
    
    // Cargar datos del dashboard
    loadDashboardData();
    
    // Configurar event listeners
    setupAdminEventListeners();
    
    console.log('👑 Dashboard de administración inicializado');
}

function checkAdminPermissions() {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    
    if (!currentUser) {
        redirectToLogin();
        return false;
    }
    
    if (currentUser.role !== 'admin') {
        window.utils.showToast('No tienes permisos de administrador', 'error');
        setTimeout(() => {
            window.location.href = '../../index.html';
        }, 2000);
        return false;
    }
    
    // Actualizar bienvenida
    const welcomeElement = document.getElementById('admin-welcome');
    if (welcomeElement) {
        welcomeElement.textContent = `Bienvenido, Admin ${currentUser.firstname}`;
    }
    
    return true;
}

function loadDashboardData() {
    showLoading(true);
    
    // Simular carga de datos
    setTimeout(() => {
        // Cargar estadísticas
        loadDashboardStats();
        
        // Cargar gráficos
        loadChartsData();
        
        // Cargar actividad reciente
        loadRecentActivity();
        
        // Cargar alertas del sistema
        loadSystemAlerts();
        
        // Actualizar badges del sidebar
        updateSidebarBadges();
        
        showLoading(false);
        
    }, 1000);
}

function loadDashboardStats() {
    const allOrders = JSON.parse(localStorage.getItem('superpowers_orders')) || [];
    const allUsers = JSON.parse(localStorage.getItem('superpowers_users')) || [];
    const allProducts = products.filter(p => p.stock > 0);
    
    // Filtrar por período
    const filteredOrders = filterOrdersByPeriod(allOrders, adminData.period);
    const filteredUsers = filterUsersByPeriod(allUsers, adminData.period);
    
    // Calcular métricas
    const totalRevenue = calculateTotalRevenue(filteredOrders);
    const totalOrders = filteredOrders.length;
    const totalUsers = filteredUsers.length;
    const totalProducts = allProducts.length;
    
    // Calcular cambios porcentuales (simulado)
    const revenueChange = calculatePercentageChange(totalRevenue, 10000);
    const ordersChange = calculatePercentageChange(totalOrders, 50);
    const usersChange = calculatePercentageChange(totalUsers, 30);
    const productsChange = calculatePercentageChange(totalProducts, 40);
    
    // Actualizar UI
    document.getElementById('total-revenue').textContent = window.utils.formatPrice(totalRevenue);
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('total-products').textContent = totalProducts;
    
    document.getElementById('revenue-change').textContent = `${revenueChange > 0 ? '+' : ''}${revenueChange}%`;
    document.getElementById('orders-change').textContent = `${ordersChange > 0 ? '+' : ''}${ordersChange}%`;
    document.getElementById('users-change').textContent = `${usersChange > 0 ? '+' : ''}${usersChange}%`;
    document.getElementById('products-change').textContent = `${productsChange > 0 ? '+' : ''}${productsChange}%`;
    
    // Guardar datos
    adminData.stats = {
        revenue: totalRevenue,
        orders: totalOrders,
        users: totalUsers,
        products: totalProducts,
        changes: {
            revenue: revenueChange,
            orders: ordersChange,
            users: usersChange,
            products: productsChange
        }
    };
}

function loadChartsData() {
    // Cargar productos más vendidos
    loadTopProducts();
    
    // En una implementación real, aquí cargaríamos datos para gráficos reales
}

function loadTopProducts() {
    const allOrders = JSON.parse(localStorage.getItem('superpowers_orders')) || [];
    const productSales = {};
    
    // Contar ventas por producto
    allOrders.forEach(order => {
        if (order.status === 'completed') {
            order.items.forEach(item => {
                if (!productSales[item.id]) {
                    productSales[item.id] = {
                        product: item,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[item.id].quantity += item.quantity;
                productSales[item.id].revenue += item.price * item.quantity;
            });
        }
    });
    
    // Convertir a array y ordenar por cantidad
    const topProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    
    // Actualizar UI
    const container = document.getElementById('top-products');
    if (topProducts.length === 0) {
        container.innerHTML = '<p class="no-data">No hay datos de ventas</p>';
        return;
    }
    
    container.innerHTML = topProducts.map((item, index) => `
        <div class="top-product-item">
            <div class="product-rank">#${index + 1}</div>
            <div class="product-icon">${item.product.icon}</div>
            <div class="product-info">
                <div class="product-name">${item.product.name}</div>
                <div class="product-stats">
                    <span class="stat">${item.quantity} vendidos</span>
                    <span class="stat">${window.utils.formatPrice(item.revenue)}</span>
                </div>
            </div>
            <div class="product-trend">
                <span class="trend-up">↑</span>
            </div>
        </div>
    `).join('');
}

function loadRecentActivity() {
    const allOrders = JSON.parse(localStorage.getItem('superpowers_orders')) || [];
    const recentActivities = [];
    
    // Agregar órdenes recientes
    allOrders.slice(0, 10).forEach(order => {
        recentActivities.push({
            type: 'order',
            title: `Nueva orden #${order.id}`,
            description: `${order.items.length} poder(es) - ${window.utils.formatPrice(order.totals.total)}`,
            time: order.createdAt,
            icon: '📦'
        });
    });
    
    // Agregar usuarios nuevos (simulado)
    const allUsers = JSON.parse(localStorage.getItem('superpowers_users')) || [];
    allUsers.slice(0, 5).forEach(user => {
        if (user.role !== 'admin') {
            recentActivities.push({
                type: 'user',
                title: `Nuevo usuario registrado`,
                description: `${user.firstname} ${user.lastname}`,
                time: user.createdAt,
                icon: '👤'
            });
        }
    });
    
    // Ordenar por fecha
    recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    // Mostrar solo las 6 más recientes
    const recent = recentActivities.slice(0, 6);
    
    // Actualizar UI
    const container = document.getElementById('recent-activity');
    container.innerHTML = recent.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-desc">${activity.description}</div>
                <div class="activity-time">${window.utils.formatDate(activity.time)}</div>
            </div>
        </div>
    `).join('');
}

function loadSystemAlerts() {
    const alerts = [];
    const allProducts = products;
    const allOrders = JSON.parse(localStorage.getItem('superpowers_orders')) || [];
    
    // Verificar productos con stock bajo
    const lowStockProducts = allProducts.filter(p => p.stock > 0 && p.stock <= 3);
    if (lowStockProducts.length > 0) {
        alerts.push({
            type: 'warning',
            title: 'Stock bajo',
            message: `${lowStockProducts.length} producto(s) con stock crítico`,
            icon: '⚠️',
            action: 'Gestionar stock'
        });
    }
    
    // Verificar órdenes pendientes
    const pendingOrders = allOrders.filter(o => o.status === 'pending');
    if (pendingOrders.length > 0) {
        alerts.push({
            type: 'info',
            title: 'Órdenes pendientes',
            message: `${pendingOrders.length} orden(es) esperando procesamiento`,
            icon: '📦',
            action: 'Revisar órdenes'
        });
    }
    
    // Alertas del sistema (simuladas)
    alerts.push({
        type: 'success',
        title: 'Sistema estable',
        message: 'Todos los servicios funcionan correctamente',
        icon: '✅',
        action: 'Ver estado'
    });
    
    // Actualizar UI
    const container = document.getElementById('system-alerts');
    container.innerHTML = alerts.map(alert => `
        <div class="alert-item alert-${alert.type}">
            <div class="alert-icon">${alert.icon}</div>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-message">${alert.message}</div>
            </div>
            <button class="btn-alert" onclick="handleAlertAction('${alert.type}')">
                ${alert.action}
            </button>
        </div>
    `).join('');
}

// Funciones de utilidad
function filterOrdersByPeriod(orders, period) {
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
        case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        case 'quarter':
            startDate.setMonth(now.getMonth() - 3);
            break;
        case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        default:
            return orders; // Todos los períodos
    }
    
    return orders.filter(order => new Date(order.createdAt) >= startDate);
}

function filterUsersByPeriod(users, period) {
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
        case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        case 'quarter':
            startDate.setMonth(now.getMonth() - 3);
            break;
        case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        default:
            return users;
    }
    
    return users.filter(user => new Date(user.createdAt) >= startDate);
}

function calculateTotalRevenue(orders) {
    return orders.reduce((total, order) => {
        return total + (order.totals?.total || 0);
    }, 0);
}

function calculatePercentageChange(current, previous) {
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
}

function updateSidebarBadges() {
    const allOrders = JSON.parse(localStorage.getItem('superpowers_orders')) || [];
    const allUsers = JSON.parse(localStorage.getItem('superpowers_users')) || [];
    
    const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
    const totalUsers = allUsers.filter(u => u.role !== 'admin').length;
    
    document.getElementById('pending-orders-badge').textContent = pendingOrders;
    document.getElementById('total-users-badge').textContent = totalUsers;
}

// Funciones de UI
function setupAdminEventListeners() {
    // Botones de cambio de gráfico
    const chartButtons = document.querySelectorAll('.btn-chart');
    chartButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            switchChart(this.getAttribute('data-chart'));
        });
    });
}

function switchChart(chartType) {
    // Desactivar todos los botones
    document.querySelectorAll('.btn-chart').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activar botón seleccionado
    document.querySelector(`.btn-chart[data-chart="${chartType}"]`).classList.add('active');
    
    // En una implementación real, aquí cambiaríamos el gráfico
    window.utils.showToast(`Mostrando gráfico de ${chartType}`, 'info');
}

function updateDashboard() {
    const periodSelect = document.getElementById('date-range');
    adminData.period = periodSelect.value;
    
    if (adminData.period === 'custom') {
        // En una implementación real, mostraríamos un selector de fechas
        window.utils.showToast('Selecciona un rango de fechas personalizado', 'info');
        return;
    }
    
    loadDashboardData();
}

function showLoading(show) {
    const loadingElement = document.getElementById('admin-loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'flex' : 'none';
    }
}

// Funciones de acciones
function exportReport() {
    const reportData = {
        generatedAt: new Date().toISOString(),
        period: adminData.period,
        stats: adminData.stats,
        products: products.length,
        users: JSON.parse(localStorage.getItem('superpowers_users') || '[]').length,
        orders: JSON.parse(localStorage.getItem('superpowers_orders') || '[]').length
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `powermarket-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    window.utils.showToast('Reporte exportado exitosamente', 'success');
}

function viewAllActivity() {
    window.utils.showToast('Redirigiendo a la página de actividad completa', 'info');
    // En una implementación real, redirigiría a una página de actividad
}

function handleAlertAction(alertType) {
    switch (alertType) {
        case 'warning':
            window.location.href = 'products.html';
            break;
        case 'info':
            window.location.href = 'orders.html';
            break;
        default:
            window.utils.showToast('Acción ejecutada', 'info');
    }
}

function redirectToLogin() {
    window.utils.showToast('Debes iniciar sesión como administrador', 'error');
    setTimeout(() => {
        window.location.href = '../login.html';
    }, 2000);
}

// Logout
function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('current_user');
        localStorage.removeItem('remember_session');
        window.utils.showToast('Sesión cerrada correctamente', 'success');
        
        setTimeout(() => {
            window.location.href = '../../index.html';
        }, 1000);
    }
}

// Hacer funciones globales
window.updateDashboard = updateDashboard;
window.exportReport = exportReport;
window.viewAllActivity = viewAllActivity;
window.handleAlertAction = handleAlertAction;
window.logout = logout;