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

try {
    firebase.initializeApp(firebaseConfig);
} catch (e) { console.error("Firebase init failed:", e); }
const db = firebase.firestore();

let currentLanguage = localStorage.getItem('kati-shop-language') || 'en';
const WHATSAPP_NUMBER = "212630916644";

const staticTranslations = {
    en: { page_title: 'Kati Shop', nav_home_alt: '← Back to Shop', hero_title: 'Discover Our Collection', sizes_title: 'Available Sizes', order_btn: 'Order via WhatsApp', order_btn_disabled: 'Select a size', size_placeholder: 'Select a Size...', footer_text: '© 2025 Kati Shop.' },
    fr: { page_title: 'Kati Shop', nav_home_alt: '← Retour', hero_title: 'Découvrez Notre Collection', sizes_title: 'Tailles Disponibles', order_btn: 'Commander via WhatsApp', order_btn_disabled: 'Choisissez une taille', size_placeholder: 'Choisissez une taille...', footer_text: '© 2025 Kati Shop.' },
    ar: { page_title: 'كاتي شوب', nav_home_alt: '→ رجوع', hero_title: 'اكتشف مجموعتنا', sizes_title: 'المقاسات المتوفرة', order_btn: 'اطلب عبر واتساب', order_btn_disabled: 'اختر مقاسًا أولاً', size_placeholder: 'اختر مقاس...', footer_text: '© 2025 كاتي شوب.' }
};
const waMessages = {
    en: "Hello! I would like to order the following product:",
    fr: "Bonjour! J'aimerais commander le produit suivant :",
    ar: "مرحبا! أود طلب المنتج التالي:"
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('product-grid-container')) {
        runIndexPageLogic();
    } else if (document.getElementById('product-detail-container')) {
        runProductPageLogic();
    }
});

// =====================================================
// --- A) LOGIC FOR THE MAIN SHOP PAGE (index.html) ---
// =====================================================
function runIndexPageLogic() { /* This function remains the same as before */ }

// ... [The runIndexPageLogic from the previous step is exactly the same and can be copied here if needed,
// but for clarity we will focus on the updated runProductPageLogic]

function runIndexPageLogic() {
    const productGrid = document.getElementById('product-grid-container');
    const languageOverlay = document.querySelector('.language-overlay');
    
    async function renderProductGrid() {
        productGrid.innerHTML = '<p style="text-align:center;">Loading products...</p>';
        const snapshot = await db.collection('products').orderBy('id').get();
        productGrid.innerHTML = '';
        snapshot.docs.forEach(doc => {
            const product = doc.data();
            const name = product[`name_${currentLanguage}`] || product.name_en;
            const price = product[`price_${currentLanguage}`] || product.price_en;
            const card = document.createElement('a'); card.className = 'product-card';
            card.href = `product.html?id=${product.id}`;
            card.innerHTML = `<img src="${product.img_main || ''}" alt="${name}"><div class="product-info"><h3>${name}</h3><p>${price}</p></div>`;
            productGrid.appendChild(card);
        });
    }

    function translateIndexPage(lang) {
        currentLanguage = lang; localStorage.setItem('kati-shop-language', lang);
        document.documentElement.lang = lang; document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
        document.querySelectorAll('[data-key]').forEach(el => el.textContent = staticTranslations[lang][el.dataset.key]);
        renderProductGrid();
    }

    if (!localStorage.getItem('kati-shop-language')) { languageOverlay.classList.add('visible'); }
    translateIndexPage(currentLanguage);

    document.querySelectorAll('.lang-btn').forEach(btn => btn.addEventListener('click', () => { languageOverlay.classList.remove('visible'); translateIndexPage(btn.dataset.lang); }));
    document.getElementById('change-lang-btn')?.addEventListener('click', () => languageOverlay.classList.add('visible'));
}


// ==============================================================
// --- B) LOGIC FOR THE PRODUCT DETAIL PAGE (product.html) ---
// ==============================================================
async function runProductPageLogic() {
    const container = document.getElementById('product-detail-container');
    const productId = new URLSearchParams(window.location.search).get('id');
    
    document.documentElement.lang = currentLanguage; document.documentElement.dir = (currentLanguage === 'ar') ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-key]').forEach(el => el.textContent = staticTranslations[currentLanguage][el.dataset.key]);

    if (!productId) { container.innerHTML = '<h1>Product not found.</h1>'; return; }
    const doc = await db.collection('products').doc(productId).get();
    if (!doc.exists) { container.innerHTML = '<h1>Product not found.</h1>'; return; }
    const product = doc.data();
    
    const name = product[`name_${currentLanguage}`] || product.name_en;
    const price = product[`price_${currentLanguage}`] || product.price_en;
    const desc = product[`desc_${currentLanguage}`] || product.desc_en;
    document.title = name;

    const hasSizes = product.sizes && product.sizes.trim().length > 0;
    
    // ** THE NEW DROPDOWN UI LOGIC **
    const sizesHTML = !hasSizes ? '' : `
        <div class="size-selector-container">
            <h3>${staticTranslations[currentLanguage].sizes_title}</h3>
            <select id="size-selector">
                <option value="" disabled selected>${staticTranslations[currentLanguage].size_placeholder}</option>
                ${product.sizes.split(',').map(s => s.trim()).map(size => `<option value="${size}">${size}</option>`).join('')}
            </select>
        </div>`;

    const thumbnailsHTML = [product.img_thumb1, product.img_thumb2, product.img_thumb3, product.img_thumb4].filter(Boolean).map(url => `<img class="thumbnail" src="${url}" alt="thumb">`).join('');
    
    container.innerHTML = `
        <div class="product-layout">
            <div class="product-gallery"><div class="main-image-container"><img src="${product.img_main}" id="main-product-image"></div><div class="thumbnail-container">${thumbnailsHTML}</div></div>
            <div class="product-details"><h1 class="product-title">${name}</h1><p class="product-details-price">${price}</p><p class="product-description">${desc.replace(/\n/g, '<br>')}</p>${sizesHTML}
                <a href="#" id="order-button" class="add-to-cart-btn disabled" target="_blank">${staticTranslations[currentLanguage].order_btn_disabled}</a>
            </div>
        </div>
    `;

    const orderButton = document.getElementById('order-button');
    const sizeSelector = document.getElementById('size-selector');
    
    if (!hasSizes) {
        updateWhatsAppLink(null);
    } else {
        // ** THE NEW EVENT LISTENER **
        sizeSelector.addEventListener('change', (e) => {
            const selectedSize = e.target.value;
            if (selectedSize) {
                updateWhatsAppLink(selectedSize);
            }
        });
    }

    container.addEventListener('click', e => {
        if (e.target.classList.contains('thumbnail')) {
            document.getElementById('main-product-image').src = e.target.src;
            container.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
        }
    });

    function updateWhatsAppLink(size) {
        const baseWaText = waMessages[currentLanguage];
        let fullWaText = `${baseWaText}\n\n*Product:* ${name}\n*Price:* ${price}`;
        if (size) {
            fullWaText += `\n*Size:* ${size}`;
        }
        orderButton.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(fullWaText)}`;
        orderButton.classList.remove('disabled');
        orderButton.textContent = staticTranslations[currentLanguage].order_btn;
    }
}