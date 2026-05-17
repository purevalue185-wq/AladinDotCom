// ==========================================
// ALADINDOTCOM - PRODUCT DETAIL PAGE
// FINAL WORKING VERSION
// ==========================================

let currentUser = null;
let currentProduct = null;
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

console.log('=== PRODUCT DETAIL PAGE ===');
console.log('Product ID from URL:', productId);

auth.onAuthStateChanged(user => {
  currentUser = user;
  updateUI();
});

function updateUI() {
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userDisplay = document.getElementById('userDisplay');
  if (currentUser) {
    if(loginBtn) loginBtn.style.display = 'none';
    if(signupBtn) signupBtn.style.display = 'none';
    if(logoutBtn) logoutBtn.style.display = 'inline-block';
    if(userDisplay) { userDisplay.style.display = 'inline'; userDisplay.textContent = '👤 ' + (currentUser.displayName || currentUser.email); }
  } else {
    if(loginBtn) loginBtn.style.display = 'inline-block';
    if(signupBtn) signupBtn.style.display = 'inline-block';
    if(logoutBtn) logoutBtn.style.display = 'none';
    if(userDisplay) userDisplay.style.display = 'none';
  }
}

function loadProductDetail() {
  console.log('Loading product detail...');
  
  if (!productId) {
    showError('No product ID specified.');
    return;
  }
  
  // Load ALL products and find the matching one
  database.ref('products').once('value')
    .then(snapshot => {
      const data = snapshot.val();
      console.log('All products data:', data);
      
      if (!data) {
        showError('No products found in database.');
        return;
      }
      
      // Get all products as array
      const allProducts = Object.values(data);
      console.log('Products array:', allProducts);
      
      // Find product by ID (try both string and number comparison)
      const product = allProducts.find(p => {
        return String(p.id) === String(productId) || p.id == productId;
      });
      
      console.log('Found product:', product);
      
      if (!product) {
        showError('Product not found. ID: ' + productId);
        return;
      }
      
      currentProduct = product;
      document.title = (product.title || 'Product') + ' - AladinDotCom';
      
      const breadcrumb = document.getElementById('breadcrumbTitle');
      if (breadcrumb) breadcrumb.textContent = product.title || 'Product Details';
      
      renderProductDetail(product);
      loadRelatedProducts(product);
    })
    .catch(error => {
      console.error('Error loading products:', error);
      showError('Error loading product. Please check console.');
    });
}

function showError(msg) {
  document.getElementById('productDetailContent').innerHTML = `
    <div style="text-align:center;padding:40px;background:white;border:1px solid #e8e8e8;border-radius:4px;">
      <i class="fas fa-exclamation-circle" style="font-size:50px;color:#ccc;"></i>
      <h2 style="margin:15px 0;color:#333;">${msg}</h2>
      <p style="color:#666;margin-bottom:20px;">The product you're looking for might have been removed.</p>
      <a href="products.html" class="btn btn-red">Browse Products</a>
      <a href="index.html" class="btn btn-white" style="margin-left:10px;">Go Home</a>
    </div>`;
}

function renderProductDetail(product) {
  const container = document.getElementById('productDetailContent');
  
  // Get images
  let images = [];
  if (product.images && product.images.length > 0) {
    images = product.images;
  } else if (product.img) {
    images = [product.img];
  } else {
    images = ['📦'];
  }
  
  const bulkPrices = product.bulkPrices || [];
  const specs = product.specifications || {};
  
  container.innerHTML = `
    <div class="detail-container">
      <!-- Image Gallery -->
      <div>
        <div class="detail-main-img" id="mainImg">
          ${renderImage(images[0])}
        </div>
        ${images.length > 1 ? `
        <div class="detail-thumbs" style="margin-top:8px;">
          ${images.map((img, i) => `
            <div class="detail-thumb ${i===0?'active':''}" onclick="switchImage('${String(img).replace(/'/g, "\\'")}', this)">
              ${renderImage(img)}
            </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
      
      <!-- Product Info -->
      <div>
        <h1 style="font-size:20px;font-weight:600;color:#333;margin-bottom:10px;line-height:1.4;">${product.title || 'No Title'}</h1>
        
        <div style="display:flex;align-items:baseline;gap:10px;background:#fef2f2;padding:12px;border-radius:4px;margin:10px 0;">
          <span style="font-size:24px;font-weight:700;color:#E31E24;">${product.price || 'Contact for Price'}</span>
          <span style="font-size:13px;color:#666;">/ ${product.moq || 'Flexible MOQ'}</span>
        </div>
        
        <div style="font-size:13px;color:#666;margin:8px 0;">
          <span style="color:#f59e0b;">★</span> ${product.rating || '4.5'} | ${product.reviews || 0} reviews | ${Math.floor((product.reviews || 0) * 1.5)} orders
        </div>
        
        <div style="display:flex;gap:10px;margin:15px 0;flex-wrap:wrap;">
          <button class="btn btn-orange" onclick="contactSupplier()" style="flex:1;min-width:150px;padding:12px;">
            <i class="fab fa-whatsapp"></i> Contact Supplier
          </button>
          <button class="btn btn-red" onclick="startOrder()" style="flex:1;min-width:150px;padding:12px;">
            <i class="fas fa-shopping-cart"></i> Start Order
          </button>
        </div>
        
        <div style="background:#f0f9ff;border:1px solid #bae6fd;padding:12px;border-radius:4px;margin:10px 0;">
          <p style="font-weight:600;color:#0369a1;margin-bottom:4px;"><i class="fas fa-store"></i> ${product.supplier || 'Verified Supplier'}</p>
          <p style="font-size:12px;color:#666;margin:2px 0;"><i class="fas fa-check-circle" style="color:#10b981;"></i> Verified Supplier</p>
          <p style="font-size:12px;color:#666;margin:2px 0;"><i class="fas fa-truck"></i> Shipping: ${product.shipping || 'Worldwide Delivery'}</p>
        </div>
        
        ${bulkPrices.length > 0 ? `
        <div style="margin:15px 0;">
          <h4 style="font-size:14px;border-bottom:2px solid #e8e8e8;padding-bottom:5px;margin-bottom:8px;">📊 Bulk Pricing</h4>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead><tr style="background:#f5f5f5;"><th style="padding:8px;text-align:left;border:1px solid #eee;">Quantity</th><th style="padding:8px;text-align:left;border:1px solid #eee;">Unit Price</th></tr></thead>
            <tbody>
              ${bulkPrices.map(bp => `<tr><td style="padding:8px;border:1px solid #eee;">${bp.qty}</td><td style="padding:8px;border:1px solid #eee;font-weight:700;color:#E31E24;">${bp.price}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
        
        ${Object.keys(specs).length > 0 ? `
        <div style="margin:15px 0;">
          <h4 style="font-size:14px;border-bottom:2px solid #e8e8e8;padding-bottom:5px;margin-bottom:8px;">📋 Specifications</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;font-size:13px;">
            ${Object.entries(specs).map(([k,v]) => `
              <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f5f5f5;">
                <span style="color:#999;">${k}</span>
                <span style="font-weight:500;">${v}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <div style="margin:15px 0;">
          <h4 style="font-size:14px;border-bottom:2px solid #e8e8e8;padding-bottom:5px;margin-bottom:8px;">📝 Description</h4>
          <p style="font-size:13px;color:#666;line-height:1.6;">${product.desc || 'No description available. Contact supplier for more details.'}</p>
        </div>
      </div>
    </div>
  `;
}

function renderImage(img) {
  if (!img) return '📦';
  if (String(img).startsWith('http')) {
    return `<img src="${img}" style="width:100%;height:100%;object-fit:contain;" alt="Product" onerror="this.innerHTML='📦'">`;
  }
  return `<span style="font-size:3rem;">${img}</span>`;
}

function switchImage(img, el) {
  const mainImg = document.getElementById('mainImg');
  if (String(img).startsWith('http')) {
    mainImg.innerHTML = `<img src="${img}" style="width:100%;height:100%;object-fit:contain;" alt="Product">`;
  } else {
    mainImg.innerHTML = `<span style="font-size:5rem;">${img}</span>`;
  }
  document.querySelectorAll('.detail-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

function contactSupplier() {
  if (!currentProduct) return alert('Product not loaded');
  const phone = '15551234567';
  const msg = `Hi, I'm interested in:\n\n📦 Product: ${currentProduct.title}\n💰 Price: ${currentProduct.price}\n📦 MOQ: ${currentProduct.moq}\n\nPlease send more details.`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

function startOrder() {
  if (!currentProduct) return alert('Product not loaded');
  database.ref('orders').push({
    productId: currentProduct.id,
    productTitle: currentProduct.title,
    status: 'new',
    createdAt: firebase.database.ServerValue.TIMESTAMP
  });
  contactSupplier();
}

function loadRelatedProducts(product) {
  if (!product || !product.category) return;
  
  database.ref('products').orderByChild('category').equalTo(product.category).once('value')
    .then(snapshot => {
      const data = snapshot.val();
      const related = data ? Object.values(data).filter(p => String(p.id) !== String(product.id)).slice(0, 4) : [];
      const grid = document.getElementById('relatedProducts');
      if (!grid) return;
      
      if (related.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;padding:20px;">No related products found</p>';
        return;
      }
      
      grid.innerHTML = related.map(p => `
        <div class="product-card" onclick="location.href='product-detail.html?id=${p.id}'" style="cursor:pointer;">
          <div class="product-img">
            ${(p.img && String(p.img).startsWith('http')) ? `<img src="${p.img}" style="width:100%;height:100%;object-fit:cover;" alt="${p.title}">` : (p.img || '📦')}
          </div>
          <div class="product-info">
            <div class="product-title">${p.title}</div>
            <div class="price-range">${p.price || 'Contact'}</div>
            <button class="btn btn-red btn-full" onclick="event.stopPropagation();location.href='product-detail.html?id=${p.id}'">View Details</button>
          </div>
        </div>
      `).join('');
    });
}

// Auth functions
window.openModal = function(id) { document.getElementById(id).classList.add('active'); };
window.closeModal = function(id) { document.getElementById(id).classList.remove('active'); };
window.loginWithEmail = function() {
  const e = document.getElementById('loginEmail').value.trim();
  const p = document.getElementById('loginPassword').value;
  if(!e||!p) return alert('Fill all fields');
  auth.signInWithEmailAndPassword(e,p).then(()=>{closeModal('loginModal');if(e==='purevalue185@gmail.com')location.href='admin.html';}).catch(err=>alert(err.message));
};
window.signupWithEmail = function() {
  const n = document.getElementById('signupName').value.trim();
  const e = document.getElementById('signupEmail').value.trim();
  const p = document.getElementById('signupPassword').value;
  if(!n||!e||!p) return alert('Fill all fields');
  if(p.length<6) return alert('Password 6+ chars');
  auth.createUserWithEmailAndPassword(e,p).then(r=>r.user.updateProfile({displayName:n})).then(()=>{closeModal('signupModal');alert('Welcome!');}).catch(err=>alert(err.message));
};
window.loginWithGoogle = function() { auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(()=>closeModal('loginModal')).catch(()=>{}); };
window.signupWithGoogle = function() { auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(()=>closeModal('signupModal')).catch(()=>{}); };
window.logout = function() { auth.signOut().then(()=>location.reload()); };
window.switchImage = switchImage;
window.contactSupplier = contactSupplier;
window.startOrder = startOrder;

// Hamburger menu
document.getElementById('hamburgerBtn')?.addEventListener('click', () => {
  document.querySelector('.category-nav-links')?.classList.toggle('show');
});

// Nav search
document.getElementById('navSearchBtn')?.addEventListener('click', () => {
  const q = document.getElementById('navSearch').value.trim();
  if(q) window.location.href = 'products.html?search=' + encodeURIComponent(q);
});

// Close modals
document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', function(e) {
  if(e.target === this) this.classList.remove('active');
}));

// Start loading
document.addEventListener('DOMContentLoaded', loadProductDetail);
