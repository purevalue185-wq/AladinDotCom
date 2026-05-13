// ==========================================
// ALADINDOTCOM - ADMIN PANEL
// ==========================================

let isEditing = false;

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

// ==========================================
// DYNAMIC FORM FUNCTIONS
// ==========================================
function addSpecRow() {
  const c = document.getElementById('specsContainer');
  const r = document.createElement('div');
  r.className = 'dynamic-row';
  r.innerHTML = '<input type="text" placeholder="Name (e.g. Brand)" class="spec-key"><input type="text" placeholder="Value (e.g. AudioTech)" class="spec-value"><button type="button" class="btn-remove" onclick="removeRow(this)"><i class="fas fa-times"></i></button>';
  c.appendChild(r);
}

function addPricingRow() {
  const c = document.getElementById('pricingContainer');
  const r = document.createElement('div');
  r.className = 'dynamic-row';
  r.innerHTML = '<input type="text" placeholder="Quantity (e.g. 50-100)" class="price-qty"><input type="text" placeholder="Price (e.g. $6.80/unit)" class="price-value"><button type="button" class="btn-remove" onclick="removeRow(this)"><i class="fas fa-times"></i></button>';
  c.appendChild(r);
}

function removeRow(btn) {
  const r = btn.parentElement;
  const c = r.parentElement;
  if (c.children.length > 1) r.remove();
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
  if (entries.length === 0) {
    addSpecRow();
    return;
  }
  entries.forEach(([k, v]) => {
    const r = document.createElement('div');
    r.className = 'dynamic-row';
    r.innerHTML = `<input type="text" class="spec-key" value="${k.replace(/"/g, '&quot;')}"><input type="text" class="spec-value" value="${v.replace(/"/g, '&quot;')}"><button type="button" class="btn-remove" onclick="removeRow(this)"><i class="fas fa-times"></i></button>`;
    c.appendChild(r);
  });
}

function fillPrices(prices) {
  const c = document.getElementById('pricingContainer');
  c.innerHTML = '';
  if (!prices || prices.length === 0) {
    addPricingRow();
    return;
  }
  prices.forEach(p => {
    const r = document.createElement('div');
    r.className = 'dynamic-row';
    r.innerHTML = `<input type="text" class="price-qty" value="${p.qty}"><input type="text" class="price-value" value="${p.price}"><button type="button" class="btn-remove" onclick="removeRow(this)"><i class="fas fa-times"></i></button>`;
    c.appendChild(r);
  });
}

// ==========================================
// NAVIGATION
// ==========================================
document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    const page = this.dataset.page;
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    document.getElementById(page + '-page').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    this.classList.add('active');
    
    if (page === 'products') renderProductsTable();
    if (page === 'dashboard') updateStats();
    if (page === 'orders') renderOrders();
    if (page === 'inquiries') renderInquiries();
    if (page === 'add-product') resetForm();
  });
});

function showProducts() {
  document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
  document.getElementById('products-page').classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector('[data-page="products"]').classList.add('active');
  renderProductsTable();
}

function showAddProduct() {
  document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
  document.getElementById('add-product-page').classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector('[data-page="add-product"]').classList.add('active');
  resetForm();
}

// ==========================================
// RENDER PRODUCTS TABLE
// ==========================================
function renderProductsTable() {
  database.ref('products').once('value').then(snapshot => {
    const data = snapshot.val();
    const products = data ? Object.values(data).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) : [];
    
    document.getElementById('productsTableBody').innerHTML = products.length === 0 ?
      '<tr><td colspan="6" style="text-align:center;">No products found</td></tr>' :
      products.map(p => {
        // Show image thumbnail
        let imgHTML = '<span style="font-size:2rem;">📦</span>';
        if (p.img && p.img.startsWith('http')) {
          imgHTML = `<img src="${p.img}" style="width:50px;height:50px;object-fit:cover;border-radius:5px;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22><rect fill=%22%23ddd%22 width=%2250%22 height=%2250%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2220%22>📦</text></svg>'">`;
        } else if (p.img) {
          imgHTML = `<span style="font-size:2rem;">${p.img}</span>`;
        }
        
        return `
        <tr>
          <td>${imgHTML}</td>
          <td><strong>${p.title}</strong></td>
          <td style="text-transform:capitalize;">${p.category}</td>
          <td>${p.moq || 'N/A'}</td>
          <td>${p.price || 'N/A'}</td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="editProduct('${p.id}')" style="padding:0.3rem 0.8rem;font-size:0.8rem;margin-right:0.3rem;">Edit</button>
            <button class="btn btn-outline btn-sm" onclick="deleteProduct('${p.id}')" style="padding:0.3rem 0.8rem;font-size:0.8rem;color:red;border-color:red;">Del</button>
          </td>
        </tr>`;
      }).join('');
  });
}

// ==========================================
// EDIT PRODUCT (FIXED)
// ==========================================
function editProduct(id) {
  database.ref('products/' + id).once('value').then(snapshot => {
    const p = snapshot.val();
    if (!p) {
      alert('Product not found!');
      return;
    }
    
    isEditing = true;
    document.getElementById('formTitle').textContent = 'Edit Product: ' + p.title;
    document.getElementById('productId').value = p.id;
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
    
    // Fill dynamic fields
    fillSpecs(p.specifications || {});
    fillPrices(p.bulkPrices || []);
    
    showAddProduct();
  }).catch(error => {
    console.error('Error loading product:', error);
    alert('Error loading product details.');
  });
}

// ==========================================
// DELETE PRODUCT
// ==========================================
function deleteProduct(id) {
  if (confirm('Are you sure you want to delete this product?')) {
    database.ref('products/' + id).remove()
      .then(() => {
        alert('Product deleted!');
        renderProductsTable();
        updateStats();
      })
      .catch(error => {
        console.error('Error deleting:', error);
        alert('Error deleting product.');
      });
  }
}

// ==========================================
// RESET FORM
// ==========================================
function resetForm() {
  isEditing = false;
  document.getElementById('formTitle').textContent = 'Add New Product';
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  document.getElementById('prodRating').value = '4.5';
  document.getElementById('prodReviews').value = '0';
  fillSpecs({});
  fillPrices([]);
}

// ==========================================
// SAVE PRODUCT (FIXED)
// ==========================================
document.getElementById('productForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const imgUrl = document.getElementById('prodImageUrl').value.trim();
  const emoji = document.getElementById('prodImg').value.trim();
  const pid = document.getElementById('productId').value;
  const productId = pid ? parseInt(pid) : Date.now();
  
  const product = {
    id: productId,
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
  
  if (!isEditing) {
    product.createdAt = firebase.database.ServerValue.TIMESTAMP;
  }
  
  console.log('Saving product:', product);
  
  database.ref('products/' + product.id).set(product)
    .then(() => {
      alert(isEditing ? 'Product updated successfully!' : 'Product added successfully!');
      resetForm();
      showProducts();
    })
    .catch(error => {
      console.error('Error saving:', error);
      alert('Error saving product: ' + error.message);
    });
});

// ==========================================
// ORDERS & INQUIRIES
// ==========================================
function renderOrders() {
  database.ref('orders').orderByChild('createdAt').limitToLast(50).once('value').then(snapshot => {
    const data = snapshot.val();
    const orders = data ? Object.entries(data).map(([k, v]) => ({ id: k, ...v })).reverse() : [];
    document.getElementById('ordersTableBody').innerHTML = orders.length === 0 ?
      '<tr><td colspan="5" style="text-align:center;">No orders yet</td></tr>' :
      orders.map(o => `
        <tr>
          <td>${o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A'}</td>
          <td>${o.productTitle || 'N/A'}</td>
          <td>${o.userName || 'Guest'}</td>
          <td>${o.userEmail || 'N/A'}</td>
          <td><span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:10px;font-size:0.8rem;">${o.status || 'new'}</span></td>
        </tr>
      `).join('');
  });
}

function renderInquiries() {
  database.ref('inquiries').orderByChild('createdAt').limitToLast(50).once('value').then(snapshot => {
    const data = snapshot.val();
    const inquiries = data ? Object.entries(data).map(([k, v]) => ({ id: k, ...v })).reverse() : [];
    document.getElementById('inquiriesTableBody').innerHTML = inquiries.length === 0 ?
      '<tr><td colspan="4" style="text-align:center;">No inquiries yet</td></tr>' :
      inquiries.map(i => `
        <tr>
          <td>${i.createdAt ? new Date(i.createdAt).toLocaleDateString() : 'N/A'}</td>
          <td>${i.name || 'N/A'}</td>
          <td>${i.email || 'N/A'}</td>
          <td>${(i.message || '').substring(0, 50)}...</td>
        </tr>
      `).join('');
  });
}

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

// ==========================================
// GLOBAL FUNCTIONS
// ==========================================
window.showProducts = showProducts;
window.showAddProduct = showAddProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.addSpecRow = addSpecRow;
window.addPricingRow = addPricingRow;
window.removeRow = removeRow;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateStats();
  renderProductsTable();
});
