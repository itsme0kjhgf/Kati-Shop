/* ---
   Kati Shop - script.js
   DEFINITIVE FINAL VERSION - Corrected for Language Switching & Dynamic Images
   --- */

// ================================================================
// --- 1. PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE ---
// ================================================================
const firebaseConfig = {
  apiKey: "AIzaSyAQcGT_DiNs9vSWVQvijr5nQY9lN2H02d8",
  authDomain: "kati-shop-ada69.firebaseapp.com",
  projectId: "kati-shop-ada69",
  storageBucket: "kati-shop-ada69.firebasestorage.app",
  messagingSenderId: "708562069674",
  appId: "1:708562069674:web:9bfb3cb80f7cc8b4b388d3"
};



// ================================================================
// --- 2. CORE APPLICATION (Do not edit below this line) ---
// ================================================================

// --- Initialize Firebase and Global State Variables ---
try {
    firebase.initializeApp(firebaseConfig);
} catch (e) {
    console.error("Firebase initialization failed. Please check your firebaseConfig object.", e);
}
const db = firebase.firestore();

let currentLanguage = 'en';
let productsCache = [];
let currentProductId = null; // Remembers the currently viewed product ID.

const staticTranslations = {
    en: { page_title: 'Kati Shop - Our Collection', nav_home: 'Home', nav_new: 'New Arrivals', nav_clothes: 'Clothes', nav_contact: 'Contact', hero_title: 'Discover Our New Collection', hero_subtitle: 'Timeless designs, sustainably crafted.', quantity: 'Quantity', add_to_cart: 'Add to Cart', alert_added: 'Item added to cart!', back_to_shop: '← Back to Shop', footer_text: '© 2025 Kati Shop. All Rights Reserved.' },
    fr: { page_title: 'Kati Shop - Notre Collection', nav_home: 'Accueil', nav_new: 'Nouveautés', nav_clothes: 'Vêtements', nav_contact: 'Contact', hero_title: 'Découvrez Notre Nouvelle Collection', hero_subtitle: 'Des designs intemporels, fabriqués durablement.', quantity: 'Quantité', add_to_cart: 'Ajouter au panier', alert_added: 'Article ajouté au panier !', back_to_shop: '← Retour à la boutique', footer_text: '© 2025 Kati Shop. Tous droits réservés.' },
    ar: { page_title: 'كاتي شوب - مجموعتنا', nav_home: 'الرئيسية', nav_new: 'وصل حديثاً', nav_clothes: 'ملابس', nav_contact: 'اتصل بنا', hero_title: 'اكتشف مجموعتنا الجديدة', hero_subtitle: 'تصاميم خالدة، مصنوعة بشكل مستدام.', quantity: 'الكمية', add_to_cart: 'أضف إلى السلة', alert_added: 'تمت إضافة المنتج إلى سلتك!', back_to_shop: '→ العودة إلى المتجر', footer_text: '© 2025 كاتي شوب. جميع الحقوق محفوظة.' }
};

// DOM Element References
const languageOverlay = document.getElementById('language-overlay');
const productGridContainer = document.getElementById('product-grid-container');
const productPageContainer = document.getElementById('product-page-container');
const shopPage = document.getElementById('shop-page');
const productPage = document.getElementById('product-page');

// --- DATA & RENDERING LOGIC ---

async function fetchProducts() {
    try {
        const snapshot = await db.collection('products').get();
        productsCache = snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error("Firebase Error: Could not fetch products.", error);
        productGridContainer.innerHTML = `<p style="text-align: center; color: red;">Error: Could not connect to the database.</p>`;
    }
}

function getTranslatedValue(product, key, lang) {
    return product[`${key}_${lang}`] || product[`${key}_en`] || '';
}

function renderProductGrid() {
    productGridContainer.innerHTML = '';
    productsCache.forEach(product => {
        const name = getTranslatedValue(product, 'name', currentLanguage);
        const price = getTranslatedValue(product, 'price', currentLanguage);
        const oldPrice = getTranslatedValue(product, 'old_price', currentLanguage);

        const card = document.createElement('article');
        card.className = 'product-card';
        card.dataset.productId = product.id;
        card.innerHTML = `
            <img src="${product.img_main || 'https://via.placeholder.com/400x500.png?text=Image+Missing'}" alt="${name}">
            <div class="product-info"><h3 class="product-name">${name}</h3><p class="product-price"><span>${price}</span>${oldPrice ? `<span class="old-price">${oldPrice}</span>` : ''}</p></div>
        `;
        productGridContainer.appendChild(card);
    });
}

function renderProductPage(productId) {
    const product = productsCache.find(p => p.id === productId);
    if (!product) { showPage('shop'); return; }
    currentProductId = productId;
    
    const name = getTranslatedValue(product, 'name', currentLanguage);
    const price = getTranslatedValue(product, 'price', currentLanguage);
    const oldPrice = getTranslatedValue(product, 'old_price', currentLanguage);
    const desc = getTranslatedValue(product, 'desc', currentLanguage);
    const thumbnails = [product.img_thumb1, product.img_thumb2, product.img_thumb3, product.img_thumb4].filter(url => url).map((url, index) => `<img class="thumbnail ${index === 0 ? 'active' : ''}" src="${url}" alt="Thumbnail ${index + 1}">`).join('');

    productPageContainer.innerHTML = `
        <a href="#" class="back-to-shop">${staticTranslations[currentLanguage].back_to_shop}</a>
        <div class="product-layout">
            <div class="product-gallery">
                <div class="main-image-container"><img src="${product.img_main || ''}" id="main-product-image"></div>
                <div class="thumbnail-container">${thumbnails}</div>
            </div>
            <div class="product-details">
                <h1 class="product-title">${name}</h1>
                <p class="product-details-price"><span>${price}</span> ${oldPrice ? `<span class="old-price">${oldPrice}</span>` : ''}</p>
                <p class="product-description">${desc}</p>
                <form id="product-form-live"><div class="form-group"><label for="quantity">${staticTranslations[currentLanguage].quantity}</label><input type="number" id="quantity" value="1" min="1"></div><button type="submit" class="add-to-cart-btn">${staticTranslations[currentLanguage].add_to_cart}</button></form>
            </div>
        </div>`;
    showPage('product');
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('kati-shop-language', lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', lang === 'ar');
    document.title = staticTranslations[lang].page_title;
    
    document.querySelectorAll('[data-key]').forEach(elem => {
        elem.textContent = staticTranslations[lang][elem.dataset.key];
    });
    
    if (currentProductId) {
        renderProductPage(currentProductId);
    } else {
        renderProductGrid();
    }
}

function showPage(pageToShow) {
    if (pageToShow === 'shop') { currentProductId = null; }
    shopPage.classList.toggle('hidden', pageToShow !== 'shop');
    productPage.classList.toggle('hidden', pageToShow !== 'product');
    window.scrollTo(0, 0);
}

// --- INITIALIZATION AND EVENT LISTENERS ---

// ** THE BUG FIX IS HERE: **
// This function now correctly decides whether to show the overlay or not.
async function initializeSite() {
    await fetchProducts();
    const savedLang = localStorage.getItem('kati-shop-language');

    if (savedLang) {
        // For a RETURNING user: apply their language and hide the overlay.
        languageOverlay.style.display = 'none';
        setLanguage(savedLang);
    } else {
        // For a FIRST-TIME user: show the overlay and wait for them to choose.
        languageOverlay.style.display = 'flex';
        setLanguage('en'); // Show English in the background by default
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeSite();

    document.querySelectorAll('.lang-btn').forEach(btn => btn.addEventListener('click', () => {
        setLanguage(btn.dataset.lang);
        languageOverlay.style.display = 'none'; // Hide overlay AFTER they choose.
    }));
    document.getElementById('change-lang-btn').addEventListener('click', () => {
        languageOverlay.style.display = 'flex'; // Allow them to change it again.
    });

    document.querySelector('.logo').addEventListener('click', (e) => { e.preventDefault(); showPage('shop'); });
    document.querySelector('[data-key="nav_home"]').addEventListener('click', (e) => { e.preventDefault(); showPage('shop'); });
    
    productGridContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (card) renderProductPage(card.dataset.productId);
    });
    
    productPageContainer.addEventListener('click', e => {
        if (e.target.closest('.back-to-shop')) { e.preventDefault(); showPage('shop'); }
        if (e.target.closest('#product-form-live')) {
            e.preventDefault();
            if (e.target.tagName === 'BUTTON') alert(staticTranslations[currentLanguage].alert_added);
        }
        if (e.target.classList.contains('thumbnail')) {
            document.getElementById('main-product-image').src = e.target.src;
            productPageContainer.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
        }
    });
});