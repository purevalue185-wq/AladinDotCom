const urlParams = new URLSearchParams(location.search);
const productId = parseInt(urlParams.get('id'));

function loadProduct() {
  database.ref('products/' + productId).once('value').then(snapshot => {
    const product = snapshot.val();
    if (!product) {
      document.getElementById('productDetailContainer').innerHTML = 
        '<h2>Product not found</h2><a href="products.html" class="btn btn-primary">Back</a>';
      return;
    }
    renderProduct(product);
    loadRelated(product.category);
  });
}

function renderProduct(product) {
  document.getElementById('breadcrumbProduct').textContent = product.title;
  document.title = product.title + ' | AladinDotCom';
  
  document.getElementById('productDetailContainer').innerHTML = `
    <div class="product-detail">
      <div class="product-gallery">
        <div class="gallery-main" id="galleryMain">${product.img || '📦'}</div>
        <div class="gallery-thumbs">
          ${(product.images || [product.img]).map((img, i) => `
            <div class="gallery-thumb ${i===0?'active':''}" onclick="document.getElementById('galleryMain').textContent='${img}'">${img}</div>
          `).join('')}
        </div>
      </div>
      <div class="product-detail-info">
        <span class="moq-badge">${product.moq || 'MOQ Available'}</span>
        <h1>${product.title}</h1>
        <div class="rating">${'★'.repeat(Math.floor(product.rating||0))} ${product.rating||0} (${product.reviews||0} reviews)</div>
        <p>${product.desc || ''}</p>
        <div class="supplier-info">
          <strong>Supplier:</strong> ${product.supplier || 'N/A'}<br>
          <strong>Shipping:</strong> ${product.shipping || 'N/A'}
        </div>
        <h3>Bulk Pricing</h3>
        <table class="bulk-pricing-table">
          <thead><tr><th>Quantity</th><th>Price</th></tr></thead>
          <tbody>
            ${(product.bulkPrices || []).map(bp => `<tr><td>${bp.qty}</td><td><strong>${bp.price}</strong></td></tr>`).join('')}
          </tbody>
        </table>
        <h3>Specifications</h3>
        <div class="specifications-list">
          ${Object.entries(product.specifications || {}).map(([k,v]) => `
            <div class="spec-item"><span>${k}</span><strong>${v}</strong></div>
          `).join('')}
        </div>
        <a href="https://wa.me/15551234567?text=I'm%20interested%20in%20${encodeURIComponent(product.title)}" target="_blank" class="btn btn-accent btn-large">
          <i class="fab fa-whatsapp"></i> WhatsApp Inquiry
        </a>
      </div>
    </div>
  `;
}

function loadRelated(category) {
  database.ref('products').orderByChild('category').equalTo(category).once('value').then(snapshot => {
    const data = snapshot.val();
    const related = data ? Object.values(data).filter(p => p.id !== productId).slice(0, 4) : [];
    
    document.getElementById('relatedProducts').innerHTML = related.length === 0 ?
      '<p>No related products</p>' :
      related.map(p => `
        <div class="product-card" onclick="location.href='product-detail.html?id=${p.id}'">
          <div class="product-img">${p.img || '📦'}</div>
          <div class="product-info">
            <div class="product-title">${p.title}</div>
            <div class="price-range">${p.price || 'Contact'}</div>
            <button class="btn btn-primary" onclick="event.stopPropagation();location.href='product-detail.html?id=${p.id}'">View Details</button>
          </div>
        </div>
      `).join('');
  });
}

document.getElementById('hamburgerBtn')?.addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('show');
});

document.addEventListener('DOMContentLoaded', loadProduct);