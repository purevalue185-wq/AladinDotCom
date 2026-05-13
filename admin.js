// ==========================================
// ALADINDOTCOM - ADMIN PANEL (FINAL)
// ==========================================

let isEditing = false;
let editingProductId = null;

// Check admin access
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
// ADD DYNAMIC ROWS
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

// ==========================================
// GET FORM DATA
// ==========================================
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
function goToPage(pageName) {
  document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
  document.getElementById(pageName + '-page').classList.add('active');
  
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector(`[data-page="${pageName}"]`);
  if (navItem) navItem.classList.add('active');
  
  if (pageName === 'products') renderProductsTable();
  if (pageName === 'dashboard') updateStats();
  if (pageName === 'orders') renderOrders();
  if (pageName === 'inquiries') renderInquiries();
  if (pageName === 'add-product' && !isEditing) resetForm();
}

document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    goToPage(this.dataset.page);
  });
});

// ==========================================
// RENDER PRODUCTS TABLE
// ==========================================
function renderProductsTable() {
  database.ref('products').once('value').then(snapshot => {
    const data = snapshot.val();
    const products = data ? Object.values(data) : [];
    
    // Sort by newest first
    products.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    
    const tbody = document.getElementById('productsTableBody');
    
    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;">No products found. Click "Add Product" to create one.</td></tr>';
      return;
    }
    
    tbody.innerHTML = products.map(p => {
      let imgHTML;
      if (p.img && p.img.startsWith('http')) {
        imgHTML = `<img src="${p.img}" style="width:50px;height:50px;object-fit:cover;border-radius:5px;" onerror="this.innerHTML='📦'">`;
      } else if (p.img) {
        imgHTML = `<span style="font-size:2rem;">${p.img}</span>`;
      } else {
        imgHTML = '<span style="font-size:2rem;">📦</span>';
      }
      
      return `
      <tr>
        <td>${imgHTML}</td>
        <td><strong>${p.title || 'No Title'}</strong></td>
        <td style="text-transform:capitalize;">${p.category || 'N/A'}</td>
        <td>${p.moq || 'N/A'}</td>
        <td>${p.price || 'N/A'}</td>
        <td>
          <button onclick="editProductClick('${p.id}')" style="background:#2563EB;color:white;border:none;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:13px;margin-right:5px;">Edit</button>
          <button onclick="deleteProductClick('${p.id}')" style="background:white;color:#EF4444;border:1px solid #EF4444;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:13px;">Delete</button>
        </td>
      </tr>`;
    }).join('');
  });
}

// ==========================================
// EDIT PRODUCT (GLOBAL FUNCTION)
// ==========================================
window.editProductClick = function(id) {
  console.log('Editing product ID:', id);
  isEditing = true;
  editingProductId = id;
  
  database.ref('products/' + id).once('value').then(snapshot => {
    const p = snapshot.val();
    
    if (!p) {
      alert('Product not found!');
      return;
    }
    
    // Go to add-product page
    document.querySelectorAll('.page-content').forEach(pg => pg.classList.remove('active'));
    document.getElementById('add-product-page').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector('[data-page="add-product"]').classList.add('active');
    
    // Fill form
    document.getElementById('formTitle').textContent = 'Edit Product: ' + p.title;
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
    
    // Fill Specifications
    const specsContainer = document.getElementById('specsContainer');
    specsContainer.innerHTML = '';
    const specs = p.specifications || {};
    if (Object.keys(specs).length === 0) {
      addSpecRow();
    } else {
      Object.entries(specs).forEach(([key, value]) => {
        const row = document.createElement('div');
        row.className = 'dynamic-row';
        row.innerHTML = `
          <input type="text" class="spec-key" value="${key.replace(/"/g, '&quot;')}">
          <input type="text" class="spec-value" value="${String(value).replace(/"/g, '&quot;')}">
          <button type="button" class="btn-remove" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
        `;
        specsContainer.appendChild(row);
      });
    }
    
    // Fill Bulk Pricing
    const pricingContainer = document.getElementById('pricingContainer');
    pricingContainer.innerHTML = '';
    const prices = p.bulkPrices || [];
    if (prices.length === 0) {
      addPricingRow();
    } else {
      prices.forEach(bp => {
        const row = document.createElement('div');
        row.className = 'dynamic-row';
        row.innerHTML = `
          <input type="text" class="price-qty" value="${bp.qty}">
          <input type="text" class="price-value" value="${bp.price}">
          <button type="button" class="btn-remove" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
        `;
        pricingContainer.appendChild(row);
      });
    }
  }).catch(error => {
    console.error('Error:', error);
    alert('Error loading product!');
  });
};

// ==========================================
// DELETE PRODUCT
// ==========================================
window.deleteProductClick = function(id) {
  if (confirm('Are you sure you want to delete this product? This cannot be undone.')) {
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
};

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
  
  database.ref('products/' + product.id).set(product)
    .then(() => {
      alert(isEditing ? '✅ Product updated successfully!' : '✅ Product added successfully!');
      resetForm();
      document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
      document.getElementById('products-page').classList.add('active');
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.querySelector('[data-page="products"]').classList.add('active');
      renderProductsTable();
      updateStats();
    })
    .catch(error => {
      console.error('Save error:', error);
      alert('❌ Error saving: ' + error.message);
    });
});

// ==========================================
// CANCEL BUTTON
// ==========================================
document.getElementById('cancelBtn')?.addEventListener('click', function() {
  resetForm();
  document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
  document.getElementById('products-page').classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector('[data-page="products"]').classList.add('active');
});

// ==========================================
// SHOW ADD PRODUCT (from Products page)
// ==========================================
window.showAddProduct = function() {
  resetForm();
  document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
  document.getElementById('add-product-page').classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector('[data-page="add-product"]').classList.add('active');
};

// ==========================================
// ORDERS
// ==========================================
function renderOrders() {
  database.ref('orders').orderByChild('createdAt').limitToLast(50).once('value').then(snapshot => {
    const data = snapshot.val();
    const orders = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse() : [];
    
    document.getElementById('ordersTableBody').innerHTML = orders.length === 0 ?
      '<tr><td colspan="5" style="text-align:center;padding:2rem;">No orders yet</td></tr>' :
      orders.map(o => `
        <tr>
          <td>${o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A'}</td>
          <td>${o.productTitle || 'N/A'}</td>
          <td>${o.userName || 'Guest'}</td>
          <td>${o.userEmail || 'N/A'}</td>
          <td><span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:10px;font-size:12px;">${o.status || 'new'}</span></td>
        </tr>
      `).join('');
  });
}

// ==========================================
// INQUIRIES
// ==========================================
function renderInquiries() {
  database.ref('inquiries').orderByChild('createdAt').limitToLast(50).once('value').then(snapshot => {
    const data = snapshot.val();
    const inquiries = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse() : [];
    
    document.getElementById('inquiriesTableBody').innerHTML = inquiries.length === 0 ?
      '<tr><td colspan="4" style="text-align:center;padding:2rem;">No inquiries yet</td></tr>' :
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

// ==========================================
// STATS
// ==========================================
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

// Global
window.addSpecRow = addSpecRow;
window.addPricingRow = addPricingRow;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateStats();
  renderProductsTable();
});
