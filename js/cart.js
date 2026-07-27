/* Vow & Vice — cart (localStorage-backed, no backend) */

const CART_KEY = 'vv_cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function addToCart(slug, size, qty) {
  const cart = getCart();
  const existing = cart.find(i => i.slug === slug && i.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ slug, size, qty });
  }
  saveCart(cart);
  renderCartDrawer();
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCartDrawer();
  if (document.getElementById('cartPageBody')) renderCartPage();
}

function setQty(index, qty) {
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].qty = Math.max(1, qty);
  saveCart(cart);
  renderCartDrawer();
  if (document.getElementById('cartPageBody')) renderCartPage();
}

function cartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function cartLines() {
  return getCart().map((item, index) => {
    const product = findProduct(item.slug);
    return { ...item, index, product };
  }).filter(l => l.product);
}

function cartSubtotal() {
  return cartLines().reduce((sum, l) => sum + l.product.price * l.qty, 0);
}

function updateCartCount() {
  document.querySelectorAll('.cart-count').forEach(el => {
    const n = cartCount();
    el.textContent = n;
    el.style.display = n > 0 ? 'flex' : 'none';
  });
}

/* ---------- Drawer ---------- */

function drawerRowHTML(line) {
  const img = line.product.images[0];
  return `
    <div class="drawer-row">
      <div class="thumb">${plaqueHTML(img)}</div>
      <div>
        <div class="name">${line.product.name}</div>
        <div class="meta">Size ${line.size} &middot; Qty ${line.qty}</div>
        <button class="remove" onclick="removeFromCart(${line.index})">Remove</button>
      </div>
      <div class="row-price">${formatPrice(line.product.price * line.qty)}</div>
    </div>`;
}

function renderCartDrawer() {
  const itemsEl = document.getElementById('drawerItems');
  const footEl = document.getElementById('drawerFoot');
  if (!itemsEl) return;
  const lines = cartLines();
  if (lines.length === 0) {
    itemsEl.innerHTML = `<div class="empty-cart"><div class="glyph">&#10022;</div><p>Your bag is empty.</p><a href="${pathTo('shop.html')}" class="btn btn-primary">Shop the Collection</a></div>`;
    footEl.innerHTML = '';
    return;
  }
  itemsEl.innerHTML = lines.map(drawerRowHTML).join('');
  footEl.innerHTML = `
    <div class="summary-row"><span>Subtotal</span><span>${formatPrice(cartSubtotal())}</span></div>
    <div class="newsletter-note" style="margin-bottom:16px;">Shipping and taxes calculated at checkout.</div>
    <a href="${pathTo('cart.html')}" class="btn btn-dark btn-block">View Bag</a>
  `;
}

function openCartDrawer() {
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCartDrawer() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ---------- Full cart page ---------- */

function cartRowHTML(line) {
  const img = line.product.images[0];
  return `
    <div class="cart-row">
      <div class="thumb">${plaqueHTML(img)}</div>
      <div>
        <div class="name">${line.product.name}</div>
        <div class="meta">Size ${line.size} &middot; ${line.product.color}</div>
        <div class="qty-control">
          <button onclick="setQty(${line.index}, ${line.qty - 1})" aria-label="Decrease quantity">&minus;</button>
          <span>${line.qty}</span>
          <button onclick="setQty(${line.index}, ${line.qty + 1})" aria-label="Increase quantity">&plus;</button>
        </div>
        <button class="remove" style="margin-top:10px;" onclick="removeFromCart(${line.index})">Remove</button>
      </div>
      <div class="row-price">${formatPrice(line.product.price * line.qty)}</div>
    </div>`;
}

function renderCartPage() {
  const body = document.getElementById('cartPageBody');
  const summary = document.getElementById('cartSummary');
  if (!body) return;
  const lines = cartLines();
  if (lines.length === 0) {
    body.innerHTML = `<div class="empty-cart"><div class="glyph">&#10022;</div><h2>Your bag is empty</h2><p>Let a story find its way into your wardrobe.</p><a href="shop.html" class="btn btn-primary">Shop the Collection</a></div>`;
    if (summary) summary.style.display = 'none';
    return;
  }
  if (summary) summary.style.display = '';
  body.innerHTML = lines.map(cartRowHTML).join('');
  const subtotal = cartSubtotal();
  const shipping = subtotal > 0 ? 0 : 0;
  document.getElementById('sumSubtotal').textContent = formatPrice(subtotal);
  document.getElementById('sumTotal').textContent = formatPrice(subtotal + shipping);
}

/* Path helper so drawer links work whether we're at site root or /product/ */
function pathTo(file) {
  const inProductDir = window.location.pathname.includes('/product/');
  return inProductDir ? '../' + file : file;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-cart-open]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); openCartDrawer(); });
  });
  document.getElementById('cartOverlay')?.addEventListener('click', closeCartDrawer);
  document.getElementById('drawerClose')?.addEventListener('click', closeCartDrawer);

  productsReady.then(() => {
    updateCartCount();
    renderCartDrawer();
    if (document.getElementById('cartPageBody')) renderCartPage();
  });
});
