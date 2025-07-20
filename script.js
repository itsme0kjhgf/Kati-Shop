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

// --- Initialize Firebase and Global State ---
try {
    firebase.initializeApp(firebaseConfig);
} catch (e) { console.error("Firebase init failed:", e); }
const db = firebase.firestore();

// Gets the chosen language from the browser's memory, defaulting to 'en'.
let currentLanguage = localStorage.getItem('kati-shop-language') || 'en';

const WHATSAPP_NUMBER = "212630916644"; // Your WhatsApp number

const staticTranslations = {
    en: { page_title: 'Kati Shop', nav_home: 'Home', nav_home_alt: '← Back to Shop', nav_new: 'New Arrivals', hero_title: 'Discover Our Collection', hero_subtitle: 'Timeless designs.', quantity: 'Quantity', sizes_title: 'Available Sizes', order_btn: 'Order via WhatsApp', alert_added: 'Link Ready!', footer_text: '© 2025 Kati Shop.' },
    fr: { page_title: 'Kati Shop', nav_home: 'Accueil', nav_home_alt: '← Retour', nav_new: 'Nouveautés', hero_title: 'Découvrez Notre Collection', hero_subtitle: 'Des designs intemporels.', quantity: 'Quantité', sizes_title: 'Tailles Disponibles', order_btn: 'Commander via WhatsApp', alert_added: 'Lien Prêt!', footer_text: '© 2025 Kati Shop.' },
    ar: { page_title: 'كاتي شوب', nav_home: 'الرئيسية', nav_home_alt: '→ رجوع', nav_new: 'وصل حديثاً', hero_title: 'اكتشف مجموعتنا', hero_subtitle: 'تصاميم خالدة.', quantity: 'الكمية', sizes_title: 'المقاسات المتوفرة', order_btn: 'اطلب عبر واتساب', alert_added: 'الرابط جاهز!', footer_text: '© 2025 كاتي شوب.' }
};

const waMessages = {
    en: "Hello! I'm interested in the product:",
    fr: "Bonjour! Je suis intéressé(e) par le produit :",
    ar: "مرحبا! أنا مهتم بالمنتج:"
};

// --- CORE LOGIC: Check which page we are on ---

document.addEventListener('DOMContentLoaded', () => {
    // This is the router. It checks for a specific element on the page.
    if (document.getElementById('product-grid-container')) {
        runIndexPageLogic(); // Run the code for the main shop page
    } else if (document.getElementById('product-detail-container')) {
        runProductPageLogic(); // Run the code for the product detail page
    }
});


// =====================================================
// --- A) LOGIC FOR THE MAIN SHOP PAGE (index.html) ---
// =====================================================
function runIndexPageLogic() {
    const productGrid = document.getElementById('product-grid-container');
    const languageOverlay = document.querySelector('.language-overlay');
    
    // Renders the grid of product cards
    async function renderProductGrid() {
        productGrid.innerHTML = '<p style="text-align:center;">Loading products...</p>';
        const snapshot = await db.collection('products').orderBy('id').get();
        productGrid.innerHTML = '';
        snapshot.docs.forEach(doc => {
            const product = doc.data();
            const name = product[`name_${currentLanguage}`] || product.name_en;
            const price = product[`price_${currentLanguage}`] || product.price_en;
            const card = document.createElement('a'); // Use an anchor tag for linking
            card.className = 'product-card';
            card.href = `product.html?id=${product.id}`; // The magic link to the product page!
            card.innerHTML = `<img src="${product.img_main || ''}" alt="${name}"><div class="product-info"><h3>${name}</h3><p>${price}</p></div>`;
            productGrid.appendChild(card);
        });
    }

    // Function to translate the page and re-render the grid
    function translateIndexPage(lang) {
        currentLanguage = lang;
        localStorage.setItem('kati-shop-language', lang); // Save choice
        document.documentElement.lang = lang;
        document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
        document.querySelectorAll('[data-key]').forEach(el => el.textContent = staticTranslations[lang][el.dataset.key]);
        renderProductGrid();
    }

    // Initialize the page
    if (!localStorage.getItem('kati-shop-language')) {
        languageOverlay.classList.add('visible');
    }
    translateIndexPage(currentLanguage);

    // Event listeners for this page
    document.querySelectorAll('.lang-btn').forEach(btn => btn.addEventListener('click', () => {
        languageOverlay.classList.remove('visible');
        translateIndexPage(btn.dataset.lang);
    }));
    document.getElementById('change-lang-btn')?.addEventListener('click', () => languageOverlay.classList.add('visible'));
}


// ==============================================================
// --- B) LOGIC FOR THE PRODUCT DETAIL PAGE (product.html) ---
// ==============================================================
async function runProductPageLogic() {
    const productContainer = document.getElementById('product-detail-container');
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) { productContainer.innerHTML = '<h1>Product not found.</h1>'; return; }
    
    const doc = await db.collection('products').doc(productId).get();
    if (!doc.exists) { productContainer.innerHTML = '<h1>Product not found.</h1>'; return; }
    
    const product = doc.data();
    
    // Translate static parts of the page first
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = (currentLanguage === 'ar') ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-key]').forEach(el => el.textContent = staticTranslations[currentLanguage][el.dataset.key]);

    // Get translated values for the product
    const name = product[`name_${currentLanguage}`] || product.name_en;
    const price = product[`price_${currentLanguage}`] || product.price_en;
    const desc = product[`desc_${currentLanguage}`] || product.desc_en;
    document.title = name; // Update the browser tab title
    
    // Build Sizes HTML
    let sizesHTML = '';
    if (product.sizes) {
        const sizesArray = product.sizes.split(',').map(s => s.trim());
        sizesHTML = `<div class="sizes"><h3>${staticTranslations[currentLanguage].sizes_title}</h3><div class="size-buttons">${sizesArray.map(size => `<button class="size-btn">${size}</button>`).join('')}</div></div>`;
    }

    // Build Thumbnails HTML
    const thumbnails = [product.img_thumb1, product.img_thumb2, product.img_thumb3, product.img_thumb4].filter(Boolean);
    const thumbnailsHTML = `<div class="thumbnail-container">${thumbnails.map(url => `<img class="thumbnail" src="${url}" alt="thumb">`).join('')}</div>`;

    // Generate WhatsApp link dynamically
    const baseWaText = waMessages[currentLanguage] || waMessages.en;
    const fullWaText = `${baseWaText} ${name} (${price})`;
    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(fullWaText)}`;

    // Build the final HTML for the page
    productContainer.innerHTML = `
        <div class="product-layout">
            <div class="product-gallery"><div class="main-image-container"><img src="${product.img_main}" id="main-product-image"></div>${thumbnailsHTML}</div>
            <div class="product-details"><h1 class="product-title">${name}</h1><p class="product-details-price">${price}</p><p class="product-description">${desc.replace(/\n/g, '<br>')}</p>${sizesHTML}<a href="${waLink}" class="add-to-cart-btn" target="_blank">${staticTranslations[currentLanguage].order_btn}</a></div>
        </div>
    `;

    // Add event listeners for dynamic content on this page
    productContainer.addEventListener('click', e => {
        if (e.target.classList.contains('thumbnail')) {
            document.getElementById('main-product-image').src = e.target.src;
            productContainer.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
        }
    });
}