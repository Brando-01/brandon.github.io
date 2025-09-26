// js/data.js - Datos mock para la tienda de superpoderes

// Categorías de superpoderes
const categories = [
    {
        id: 1,
        name: "Poderes Elementales",
        description: "Control sobre los elementos de la naturaleza",
        icon: "🔥",
        image: "elemental.jpg",
        featured: true,
        productCount: 15
    },
    {
        id: 2,
        name: "Poderes Mentales",
        description: "Habilidades psíquicas y control mental",
        icon: "🧠",
        image: "mental.jpg",
        featured: true,
        productCount: 12
    },
    {
        id: 3,
        name: "Poderes Físicos",
        description: "Mejoras corporales y habilidades físicas",
        icon: "💪",
        image: "physical.jpg",
        featured: true,
        productCount: 18
    },
    {
        id: 4,
        name: "Transformación",
        description: "Cambio de forma y metamorfosis",
        icon: "🦸‍♂️",
        image: "transformation.jpg",
        featured: false,
        productCount: 8
    },
    {
        id: 5,
        name: "Teletransportación",
        description: "Movimiento instantáneo through el espacio",
        icon: "⚡",
        image: "teleportation.jpg",
        featured: false,
        productCount: 6
    },
    {
        id: 6,
        name: "Poderes Especiales",
        description: "Habilidades únicas y exclusivas",
        icon: "✨",
        image: "special.jpg",
        featured: false,
        productCount: 10
    }
];

// 50 Superpoderes mock
const products = [
    // PODERES ELEMENTALES (15)
    {
        id: 1,
        name: "Control del Fuego - Nivel Avanzado",
        price: 2499.99,
        originalPrice: 2999.99,
        category: "elementales",
        description: "Control completo sobre llamas y temperatura. Incluye inmunidad al fuego.",
        icon: "🔥",
        image: "fire-control.jpg",
        rarity: "epic",
        level: "Avanzado",
        duration: "Permanente",
        requirements: "Ninguno",
        featured: true,
        bestSeller: true,
        new: false,
        stock: 5,
        rating: 4.8
    },
    {
        id: 2,
        name: "Manipulación del Agua Pro",
        price: 2199.99,
        category: "elementales",
        description: "Creación y control de cuerpos de agua. Incluye respiración acuática.",
        icon: "💧",
        image: "water-control.jpg",
        rarity: "rare",
        level: "Intermedio",
        duration: "Permanente",
        requirements: "Ninguno",
        featured: true,
        bestSeller: true,
        new: false,
        stock: 8,
        rating: 4.6
    },
    {
        id: 3,
        name: "Dominio de la Tierra",
        price: 1899.99,
        category: "elementales",
        description: "Control sobre rocas, tierra y minerales. Creación de terremotos menores.",
        icon: "🌋",
        image: "earth-control.jpg",
        rarity: "rare",
        level: "Intermedio",
        duration: "Permanente",
        featured: false,
        bestSeller: false,
        new: true,
        stock: 12,
        rating: 4.4
    },
    {
        id: 4,
        name: "Control del Aire Supremo",
        price: 1999.99,
        category: "elementales",
        description: "Manipulación de vientos y tormentas. Vuelo básico incluido.",
        icon: "💨",
        image: "air-control.jpg",
        rarity: "rare",
        level: "Intermedio",
        duration: "Permanente",
        featured: false,
        bestSeller: true,
        new: false,
        stock: 7,
        rating: 4.7
    },
    {
        id: 5,
        name: "Manipulación del Rayo",
        price: 2799.99,
        category: "elementales",
        description: "Generación y control de energía eléctrica. Velocidad aumentada.",
        icon: "⚡",
        image: "lightning-control.jpg",
        rarity: "epic",
        level: "Avanzado",
        duration: "Permanente",
        featured: true,
        bestSeller: false,
        new: true,
        stock: 3,
        rating: 4.9
    },
    {
        id: 6,
        name: "Control del Hielo Elite",
        price: 1699.99,
        category: "elementales",
        description: "Congelación y manipulación de hielo. Resistencia al frío extremo.",
        icon: "❄️",
        image: "ice-control.jpg",
        rarity: "rare",
        level: "Intermedio",
        duration: "Permanente",
        featured: false,
        bestSeller: false,
        new: false,
        stock: 10,
        rating: 4.3
    },

    // PODERES MENTALES (12)
    {
        id: 7,
        name: "Telequinesis Pro",
        price: 3299.99,
        category: "mentales",
        description: "Movimiento de objetos con la mente. Capacidad de levitación.",
        icon: "📦",
        image: "telekinesis.jpg",
        rarity: "epic",
        level: "Avanzado",
        duration: "Permanente",
        featured: true,
        bestSeller: true,
        new: false,
        stock: 4,
        rating: 4.8
    },
    {
        id: 8,
        name: "Telepatía Avanzada",
        price: 2899.99,
        category: "mentales",
        description: "Lectura de mentes y comunicación silenciosa. Blindaje mental incluido.",
        icon: "🧠",
        image: "telepathy.jpg",
        rarity: "epic",
        level: "Avanzado",
        duration: "Permanente",
        featured: true,
        bestSeller: false,
        new: true,
        stock: 6,
        rating: 4.7
    },
    {
        id: 9,
        name: "Ilusionismo Maestro",
        price: 2199.99,
        category: "mentales",
        description: "Creación de ilusiones realistas. Manipulación perceptiva.",
        icon: "🎭",
        image: "illusion.jpg",
        rarity: "rare",
        level: "Intermedio",
        duration: "Permanente",
        featured: false,
        bestSeller: true,
        new: false,
        stock: 9,
        rating: 4.5
    },

    // PODERES FÍSICOS (18)
    {
        id: 10,
        name: "Super Fuerza Titanio",
        price: 1899.99,
        category: "fisicos",
        description: "Fuerza sobrehumana. Levantamiento de hasta 50 toneladas.",
        icon: "💪",
        image: "super-strength.jpg",
        rarity: "rare",
        level: "Intermedio",
        duration: "Permanente",
        featured: true,
        bestSeller: true,
        new: false,
        stock: 15,
        rating: 4.6
    },
    {
        id: 11,
        name: "Velocidad Relámpago",
        price: 2399.99,
        category: "fisicos",
        description: "Movimiento a velocidades supersónicas. Reflejos mejorados.",
        icon: "⚡",
        image: "super-speed.jpg",
        rarity: "epic",
        level: "Avanzado",
        duration: "Permanente",
        featured: true,
        bestSeller: true,
        new: false,
        stock: 8,
        rating: 4.9
    },
    {
        id: 12,
        name: "Vuelo Supersónico",
        price: 2999.99,
        category: "fisicos",
        description: "Vuelo libre a velocidades increíbles. Campo de fuerza incluido.",
        icon: "🦸‍♂️",
        image: "flight.jpg",
        rarity: "epic",
        level: "Avanzado",
        duration: "Permanente",
        featured: true,
        bestSeller: true,
        new: true,
        stock: 5,
        rating: 4.8
    },

    // ... (continuaría con más productos hasta llegar a 50)

    // Ejemplos adicionales de diferentes categorías
    {
        id: 25,
        name: "Invisibilidad Temporal",
        price: 1799.99,
        category: "transformacion",
        description: "Desaparición completa por hasta 1 hora. Sensor térmico incluido.",
        icon: "👻",
        image: "invisibility.jpg",
        rarity: "rare",
        level: "Intermedio",
        duration: "Temporal",
        featured: false,
        bestSeller: false,
        new: true,
        stock: 11,
        rating: 4.4
    },
    {
        id: 26,
        name: "Teletransporte Instantáneo",
        price: 3499.99,
        category: "teleportacion",
        description: "Transporte a cualquier lugar visible. Límite de 100km por uso.",
        icon: "🌀",
        image: "teleport.jpg",
        rarity: "legendary",
        level: "Maestro",
        duration: "Permanente",
        featured: true,
        bestSeller: false,
        new: false,
        stock: 2,
        rating: 5.0
    }
];

// Carrito de compras
let cart = JSON.parse(localStorage.getItem('superpowers_cart')) || [];

// Usuario actual
let currentUser = JSON.parse(localStorage.getItem('current_user')) || null;

// Órdenes de compra
let orders = JSON.parse(localStorage.getItem('superpowers_orders')) || [];

// Datos para el panel de administración
const adminStats = {
    totalUsers: 1542,
    totalOrders: 8923,
    totalRevenue: 12543000,
    activeProducts: 50
};

// Función para obtener productos por categoría
function getProductsByCategory(categoryName) {
    return products.filter(product => product.category === categoryName);
}

// Función para obtener productos destacados
function getFeaturedProducts() {
    return products.filter(product => product.featured);
}

// Función para obtener los más vendidos
function getBestSellers() {
    return products.filter(product => product.bestSeller);
}

// Función para obtener productos nuevos
function getNewProducts() {
    return products.filter(product => product.new);
}

// Función para buscar productos
function searchProducts(query) {
    const lowerQuery = query.toLowerCase();
    return products.filter(product => 
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery)
    );
}