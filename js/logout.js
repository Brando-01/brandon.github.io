// js/logout.js - Manejo centralizado del logout

function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Limpiar datos de sesión
        localStorage.removeItem('current_user');
        localStorage.removeItem('remember_session');
        sessionStorage.clear();
        
        // Mostrar confirmación
        if (window.utils && window.utils.showToast) {
            window.utils.showToast('Sesión cerrada correctamente', 'success');
        } else {
            alert('Sesión cerrada correctamente');
        }
        
        // Redirigir después de un breve delay
        setTimeout(() => {
            // Determinar la página de redirección basada en la ubicación actual
            const currentPath = window.location.pathname;
            
            if (currentPath.includes('admin')) {
                window.location.href = '../../index.html';
            } else if (currentPath.includes('pages')) {
                window.location.href = '../index.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 1000);
    }
}

// Hacer la función globalmente disponible
window.logout = logout;

// También agregar un fallback para consola de debugging
console.log('✅ Función logout cargada correctamente');
console.log('🔧 Puedes probarla ejecutando: logout() en la consola');