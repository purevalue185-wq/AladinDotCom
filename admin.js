// ==========================================
// ALADINDOTCOM - ADMIN PANEL
// ==========================================

let isEditing = false;
let editingProductId = null;

auth.onAuthStateChanged(user => {
  if (!user || user.email !== 'purevalue185@gmail.com') {
    alert('Access denied! Admin only.');
    location.href = 'index.html';
    return;
  }
  document.getElementById('adminEmail').textContent = '👑 ' + user.email;
  updateStats();
  renderProductsTable();
});

function addSpecRow() {
  const c = document.getElementById('specsContainer');
  const r = document.createElement('div');
  r.className = 'dynamic-row';
  r.innerHTML = '<input type="text" placeholder="Name (e.g. Brand)" class="spec-key"><input type="text" placeholder="Value (e.g. AudioTech)" class="spec-value"><button type="button" class="btn-remove" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>';
  c.appendChild(r);
}

function addPricingRow() {
  const c = document.getElementById('pricingContainer');
  const r = document.createElement('div');
  r.className = 'dynamic-row';
  r.innerHTML = '<input type="text" placeholder="Quantity (e.g. 50-100)" class="price-qty"><input type="text" placeholder="Price (e.g. $6.80/unit)" class="price-value"><button type="button" class="btn-remove" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>';
  c.appendChild(r);
}

function getSpecs() {
  const s = {};
  document.querySelectorAll('#specsContainer .dynamic-row').forEach(r => {
    const k = r.querySelector('.spec-key').value.trim();
    const v = r.querySelector('.spec-value').value.trim();
    if (k && v) s[k] = v;
  });
  return s;
}

function getPrices() {
  const p = [];
  document.querySelectorAll('#pricingContainer .dynamic-row').forEach(r => {
    const q = r.querySelector('.price-qty').value.trim();
    const pr = r.querySelector('.price-value').value.trim();
    if (q && pr) p.push({ qty: q, price: pr });
  });
  return p;
}

function fillSpecs(specs) {
  const c = document.getElementById('specsContainer');
  c.innerHTML = '';
  const entries = Object.entries(specs || {});
  if (entries.length === 0) { addSpecRow(); return; }
  entries.forEach(([k, v]) => {
    const r = document.createElement('div');
    r.className = 'dynamic-row';
    r.innerHTML = `<input type="text" class="spec-key" value="${k.replace(/"/g,'&quot;')}"><input type="text" class="spec-value" value="${String(v).replace(/"/g,'&quot;')}"><button type="button" class="btn-remove" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;
    c.appendChild(r);
  });
}

function fillPrices(prices) {
  const c = document.getElementById('pricingContainer');
  c.innerHTML = '';
  if (!prices || prices.length === 0) { addPricingRow(); return; }
  prices.forEach(p => {
    const r = document.createElement('div');
    r.className = 'dynamic-row';
    r.innerHTML = `<input type="text" class="price-qty" value="${p.qty}"><input type="text" class="price-value" value="${p.price}"><button type="button" class="btn-remove" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;
    c.appendChild(r);
  });
}

function goToPage(page) {
  document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
  document.getElementById(page + '-page').classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const nav = document.querySelector(`[data-page="${page}"]`);
  if (nav) nav.classList.add('active');
  if (page === 'products') renderProductsTable();
  if (page === 'dashboard') updateStats();
  if (page === 'orders') renderOrders();
  if (page === 'inquiries') renderInquiries();
  if (page === 'add-product' && !isEditing) resetForm();
}

document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', function(e) { e.preventDefault(); goToPage(this.dataset.page); });
});

function renderProductsTable() {
  database.ref('products').once('value').then(snapshot => {
    const data = snapshot.val();
    const products = data ? Object.values(data).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) : [];
    const tbody = document.getElementById('productsTableBody');
    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;">No products found.</td></tr>';
      return;
    }
    tbody.innerHTML = products.map(p => {
      let img = '<span style="font-size:2rem;">📦</span>';
      if (p.img && p.img.startsWith('http')) img = `<img src="${p.img}" style="width:50px;height:50px;object-fit:cover;border-radius:5px;" onerror="this.innerHTML='📦'">`;
      else if (p.img) img = `<span style="font-size:2rem;">${p.img}</span>`;
      return `<tr><td>${img}</td><td><strong>${p.title||'No Title'}</strong></td><td style="text-transform:capitalize;">${p.category||'N/A'}</td><td>${p.moq||'N/A'}</td><td>${p.price||'N/A'}</td><td><button onclick="editProduct('${p.id}')" style="background:#2563EB;color:white;border:none;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:13px;margin-right:5px;">Edit</button><button onclick="deleteProduct('${p.id}')" style="background:white;color:#EF4444;border:1px solid #EF4444;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:13px;">Delete</button></td></tr>`;
    }).join('');
  });
}

window.editProduct = function(id) {
  isEditing = true;
  editingProductId = id;
  database.ref('products/' + id).once('value').then(snapshot => {
    const p = snapshot.val();
    if (!p) { alert('Product not found!'); return; }
    goToPage('add-product');
    document.getElementById('formTitle').textContent = 'Edit: ' + p.title;
    document.getElementById('productId').value = id;
    document.getElementById('prodTitle').value = p.title || '';
    document.getElementById('prodCategory').value = p.category || '';
    document.getElementById('prodImageUrl').value = (p.img && p.img.startsWith('http')) ? p.img : '';
    document.getElementById('prodImg').value = (p.img && !p.img.startsWith('http')) ? p.img : '';
    document.getElementById('prodMoq').value = p.moq || '';
    document.getElementById('prodPrice').value = p.price || '';
    document.getElementById('prodSupplier').value = p.supplier || '';
    document.getElementById('prodShipping').value = p.shipping || '';
    document.getElementById('prodRating').value = p.rating || 4.5;
    document.getElementById('prodReviews').value = p.reviews || 0;
    document.getElementById('prodDesc').value = p.desc || '';
    document.getElementById('prodImages').value = (p.images || []).join(', ');
    fillSpecs(p.specifications || {});
    fillPrices(p.bulkPrices || []);
  });
};

window.deleteProduct = function(id) {
  if (confirm('Delete this product?')) {
    database.ref('products/' + id).remove().then(() => { renderProductsTable(); updateStats(); });
  }
};

function resetForm() {
  isEditing = false;
  editingProductId = null;
  document.getElementById('formTitle').textContent = 'Add New Product';
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  document.getElementById('prodRating').value = '4.5';
  document.getElementById('prodReviews').value = '0';
  document.getElementById('specsContainer').innerHTML = '';
  document.getElementById('pricingContainer').innerHTML = '';
  addSpecRow();
  addPricingRow();
}

document.getElementById('productForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const imgUrl = document.getElementById('prodImageUrl').value.trim();
  const emoji = document.getElementById('prodImg').value.trim();
  const productId = isEditing ? editingProductId : Date.now();
  const product = {
    id: parseInt(productId),
    title: document.getElementById('prodTitle').value.trim(),
    category: document.getElementById('prodCategory').value,
    img: imgUrl || emoji || '📦',
    moq: document.getElementById('prodMoq').value.trim(),
    price: document.getElementById('prodPrice').value.trim(),
    supplier: document.getElementById('prodSupplier').value.trim(),
    shipping: document.getElementById('prodShipping').value.trim(),
    rating: parseFloat(document.getElementById('prodRating').value) || 4.5,
    reviews: parseInt(document.getElementById('prodReviews').value) || 0,
    desc: document.getElementById('prodDesc').value.trim(),
    images: document.getElementById('prodImages').value.split(',').map(i => i.trim()).filter(i => i),
    specifications: getSpecs(),
    bulkPrices: getPrices(),
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  };
  if (!isEditing) product.createdAt = firebase.database.ServerValue.TIMESTAMP;
  database.ref('products/' + product.id).set(product).then(() => {
    alert(isEditing ? 'Updated!' : 'Added!');
    resetForm();
    goToPage('products');
  }).catch(err => alert('Error: ' + err.message));
});

function renderOrders() {
  database.ref('orders').orderByChild('createdAt').limitToLast(50).once('value').then(snapshot => {
    const data = snapshot.val();
    const orders = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse() : [];
    document.getElementById('ordersTableBody').innerHTML = orders.length === 0 ? '<tr><td colspan="7">No orders</td></tr>' :
      orders.map(o => `<tr><td>${o.createdAt?new Date(o.createdAt).toLocaleDateString():''}</td><td>${o.productTitle||''}</td><td>${o.quantityDisplay||o.quantity||'N/A'}</td><td>${o.userName||'Guest'}</td><td>${o.userEmail||''}</td><td><span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:10px;font-size:12px;">${o.status||'new'}</span></td></tr>`).join('');
  });
}

function renderInquiries() {
  database.ref('inquiries').orderByChild('createdAt').limitToLast(50).once('value').then(snapshot => {
    const data = snapshot.val();
    const inq = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse() : [];
    document.getElementById('inquiriesTableBody').innerHTML = inq.length === 0 ? '<tr><td colspan="4">No inquiries</td></tr>' :
      inq.map(i => `<tr><td>${i.createdAt?new Date(i.createdAt).toLocaleDateString():''}</td><td>${i.name||''}</td><td>${i.email||''}</td><td>${(i.message||'').substring(0,50)}...</td></tr>`).join('');
  });
}

function updateStats() {
  database.ref('products').once('value').then(s => { document.getElementById('totalProducts').textContent = s.exists() ? Object.keys(s.val()).length : 0; });
  database.ref('orders').once('value').then(s => { document.getElementById('totalOrders').textContent = s.exists() ? Object.keys(s.val()).length : 0; });
  database.ref('inquiries').once('value').then(s => { document.getElementById('totalInquiries').textContent = s.exists() ? Object.keys(s.val()).length : 0; });
}

window.showAddProduct = function() { resetForm(); goToPage('add-product'); };
window.addSpecRow = addSpecRow;
window.addPricingRow = addPricingRow;

document.addEventListener('DOMContentLoaded', () => { updateStats(); renderProductsTable(); });
