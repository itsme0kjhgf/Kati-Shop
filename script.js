/* ---
   Kati Shop - script.js
   FINAL - Connected to Firebase
   --- */

// --- STEP 1: PASTE YOUR FIREBASE CONFIG OBJECT HERE AGAIN ---
const firebaseConfig = {
    apiKey: "AIzaSyAQcGT_DiNs9vSWVQvijr5nQY9lN2H02d8", // Paste your keys here one last time!
    authDomain: "kati-shop-ada69.firebaseapp.com",
    projectId: "kati-shop-ada69",
    storageBucket: "kati-shop-ada69.firebasestorage.app",
    messagingSenderId: "708562069674",
    appId: "1:708562069674:web:9bfb3cb80f7cc8b4b388d3"
};

// --- CORE APP LOGIC ---
// Connect to Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Global state and references
let currentLanguage = 'en';
let productsCache = []; // To store products once fetched
const staticTranslations = { /* Text that does NOT come from the database */
    en: { nav_home: 'Home', nav_new: 'New Arrivals', nav_clothes: 'Clothes', nav_contact: 'Contact', hero_title: 'Discover Our New Collection', hero_subtitle: 'Timeless designs, sustainably crafted.', quantity: 'Quantity', add_to_cart: 'Add to Cart', alert_added: 'Item added to your cart!', back_to_shop: '← Back to Shop', footer_text: '© 2025 Kati Shop. All Rights Reserved.', page_title: 'Kati Shop - Our Collection'},
    fr: { nav_home: 'Accueil', nav_new: 'Nouveautés', nav_clothes: 'Vêtements', nav_contact: 'Contact', hero_title: 'Découvrez Notre Nouvelle Collection', hero_subtitle: 'Des designs intemporels, durablement.', quantity: 'Quantité', add_to_cart: 'Ajouter au panier', alert_added: 'Article ajouté !', back_to_shop: '← Retour', footer_text: '© 2025 Kati Shop. Tous droits réservés.', page_title: 'Kati Shop - Notre Collection'},
    ar: { nav_home: 'الرئيسية', nav_new: 'وصل حديثاً', nav_clothes: 'ملابس', nav_contact: 'اتصل بنا', hero_title: 'اكتشف مجموعتنا الجديدة', hero_subtitle: 'تصاميم خالدة، مصنوعة بشكل مستدام.', quantity: 'الكمية', add_to_cart: 'أضف للسلة', alert_added: 'تمت الإضافة للسلة!', back_to_shop: '→ عودة', footer_text: '© 2025 كاتي شوب. جميع الحقوق محفوظة.', page_title: 'كاتي شوب - مجموعتنا'}
};
const languageOverlay = document.getElementById('language-overlay');
const productGridContainer = document.getElementById('product-grid-container');
const productPage = document.getElementById('product-page');

// Function to fetch products from Firestore
async function fetchProducts() {
    const snapshot = await db.collection('products').get();
    productsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Renders the main product grid
function renderProductGrid() {
    productGridContainer.innerHTML = '';
    for (const product of productsCache) {
        const name = product[`name_${currentLanguage}`] || product.name_en; // Fallback to English
        const price = product[`price_${currentLanguage}`] || product.price_en;
        const oldPrice = product[`old_price_${currentLanguage}`] || product.old_price_en;

        const card = document.createElement('article');
        card.className = 'product-card';
        card.dataset.productId = product.id;
        card.innerHTML = `
            <img src="https://images.unsplash.com/photo-1593030103066-0715de4431d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080" alt="${name}">
            <div class="product-info">
                <h3 class="product-name">${name}</h3>
                <p class="product-price">
                    <span>${price}</span>
                    ${oldPrice ? `<span class="old-price">${oldPrice}</span>` : ''}
                </p>
            </div>
        `;
        productGridContainer.appendChild(card);
    }
}

// Switches view to the detailed product page
function showProductPage(productId) {
    const product = productsCache.find(p => p.id === productId);
    if (!product) return;
    
    // ... logic to render the product detail page ...

    shopPage.classList.add('hidden');
    productPage.classList.remove('hidden');
    window.scrollTo(0, 0);
}

// Sets the language and re-renders everything
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('kati-shop-language', lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', lang === 'ar');
    
    document.title = staticTranslations[lang].page_title;
    document.querySelectorAll('[data-key]').forEach(elem => {
        elem.textContent = staticTranslations[lang][elem.dataset.key];
    });

    renderProductGrid();
}

// ---- INITIALIZATION ----
async function initializeSite() {
    await fetchProducts();
    const savedLang = localStorage.getItem('kati-shop-language') || 'en';
    setLanguage(savedLang);
    languageOverlay.classList.remove('visible'); // Make sure it's hidden
}

// Setup Event Listeners and launch the site
document.addEventListener('DOMContentLoaded', initializeSite);
// Add other listeners for navigation, language switching, etc.
// Example: document.getElementById('change-lang-btn').addEventListener('click', ...);