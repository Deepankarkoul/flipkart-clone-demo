const PRODUCTS = [
    { id: 1, title: 'Smartphone A12', category: 'mobiles', desc: '6.5" display, 4GB RAM', price: 7999, img: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23f1f4ff"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="20">Smartphone A12</text></svg>', rating: 4.2 },
    { id: 2, title: 'Laptop Pro 14', category: 'laptops', desc: 'Intel i5, 8GB RAM, 512GB SSD', price: 55999, img: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23fbfbff"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="20">Laptop Pro 14</text></svg>', rating: 4.6 },
    { id: 3, title: 'Wireless Earbuds X', category: 'appliances', desc: 'Noise cancellation', price: 2999, img: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23fff9f1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="20">Earbuds X</text></svg>', rating: 4.1 },
    { id: 4, title: 'Smart TV 42"', category: 'appliances', desc: '4K UHD Smart TV', price: 24999, img: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23f7fff5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="20">Smart TV 42</text></svg>', rating: 4.4 },
    { id: 5, title: 'Budget Phone M1', category: 'mobiles', desc: '5.8" display, 3GB RAM', price: 5999, img: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23fff6fb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="20">Budget Phone M1</text></svg>', rating: 3.9 },
    { id: 6, title: 'Gaming Laptop G5', category: 'laptops', desc: 'RTX 4050, 16GB RAM', price: 89999, img: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23f1fffb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="20">Gaming Laptop G5</text></svg>', rating: 4.7 }
];


const CART_KEY = 'flipkart_clone_cart_v1';
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '{}');


const productsEl = document.getElementById('products');
const tpl = document.getElementById('productTpl');
const q = document.getElementById('q');
const cartCount = document.getElementById('cartCount');
const cartToggle = document.getElementById('cartToggle');
const cartDrawer = document.getElementById('cart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const sortEl = document.getElementById('sort');
const catEl = document.getElementById('category');
const clearFilters = document.getElementById('clearFilters');
const checkout = document.getElementById('checkout');

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCartCount();
}

function renderCartCount() {
    const count = Object.values(cart).reduce((s, i) => s + i.qty, 0);
    cartCount.textContent = count;
}

function addToCart(productId) {
    const prod = PRODUCTS.find(p => p.id === productId);
    if (!prod) return;
    if (!cart[productId]) cart[productId] = { ...prod, qty: 1 };
    else cart[productId].qty += 1;
    saveCart();
    renderCartItems();
    showToast('Added to cart');
}

function removeFromCart(productId) {
    delete cart[productId];
    saveCart();
    renderCartItems();
}

function changeQty(productId, delta) {
    if (!cart[productId]) return;
    cart[productId].qty += delta;
    if (cart[productId].qty <= 0) delete cart[productId];
    saveCart();
    renderCartItems();
}

function renderCartItems() {
    cartItems.innerHTML = '';
    const entries = Object.values(cart);
    if (entries.length === 0) { cartItems.innerHTML = '<div class="muted">Your cart is empty</div>'; cartTotal.textContent = '₹0'; return; }
    let total = 0;
    entries.forEach(item => {
        total += item.price * item.qty;
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
          <img src="${item.img}" alt="${escapeHtml(item.title)}">
          <div style="flex:1">
            <div style="font-weight:700">${escapeHtml(item.title)}</div>
            <div class="muted">₹${item.price} × ${item.qty}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
            <div class="qty">
              <button class="btn minus">-</button>
              <div class="pill">${item.qty}</div>
              <button class="btn plus">+</button>
            </div>
            <button class="btn muted remove">Remove</button>
          </div>
        `;
        el.querySelector('.minus').addEventListener('click', () => changeQty(item.id, -1));
        el.querySelector('.plus').addEventListener('click', () => changeQty(item.id, 1));
        el.querySelector('.remove').addEventListener('click', () => removeFromCart(item.id));
        cartItems.appendChild(el);
    });
    cartTotal.textContent = '₹' + formatNumber(total);
}

function formatNumber(n) { return n.toLocaleString('en-IN') }

function renderProducts(list) {
    productsEl.innerHTML = '';
    list.forEach(prod => {
        const clone = tpl.content.cloneNode(true);
        const card = clone.querySelector('.card');
        clone.querySelector('img').src = prod.img;
        clone.querySelector('img').alt = prod.title;
        clone.querySelector('.title').textContent = prod.title;
        clone.querySelector('.desc').textContent = prod.desc;
        clone.querySelector('.price').textContent = '₹' + formatNumber(prod.price);
        clone.querySelector('.rating').textContent = prod.rating;
        clone.querySelector('.add').addEventListener('click', () => addToCart(prod.id));
        productsEl.appendChild(clone);
    });
}

function searchAndFilter() {
    const term = (q.value || '').toLowerCase().trim();
    const cat = catEl.value;
    let list = PRODUCTS.filter(p => (cat === 'all' || p.category === cat) && (p.title.toLowerCase().includes(term) || p.desc.toLowerCase().includes(term)));
    const sort = sortEl.value;
    if (sort === 'low') list.sort((a, b) => a.price - b.price);
    if (sort === 'high') list.sort((a, b) => b.price - a.price);
    renderProducts(list);
}

function showCart(open = true) {
    cartDrawer.classList.toggle('open', open);
    cartDrawer.setAttribute('aria-hidden', !open);
    renderCartItems();
}


function showToast(msg) {
    const t = document.createElement('div');
    t.textContent = msg; t.style.position = 'fixed'; t.style.right = '20px'; t.style.bottom = '20px'; t.style.background = 'rgba(0,0,0,0.8)'; t.style.color = 'white'; t.style.padding = '10px 14px'; t.style.borderRadius = '8px'; t.style.zIndex = 120; document.body.appendChild(t);
    setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 300) }, 1200);
}

function escapeHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }


document.getElementById('searchBtn').addEventListener('click', searchAndFilter);
q.addEventListener('keyup', (e) => { if (e.key === 'Enter') searchAndFilter(); });
sortEl.addEventListener('change', searchAndFilter);
catEl.addEventListener('change', searchAndFilter);
clearFilters.addEventListener('click', () => { q.value = ''; sortEl.value = 'default'; catEl.value = 'all'; searchAndFilter(); });
cartToggle.addEventListener('click', () => showCart(!cartDrawer.classList.contains('open')));
checkout.addEventListener('click', () => { if (Object.keys(cart).length === 0) { showToast('Cart is empty'); return; } showToast('Checkout — demo only.'); cart = {}; saveCart(); renderCartItems(); showCart(false); });


renderCartCount();
searchAndFilter();

document.addEventListener('click', (e) => {
    if (!cartDrawer.classList.contains('open')) return;
    const inside = cartDrawer.contains(e.target) || cartToggle.contains(e.target);
    if (!inside) showCart(false);
});
