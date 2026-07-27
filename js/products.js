/* Vow & Vice — product catalog
   Product data now lives in site/data/products.json (editable via the CMS at
   /admin, or by hand). This file just loads it and provides helpers.
   Swap `images` entries for real photography any time: each image is either
   { type:'art', src, bg, label } (artwork rendered on a fabric-tone plaque)
   or { type:'fabric', bg, label } (a texture/detail swatch). */

let PRODUCTS = [];

const IMG_BASE = window.location.pathname.includes('/product/') ? '../' : '';

const productsReady = fetch(IMG_BASE + 'data/products.json')
  .then(r => r.json())
  .then(data => { PRODUCTS = data.products; return PRODUCTS; });

function findProduct(slug) {
  return PRODUCTS.find(p => p.slug === slug);
}

function relatedProducts(slug, count = 3) {
  const current = findProduct(slug);
  const rest = PRODUCTS.filter(p => p.slug !== slug);
  const sameCat = rest.filter(p => p.category === current?.category);
  const others = rest.filter(p => p.category !== current?.category);
  return [...sameCat, ...others].slice(0, count);
}

function formatPrice(n) {
  return '$' + n.toFixed(2);
}

function plaqueHTML(image, size = '') {
  if (image.type === 'fabric') {
    return `<div class="plaque-fabric ${image.bg} ${size}"><div class="weave"></div><span>${image.label}</span></div>`;
  }
  return `<div class="plaque ${image.bg} ${size}"><img src="${IMG_BASE}${image.src}" alt="${image.label}" loading="lazy"></div>`;
}
