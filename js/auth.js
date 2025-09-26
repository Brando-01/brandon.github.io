// js/auth.js - Lógica de autenticación y registro

// Base de datos de usuarios (simulada)
let users = JSON.parse(localStorage.getItem('superpowers_users')) || [
    {
        id: 1,
        firstname: 'Super',
        lastname: 'Admin',
        email: 'admin@powermarket.com',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString(),
        active: true
    }
];

document.addEventListener('DOMContentLoaded', function() {
    initializeAuthPages();
});

function initializeAuthPages() {
    // Verificar si ya está logueado y redirigir
    checkExistingSession();
    
    // Configurar formularios
    setupAuthForms();
    
    // Configurar validaciones en tiempo real
    setupRealTimeValidation();
}

function checkExistingSession() {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (currentUser) {
        // Si ya está logueado, redirigir al inicio
        window.utils.showToast('Ya tienes una sesión activa', 'info');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
    }
}

function setupAuthForms() {
    // Formulario de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Formulario de registro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Botones de redes sociales
    setupSocialAuth();
}

function setupRealTimeValidation() {
    // Validación de email en tiempo real
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateEmail(this.value, this.id + '-error');
        });
    });
    
    // Validación de contraseña en tiempo real
    const passwordInput = document.getElementById('register-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            validatePasswordStrength(this.value);
        });
    }
    
    // Validación de confirmación de contraseña
    const confirmPasswordInput = document.getElementById('register-confirm-password');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('blur', function() {
            validatePasswordMatch();
        });
    }
}

// Manejo de login
function handleLogin(event) {
    event.preventDefault();
    
    const formData = {
        email: document.getElementById('login-email').value.trim(),
        password: document.getElementById('login-password').value
    };
    
    // Validar campos
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
        showValidationErrors(validation.errors);
        return;
    }
    
    // Intentar login
    loginUser(formData.email, formData.password);
}

function validateLoginForm(formData) {
    const errors = {};
    
    if (!formData.email) {
        errors.email = 'El email es requerido';
    } else if (!window.utils.isValidEmail(formData.email)) {
        errors.email = 'Email inválido';
    }
    
    if (!formData.password) {
        errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

function loginUser(email, password) {
    showLoadingState(true);
    
    // Simular delay de red
    setTimeout(() => {
        const user = users.find(u => u.email === email && u.active !== false);
        
        if (!user) {
            showLoadingState(false);
            window.utils.showToast('Usuario no encontrado', 'error');
            showValidationErrors({ email: 'Usuario no registrado' });
            return;
        }
        
        // En un caso real, aquí iría la comparación con hash de contraseña
        if (user.password !== password) {
            showLoadingState(false);
            window.utils.showToast('Contraseña incorrecta', 'error');
            showValidationErrors({ password: 'Contraseña incorrecta' });
            return;
        }
        
        // Login exitoso
        const userSession = {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role,
            loggedInAt: new Date().toISOString()
        };
        
        // Guardar sesión
        localStorage.setItem('current_user', JSON.stringify(userSession));
        
        // Guardar recordar sesión si está marcado
        const rememberMe = document.getElementById('remember-me');
        if (rememberMe && rememberMe.checked) {
            localStorage.setItem('remember_session', 'true');
        }
        
        showLoadingState(false);
        window.utils.showToast(`¡Bienvenido de vuelta, ${user.firstname}!`, 'success');
        
        // Redirigir
        setTimeout(() => {
            const redirectTo = getRedirectUrl();
            window.location.href = redirectTo;
        }, 1000);
        
    }, 1000);
}

// Manejo de registro
function handleRegister(event) {
    event.preventDefault();
    
    const formData = {
        firstname: document.getElementById('register-firstname').value.trim(),
        lastname: document.getElementById('register-lastname').value.trim(),
        email: document.getElementById('register-email').value.trim(),
        password: document.getElementById('register-password').value,
        confirmPassword: document.getElementById('register-confirm-password').value,
        acceptTerms: document.getElementById('accept-terms').checked,
        newsletter: document.getElementById('newsletter').checked
    };
    
    // Validar campos
    const validation = validateRegisterForm(formData);
    if (!validation.isValid) {
        showValidationErrors(validation.errors);
        return;
    }
    
    // Registrar usuario
    registerUser(formData);
}

function validateRegisterForm(formData) {
    const errors = {};
    
    if (!formData.firstname) {
        errors.firstname = 'El nombre es requerido';
    } else if (formData.firstname.length < 2) {
        errors.firstname = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!formData.lastname) {
        errors.lastname = 'El apellido es requerido';
    } else if (formData.lastname.length < 2) {
        errors.lastname = 'El apellido debe tener al menos 2 caracteres';
    }
    
    if (!formData.email) {
        errors.email = 'El email es requerido';
    } else if (!window.utils.isValidEmail(formData.email)) {
        errors.email = 'Email inválido';
    } else if (users.find(u => u.email === formData.email)) {
        errors.email = 'Este email ya está registrado';
    }
    
    if (!formData.password) {
        errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!formData.confirmPassword) {
        errors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    if (!formData.acceptTerms) {
        errors.terms = 'Debes aceptar los términos y condiciones';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

function registerUser(userData) {
    showLoadingState(true);
    
    // Simular delay de red
    setTimeout(() => {
        const newUser = {
            id: window.utils.generateId(),
            firstname: userData.firstname,
            lastname: userData.lastname,
            email: userData.email,
            password: userData.password, // En realidad debería ser hasheada
            role: 'user',
            createdAt: new Date().toISOString(),
            active: true,
            newsletter: userData.newsletter
        };
        
        // Agregar usuario
        users.push(newUser);
        localStorage.setItem('superpowers_users', JSON.stringify(users));
        
        // Iniciar sesión automáticamente
        const userSession = {
            id: newUser.id,
            firstname: newUser.firstname,
            lastname: newUser.lastname,
            email: newUser.email,
            role: newUser.role,
            loggedInAt: new Date().toISOString()
        };
        
        localStorage.setItem('current_user', JSON.stringify(userSession));
        
        showLoadingState(false);
        window.utils.showToast(`¡Cuenta creada exitosamente, ${userData.firstname}!`, 'success');
        
        // Redirigir
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
        
    }, 1500);
}

// Funciones de utilidad
function showLoadingState(show) {
    const submitButtons = document.querySelectorAll('.auth-btn');
    submitButtons.forEach(button => {
        if (show) {
            button.disabled = true;
            button.innerHTML = '⏳ Procesando...';
        } else {
            button.disabled = false;
            button.innerHTML = button.id.includes('login') ? 
                '🚀 Iniciar Sesión Heroica' : '🚀 Crear Cuenta Heroica';
        }
    });
}

function showValidationErrors(errors) {
    // Limpiar errores anteriores
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });
    
    // Mostrar nuevos errores
    Object.keys(errors).forEach(field => {
        const errorElement = document.getElementById(field + '-error');
        if (errorElement) {
            errorElement.textContent = errors[field];
            errorElement.style.display = 'block';
        }
    });
}

function validateEmail(email, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    if (!errorElement) return;
    
    if (!email) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        return;
    }
    
    if (!window.utils.isValidEmail(email)) {
        errorElement.textContent = 'Email inválido';
        errorElement.style.display = 'block';
    } else {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

function validatePasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    let color = '#ef4444';
    let text = 'Débil';
    
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    if (strength >= 75) {
        color = '#10b981';
        text = 'Fuerte';
    } else if (strength >= 50) {
        color = '#f59e0b';
        text = 'Media';
    }
    
    strengthBar.style.width = strength + '%';
    strengthBar.style.background = color;
    strengthText.textContent = `Seguridad: ${text}`;
    strengthText.style.color = color;
}

function validatePasswordMatch() {
    const password = document.getElementById('register-password')?.value;
    const confirmPassword = document.getElementById('register-confirm-password')?.value;
    const errorElement = document.getElementById('confirm-password-error');
    
    if (!errorElement) return;
    
    if (!confirmPassword) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        return;
    }
    
    if (password !== confirmPassword) {
        errorElement.textContent = 'Las contraseñas no coinciden';
        errorElement.style.display = 'block';
    } else {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

function setupSocialAuth() {
    const socialButtons = document.querySelectorAll('.btn-social');
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            window.utils.showToast('Funcionalidad en desarrollo', 'info');
        });
    });
}

function getRedirectUrl() {
    // Verificar si hay una URL de redirección guardada
    const redirectTo = sessionStorage.getItem('redirectAfterLogin');
    if (redirectTo) {
        sessionStorage.removeItem('redirectAfterLogin');
        return redirectTo;
    }
    
    // Redirigir a la página anterior o al inicio
    const referrer = document.referrer;
    if (referrer && referrer.includes('power')) {
        return referrer;
    }
    
    return '../index.html';
}

// Función de logout global
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
window.logout = logout;
// Agregar al final de js/auth.js, antes de las exportaciones

// Mejorar el objeto de usuario con más campos
function enhanceUserRegistration(userData) {
    return {
        id: window.utils.generateId(),
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        password: userData.password,
        role: 'user',
        createdAt: new Date().toISOString(),
        active: true,
        newsletter: userData.newsletter || false,
        notifications: true,
        phone: '',
        // Campos adicionales para el perfil
        stats: {
            orders: 0,
            powers: 0,
            memberSince: new Date().toISOString()
        }
    };
}

// Actualizar la función registerUser para usar el enhanced user
function registerUser(userData) {
    showLoadingState(true);
    
    setTimeout(() => {
        const newUser = enhanceUserRegistration(userData);
        
        // Agregar usuario
        users.push(newUser);
        localStorage.setItem('superpowers_users', JSON.stringify(users));
        
        // Iniciar sesión automáticamente
        const userSession = {
            id: newUser.id,
            firstname: newUser.firstname,
            lastname: newUser.lastname,
            email: newUser.email,
            role: newUser.role,
            loggedInAt: new Date().toISOString(),
            createdAt: newUser.createdAt
        };
        
        localStorage.setItem('current_user', JSON.stringify(userSession));
        
        showLoadingState(false);
        window.utils.showToast(`¡Cuenta creada exitosamente, ${userData.firstname}!`, 'success');
        
        // Redirigir
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
        
    }, 1500);
}