// Check if admin
auth.onAuthStateChanged(user => {
  if (!user || user.email !== 'purevalue185@gmail.com') {
    alert('Access denied! Admin only.');
    location.href = 'index.html';
    return;
  }
  document.getElementById('adminEmail').textContent = user.email;
  updateStats();
  renderProducts();
});

// Navigation
document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    document.getElementById(this.dataset.page + '-page').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    this.classList.add('active');
    
    if(this.dataset.page === 'products') renderProducts();
    if(this.dataset.page === 'orders') renderOrders();
    if(this.dataset.page === 'inquiries') renderInquiries();
    if(this.dataset.page === 'dashboard') updateStats();
  });
});

// Show pages
window.showProducts = function() {
  document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
  document.getElementById('products-page').classList.add('active');
  renderProducts();
};

window.showAddProduct = function() {
  document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
  document.getElementById('add-product-page').classList.add('active');
  document.getElementById('formTitle').textContent = 'Add Product';
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
};

// Render products
function renderProducts() {
  database.ref('products').once('value').then(snapshot => {
    const data = snapshot.val();
    const prods = data ? Object.values(data) : [];
    document.getElementById('productsTableBody').innerHTML = prods.length === 0 ?
      '<tr><td colspan="6">No products</td></tr>' :
      prods.map(p => `
        <tr>
          <td style="font-size:2rem;">${p.img||'📦'}</td>
          <td>${p.title}</td>
          <td>${p.category}</td>
          <td>${p.moq||''}</td>
          <td>${p.price||''}</td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="editProduct('${p.id}')" style="padding:0.3rem 0.8rem;font-size:0.8rem;">Edit</button>
            <button class="btn btn-outline btn-sm" onclick="deleteProduct('${p.id}')" style="padding:0.3rem 0.8rem;font-size:0.8rem;color:red;">Del</button>
          </td>
        </tr>
      `).join('');
  });
}

// Edit product
window.editProduct = function(id) {
  database.ref('products/' + id).once('value').then(snapshot => {
    const p = snapshot.val();
    if(!p) return;
    document.getElementById('formTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = p.id;
    document.getElementById('prodTitle').value = p.title||'';
    document.getElementById('prodCategory').value = p.category||'';
    document.getElementById('prodImg').value = p.img||'';
    document.getElementById('prodMoq').value = p.moq||'';
    document.getElementById('prodPrice').value = p.price||'';
    document.getElementById('prodSupplier').value = p.supplier||'';
    document.getElementById('prodShipping').value = p.shipping||'';
    document.getElementById('prodRating').value = p.rating||4.5;
    document.getElementById('prodReviews').value = p.reviews||0;
    document.getElementById('prodDesc').value = p.desc||'';
    document.getElementById('prodImages').value = (p.images||[]).join(', ');
    document.getElementById('prodSpecs').value = JSON.stringify(p.specifications||{});
    document.getElementById('prodBulkPrices').value = JSON.stringify(p.bulkPrices||[]);
    
    document.querySelectorAll('.page-content').forEach(pg => pg.classList.remove('active'));
    document.getElementById('add-product-page').classList.add('active');
  });
};

// Delete product
window.deleteProduct = function(id) {
  if(confirm('Delete this product?')) {
    database.ref('products/' + id).remove().then(() => renderProducts());
  }
};

// Save product
document.getElementById('productForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const id = document.getElementById('productId').value || Date.now();
  const product = {
    id: parseInt(id),
    title: document.getElementById('prodTitle').value,
    category: document.getElementById('prodCategory').value,
    img: document.getElementById('prodImg').value,
    moq: document.getElementById('prodMoq').value,
    price: document.getElementById('prodPrice').value,
    supplier: document.getElementById('prodSupplier').value,
    shipping: document.getElementById('prodShipping').value,
    rating: parseFloat(document.getElementById('prodRating').value),
    reviews: parseInt(document.getElementById('prodReviews').value),
    desc: document.getElementById('prodDesc').value,
    images: document.getElementById('prodImages').value.split(',').map(s=>s.trim()).filter(s=>s),
    specifications: JSON.parse(document.getElementById('prodSpecs').value||'{}'),
    bulkPrices: JSON.parse(document.getElementById('prodBulkPrices').value||'[]'),
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  };
  
  database.ref('products/' + product.id).set(product)
    .then(() => {
      alert('Saved!');
      showProducts();
    });
});

// Render orders
function renderOrders() {
  database.ref('orders').orderByChild('createdAt').limitToLast(50).once('value').then(snapshot => {
    const data = snapshot.val();
    const orders = data ? Object.entries(data).map(([k,v])=>({id:k,...v})).reverse() : [];
    document.getElementById('ordersTableBody').innerHTML = orders.length === 0 ?
      '<tr><td colspan="5">No orders</td></tr>' :
      orders.map(o => `
        <tr>
          <td>${o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}</td>
          <td>${o.productTitle||''}</td>
          <td>${o.userName||''}</td>
          <td>${o.userEmail||''}</td>
          <td>${o.status||'new'}</td>
        </tr>
      `).join('');
  });
}

// Render inquiries
function renderInquiries() {
  database.ref('inquiries').orderByChild('createdAt').limitToLast(50).once('value').then(snapshot => {
    const data = snapshot.val();
    const inqs = data ? Object.entries(data).map(([k,v])=>({id:k,...v})).reverse() : [];
    document.getElementById('inquiriesTableBody').innerHTML = inqs.length === 0 ?
      '<tr><td colspan="4">No inquiries</td></tr>' :
      inqs.map(i => `
        <tr>
          <td>${i.createdAt ? new Date(i.createdAt).toLocaleDateString() : ''}</td>
          <td>${i.name||''}</td>
          <td>${i.email||''}</td>
          <td>${(i.message||'').substring(0,50)}</td>
        </tr>
      `).join('');
  });
}

// Stats
function updateStats() {
  database.ref('products').once('value').then(s => {
    document.getElementById('totalProducts').textContent = s.exists() ? Object.keys(s.val()).length : 0;
  });
  database.ref('orders').once('value').then(s => {
    document.getElementById('totalOrders').textContent = s.exists() ? Object.keys(s.val()).length : 0;
  });
  database.ref('inquiries').once('value').then(s => {
    document.getElementById('totalInquiries').textContent = s.exists() ? Object.keys(s.val()).length : 0;
  });
}