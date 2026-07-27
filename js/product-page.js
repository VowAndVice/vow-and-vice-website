/* Vow & Vice — renders a single product detail page. Called with the product slug. */

function initProductPage(slug) {
  const product = findProduct(slug);
  if (!product) return;

  document.title = `${product.name} — Vow & Vice`;

  /* Gallery */
  const galleryMain = document.getElementById('galleryMain');
  const galleryThumbs = document.getElementById('galleryThumbs');
  let activeIndex = 0;

  function renderGallery() {
    galleryMain.innerHTML = plaqueHTML(product.images[activeIndex], 'gallery-plaque');
    galleryThumbs.innerHTML = product.images.map((img, i) => `
      <button class="thumb-btn ${i === activeIndex ? 'active' : ''}" data-i="${i}" aria-label="${img.label}">
        ${plaqueHTML(img)}
      </button>`).join('');
    galleryThumbs.querySelectorAll('.thumb-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeIndex = parseInt(btn.dataset.i, 10);
        renderGallery();
      });
    });
  }
  renderGallery();

  /* Info */
  document.getElementById('pdCategory').textContent = product.category;
  document.getElementById('pdName').textContent = product.name;
  document.getElementById('pdPrice').textContent = formatPrice(product.price);
  document.getElementById('pdShort').textContent = product.short;
  document.getElementById('pdDescription').textContent = product.description;
  document.getElementById('pdMaterials').textContent = product.materials;
  document.getElementById('pdCare').textContent = product.care;
  document.getElementById('pdColor').textContent = product.color;

  /* Sizes */
  const sizeSelector = document.getElementById('sizeSelector');
  let selectedSize = null;
  sizeSelector.innerHTML = product.sizes.map(s => `<button class="size-btn" data-size="${s}">${s}</button>`).join('');
  sizeSelector.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sizeSelector.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedSize = btn.dataset.size;
      addBtn.disabled = false;
    });
  });

  /* Quantity */
  let qty = 1;
  const qtyDisplay = document.getElementById('qtyDisplay');
  document.getElementById('qtyMinus').addEventListener('click', () => {
    qty = Math.max(1, qty - 1);
    qtyDisplay.textContent = qty;
  });
  document.getElementById('qtyPlus').addEventListener('click', () => {
    qty += 1;
    qtyDisplay.textContent = qty;
  });

  /* Add to cart */
  const addBtn = document.getElementById('addToCartBtn');
  const addNote = document.getElementById('addNote');
  addBtn.disabled = true;
  addBtn.addEventListener('click', () => {
    if (!selectedSize) return;
    addToCart(product.slug, selectedSize, qty);
    addNote.textContent = `Added — ${product.name}, size ${selectedSize} (x${qty})`;
    addNote.classList.add('show');
    openCartDrawer();
  });

  /* Related products */
  const relatedEl = document.getElementById('relatedGrid');
  const related = relatedProducts(product.slug, 3);
  relatedEl.innerHTML = related.map(p => productCardHTML(p)).join('');
}

function productCardHTML(p) {
  const img1 = p.images[0];
  const img2 = p.images[1] || p.images[0];
  const inProductDir = window.location.pathname.includes('/product/');
  const href = inProductDir ? `${p.slug}.html` : `product/${p.slug}.html`;
  return `
    <a class="product-card reveal" href="${href}">
      <div class="thumb">
        ${plaqueHTML(img1, 'main')}
        ${plaqueHTML(img2, 'alt')}
        ${p.tag ? `<span class="tag">${p.tag}</span>` : ''}
      </div>
      <span class="cat">${p.category}</span>
      <div class="name">${p.name}</div>
      <div class="price">${formatPrice(p.price)}</div>
    </a>`;
}
