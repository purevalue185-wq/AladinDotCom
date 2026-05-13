// ==========================================
// ALADINDOTCOM - ADMIN PANEL
// ==========================================

let isEditing = false;
let editingProductId = null;

// Auth check
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
// DYNAMIC FORM
// ==========================================
function addSpecRow() {
  const container = document.getElementById('specsContainer');
  const row = document.createElement('div');
  row.className = 'dynamic-row';
  row.innerHTML = `
    <input type="text" placeholder="Name (e.g. Brand)" class="spec-key">
    <input type="text" placeholder="Value (e.g. AudioTech)" class="spec-value">
    <button type="button" class="btn-remove" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
  `;
  container.appendChild(row);
}

function addPricingRow() {
  const container = document.getElementById('pricingContainer');
  const row = document.createElement('div');
  row.className = 'dynamic-row';
  row.innerHTML = `
    <input type="text" placeholder="Quantity (e.g. 50-100)" class="price-qty">
    <input type="text" placeholder="Price (e.g. $6.80/unit)" class="price-value">
    <button type="button" class="btn-remove" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
  `;
  container.appendChild(row);
}

function getSpecs() {
  const specs = {};
  document.querySelectorAll('#specsContainer .dynamic-row').forEach(row => {
    const key = row.querySelector('.spec-key').value.trim();
    const value = row.querySelector('.spec-value').value.trim();
    if (key && value) specs[key] = value;
  });
  return specs;
}

function getPrices() {
  const prices = [];
  document.querySelectorAll('#pricingContainer .dynamic-row').forEach(row => {
    const qty = row.querySelector('.price-qty').value.trim();
    const price = row.querySelector('.price-value').value.trim();
    if (qty && price) prices.push({ qty: qty, price: price });
  });
  return prices;
}

// ==========================================
// NAVIGATION
// ==========================================
document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    const page = this.dataset.page;
    switchPage(page);
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    this.classList.add('active');
  });
});

function switchPage(page) {
  document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
  document.getElementById(page + '-page').classList.add('active');
  
  if (page === 'products') renderProductsTable();
  if (page === 'dashboard') updateStats();
  if (page === 'orders') renderOrders();
  if (page === 'inquiries') renderInquiries();
  if (page === 'add-product') resetForm();
}

function showProducts() {
  switchPage('products');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector('[data-page="products"]').classList.add('active');
}

function showAddProduct() {
  switchPage('add-product');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector('[data-page="add-product"]').classList.add('active');
}

// ==========================================
// RENDER PRODUCTS TABLE
// ==========================================
function renderProductsTable() {
  database.ref('products').once('value').then(snapshot => {
    const data = snapshot.val();
    const products = data ? Object.values(data).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) : [];
    
    const tbody = document.getElementById('productsTableBody');
    
    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No products found</td></tr>';
      return;
    }
    
    tbody.innerHTML = products.map(p => {
      let imgHTML = '<span style="font-size:2rem;">📦</span>';
      if (p.img && p.img.startsWith('http')) {
        imgHTML = `<img src="${p.img}" style="width:50px;height:50px;object-fit:cover;border-radius:5px;" onerror="this.innerHTML='📦'">`;
      } else if (p.img) {
        imgHTML = `<span style="font-size:2rem;">${p.img}</span>`;
      }
      
      return `
      <tr>
        <td>${imgHTML}</td>
        <td><strong>${p.title || 'No Title'}</strong></td>
        <td style="text-transform:capitalize;">${p.category || 'N/A'}</td>
        <td>${p.moq || 'N/A'}</td>
        <td>${p.price || 'N/A'}</td>
        <td>
          <button class="btn btn-primary btn-sm edit-btn" data-id="${p.id}" style="padding:0.3rem 0.8rem;font-size:0.8rem;margin-right:0.3rem;">Edit</button>
          <button class="btn btn-outline btn-sm delete-btn" data-id="${p.id}" style="padding:0.3rem 0.8rem;font-size:0.8rem;color:red;border-color:red;">Del</button>
        </td>
      </tr>`;
    }).join('');
    
    // Add event listeners AFTER rendering
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        console.log('Edit button clicked for ID:', id);
        loadProductForEdit(id);
      });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        deleteProduct(id);
      });
    });
  });
}

// ==========================================
// LOAD PRODUCT FOR EDITING
// ==========================================
function loadProductForEdit(id) {
  console.log('Loading product for edit, ID:', id);
  
  database.ref('products/' + id).once('value').then(snapshot => {
    const p = snapshot.val();
    console.log('Product data loaded:', p);
    
    if (!p) {
      alert('Product not found in database!');
      return;
    }
    
    isEditing = true;
    editingProductId = id;
    
    document.getElementById('formTitle').textContent = 'Edit: ' + (p.title || 'Product');
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
    
    // Fill specifications
    const specsContainer = document.getElementById('specsContainer');
    specsContainer.innerHTML = '';
    const specs = p.specifications || {};
    const specEntries = Object.entries(specs);
    if (specEntries.length === 0) {
      addSpecRow();
    } else {
      specEntries.forEach(([key, value]) => {
        const row = document.createElement('div');
        row.className = 'dynamic-row';
        row.innerHTML = `
          <input type="text" class="spec-key" value="${key.replace(/"/g, '&quot;')}">
          <input type="text" class="spec-value" value="${value.replace(/"/g, '&quot;')}">
          <button type="button" class="btn-remove" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
        `;
        specsContainer.appendChild(row);
      });
    }
    
    // Fill bulk pricing
    const pricingContainer = document.getElementById('pricingContainer');
    pricingContainer.innerHTML = '';
    const prices = p.bulkPrices || [];
    if (prices.length === 0) {
      addPricingRow();
    } else {
      prices.forEach(price => {
        const row = document.createElement('div');
        row.className = 'dynamic-row';
        row.innerHTML = `
          <input type="text" class="price-qty" value="${price.qty}">
          <input type="text" class="price-value" value="${price.price}">
          <button type="button" class="btn-remove" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
        `;
        pricingContainer.appendChild(row);
      });
    }
    
    showAddProduct();
  }).catch(error => {
    console.error('Error loading product:', error);
    alert('Error loading product: ' + error.message);
  });
}

// ==========================================
// DELETE PRODUCT
// ==========================================
function deleteProduct(id) {
  if (confirm('Delete this product permanently?')) {
    database.ref('products/' + id).remove()
      .then(() => {
        alert('Product deleted!');
        renderProductsTable();
        updateStats();
      })
      .catch(error => {
        alert('Error: ' + error.message);
      });
  }
}

// ==========================================
// RESET FORM
// ==========================================
function resetForm() {
  isEditing = false;
  editingProductId = null;
  document.getElementById('formTitle').textContent = 'Add New Product';
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  document.getElementById('prodRating').value = '4.5';
  document.getElementById('prodReviews').value = '0';
  
  document.getElementById('specsContainer').innerHTML = '';
  addSpecRow();
  
  document.getElementById('pricingContainer').innerHTML = '';
  addPricingRow();
}

// ==========================================
// SAVE PRODUCT
// ==========================================
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
  
  if (!isEditing) {
    product.createdAt = firebase.database.ServerValue.TIMESTAMP;
  }
  
  console.log('Saving product:', product);
  
  database.ref('products/' + product.id).set(product)
    .then(() => {
      alert(isEditing ? 'Product updated!' : 'Product added!');
      resetForm();
      showProducts();
    })
    .catch(error => {
      alert('Error: ' + error.message);
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
      '<tr><td colspan="5">No orders</td></tr>' :
      orders.map(o => `<tr><td>${o.createdAt?new Date(o.createdAt).toLocaleDateString():''}</td><td>${o.productTitle||''}</td><td>${o.userName||'Guest'}</td><td>${o.userEmail||''}</td><td>${o.status||'new'}</td></tr>`).join('');
  });
}

function renderInquiries() {
  database.ref('inquiries').orderByChild('createdAt').limitToLast(50).once('value').then(snapshot => {
    const data = snapshot.val();
    const inqs = data ? Object.entries(data).map(([k, v]) => ({ id: k, ...v })).reverse() : [];
    document.getElementById('inquiriesTableBody').innerHTML = inqs.length === 0 ?
      '<tr><td colspan="4">No inquiries</td></tr>' :
      inqs.map(i => `<tr><td>${i.createdAt?new Date(i.createdAt).toLocaleDateString():''}</td><td>${i.name||''}</td><td>${i.email||''}</td><td>${(i.message||'').substring(0,50)}...</td></tr>`).join('');
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

// Global functions
window.addSpecRow = addSpecRow;
window.addPricingRow = addPricingRow;
window.showProducts = showProducts;
window.showAddProduct = showAddProduct;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateStats();
  renderProductsTable();
});
