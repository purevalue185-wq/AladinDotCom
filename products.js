let allProducts = [];
const urlParams = new URLSearchParams(location.search);
const categoryFilter = urlParams.get('category');
const searchQuery = urlParams.get('search');

function loadProducts() {
  database.ref('products').once('value').then(snapshot => {
    const data = snapshot.val();
    allProducts = data ? Object.values(data) : [];
    renderProducts();
  });
}

function renderProducts() {
  const container = document.getElementById('allProductsContainer');
  if (!container) return;
  
  let filtered = allProducts;
  if (categoryFilter && categoryFilter !== 'all') {
    filtered = allProducts.filter(p => p.category === categoryFilter);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p => p.title.toLowerCase().includes(q));
  }
  
  container.innerHTML = filtered.length === 0 ? 
    '<p style="text-align:center;grid-column:1/-1;">No products found</p>' :
    filtered.map(p => `
      <div class="product-card" onclick="location.href='product-detail.html?id=${p.id}'">
        <div class="product-img">${p.img || '📦'}</div>
        <div class="product-info">
          <span class="moq-badge">${p.moq || 'MOQ Available'}</span>
          <div class="product-title">${p.title}</div>
          <div class="price-range">${p.price || 'Contact'}</div>
          <button class="btn btn-primary" onclick="event.stopPropagation();location.href='product-detail.html?id=${p.id}'">View Details</button>
        </div>
      </div>
    `).join('');
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const cat = this.dataset.category;
    location.href = cat === 'all' ? 'products.html' : `products.html?category=${cat}`;
  });
});

// Set active filter
if (categoryFilter) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.category === categoryFilter) btn.classList.add('active');
  });
}

document.getElementById('productSearchBtn')?.addEventListener('click', () => {
  const q = document.getElementById('productSearch').value.trim();
  if (q) location.href = `products.html?search=${encodeURIComponent(q)}`;
});

document.getElementById('hamburgerBtn')?.addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('show');
});

document.addEventListener('DOMContentLoaded', loadProducts);