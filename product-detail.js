// ==========================================
// ALADINDOTCOM - PRODUCT DETAIL PAGE (UPGRADED)
// ==========================================

let currentUser = null;
let currentProduct = null;
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

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
  if (!productId) {
    showError('Product not found.');
    return;
  }
  database.ref('products/' + productId).once('value').then(snapshot => {
    const product = snapshot.val();
    if (!product) {
      showError('Product not found.');
      return;
    }
    currentProduct = product;
    document.title = product.title + ' - AladinDotCom';
    document.getElementById('breadcrumbTitle').textContent = product.title;
    renderProductDetail(product);
    loadRelatedProducts(product.category, product.id);
  });
}

function showError(msg) {
  document.getElementById('productDetailContent').innerHTML = `
    <div style="text-align:center;padding:3rem;background:white;border:1px solid #e8e8e8;border-radius:3px;">
      <i class="fas fa-exclamation-circle" style="font-size:3rem;color:#999;"></i>
      <h2 style="margin:1rem 0;">${msg}</h2>
      <a href="products.html" class="btn btn-red">Browse Products</a>
    </div>`;
}

function renderProductDetail(product) {
  const container = document.getElementById('productDetailContent');
  
  let images = [];
  if (product.images && product.images.length > 0) {
    images = product.images.slice(0, 5);
  } else if (product.img) {
    images = [product.img];
  } else {
    images = ['📦'];
  }
  
  const bulkPrices = product.bulkPrices || [];
  const specs = product.specifications || {};
  
  container.innerHTML = `
    <div class="detail-container" style="margin-top:0;">
      <!-- Left - Image Gallery -->
      <div>
        <div class="detail-main-img" id="mainImg">
          ${renderImg(images[0], '100%', '100%', 'contain')}
        </div>
        <div class="detail-thumbs">
          ${images.map((img, i) => `
            <div class="detail-thumb ${i===0?'active':''}" onclick="changeImg('${escapeHtml(img)}', this)">
              ${renderImg(img, '100%', '100%', 'cover')}
            </div>
          `).join('')}
        </div>
        <p style="font-size:11px;color:#999;margin-top:6px;">${images.length} image${images.length>1?'s':''}</p>
      </div>
      
      <!-- Right - Product Info -->
      <div>
        <h1 style="font-size:18px;font-weight:600;color:#333;margin-bottom:8px;line-height:1.4;">${product.title}</h1>
        
        <div style="display:flex;align-items:center;gap:10px;margin:10px 0;padding:12px;background:#fef2f2;border-radius:4px;">
          <span style="font-size:24px;font-weight:700;color:#E31E24;">${product.price || 'Contact'}</span>
          <span style="font-size:13px;color:#666;">/ ${product.moq || 'Flexible MOQ'}</span>
        </div>
        
        <div style="font-size:13px;color:#666;margin:8px 0;">
          <span style="color:#f59e0b;">${'★'.repeat(Math.floor(product.rating||0))}${(product.rating||0)%1>=0.5?'½':''}</span>
          <strong>${product.rating||'4.5'}</strong> 
          <span>(${product.reviews||0} reviews | ${Math.floor((product.reviews||0)*1.5)} orders)</span>
        </div>
        
        <div style="display:flex;gap:10px;margin:15px 0;flex-wrap:wrap;">
          <button class="btn btn-orange btn-lg" onclick="contactSupplier()" style="flex:1;min-width:160px;">
            <i class="fab fa-whatsapp"></i> Contact Supplier
          </button>
          <button class="btn btn-red btn-lg" onclick="startOrder()" style="flex:1;min-width:160px;">
            <i class="fas fa-shopping-cart"></i> Start Order
          </button>
        </div>
        
        <!-- Supplier Info -->
        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:4px;padding:12px;margin:12px 0;">
          <p style="font-size:14px;font-weight:600;color:#0369a1;margin-bottom:4px;">
            <i class="fas fa-store"></i> ${product.supplier || 'Verified Supplier'}
          </p>
          <p style="font-size:12px;color:#666;margin:2px 0;">
            <i class="fas fa-check-circle" style="color:#10b981;"></i> Verified Supplier
          </p>
          <p style="font-size:12px;color:#666;margin:2px 0;">
            <i class="fas fa-truck"></i> Shipping: ${product.shipping || 'Worldwide Delivery'}
          </p>
          <p style="font-size:12px;color:#666;margin:2px 0;">
            <i class="fas fa-shield-alt"></i> Trade Assurance: 100% Product Quality Protection
          </p>
        </div>
        
        <!-- Bulk Pricing Table -->
        ${bulkPrices.length > 0 ? `
          <div style="margin:15px 0;">
            <h4 style="font-size:14px;font-weight:600;color:#333;margin-bottom:8px;padding-bottom:5px;border-bottom:2px solid #e8e8e8;">
              <i class="fas fa-table"></i> Bulk Pricing
            </h4>
            <table class="bulk-table">
              <thead><tr><th>Quantity Range</th><th>Unit Price</th></tr></thead>
              <tbody>
                ${bulkPrices.map(bp => `<tr><td>${bp.qty}</td><td><strong>${bp.price}</strong></td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
        
        <!-- Specifications -->
        ${Object.keys(specs).length > 0 ? `
          <div style="margin:15px 0;">
            <h4 style="font-size:14px;font-weight:600;color:#333;margin-bottom:8px;padding-bottom:5px;border-bottom:2px solid #e8e8e8;">
              <i class="fas fa-clipboard-list"></i> Specifications
            </h4>
            <div class="spec-list">
              ${Object.entries(specs).map(([k,v]) => `
                <div><span>${k}</span><span style="font-weight:500;">${v}</span></div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <!-- Description -->
        <div style="margin:15px 0;">
          <h4 style="font-size:14px;font-weight:600;color:#333;margin-bottom:8px;padding-bottom:5px;border-bottom:2px solid #e8e8e8;">
            <i class="fas fa-file-alt"></i> Product Description
          </h4>
          <p style="font-size:13px;color:#666;line-height:1.7;">${product.desc || 'Premium quality wholesale product. Contact supplier for more details and sample requests.'}</p>
        </div>
        
        <!-- Tags -->
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:15px;">
          <span style="background:#f5f5f5;padding:4px 10px;border-radius:3px;font-size:11px;color:#666;">${product.category || 'General'}</span>
          <span style="background:#f5f5f5;padding:4px 10px;border-radius:3px;font-size:11px;color:#666;">Wholesale</span>
          <span style="background:#f5f5f5;padding:4px 10px;border-radius:3px;font-size:11px;color:#666;">Bulk Order</span>
          <span style="background:#fef3c7;padding:4px 10px;border-radius:3px;font-size:11px;color:#92400e;">Trade Assurance</span>
        </div>
      </div>
    </div>
  `;
}

function renderImg(img, w, h, fit) {
  if (!img) return '📦';
  if (img.startsWith('http')) {
    return `<img src="${img}" style="width:${w};height:${h};object-fit:${fit};" alt="Product" onerror="this.parentElement.innerHTML='<span style=font-size:3rem>📦</span>'">`;
  }
  return `<span style="font-size:3rem;">${img}</span>`;
}

function escapeHtml(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function changeImg(img, el) {
  const mainImg = document.getElementById('mainImg');
  if (img.startsWith('http')) {
    mainImg.innerHTML = `<img src="${img}" style="width:100%;height:100%;object-fit:contain;" alt="Product">`;
  } else {
    mainImg.innerHTML = `<span style="font-size:5rem;">${img}</span>`;
  }
  document.querySelectorAll('.detail-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

function contactSupplier() {
  if (!currentProduct) return;
  const phone = '15551234567';
  const msg = `Hi, I'm interested in:\n\n📦 Product: ${currentProduct.title}\n💰 Price: ${currentProduct.price}\n📦 MOQ: ${currentProduct.moq}\n\nPlease send me:\n- Best bulk price\n- Shipping cost\n- Sample availability\n\nThank you!`;
  database.ref('orders').push({
    productId: currentProduct.id,
    productTitle: currentProduct.title,
    status: 'new',
    createdAt: firebase.database.ServerValue.TIMESTAMP
  });
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

function startOrder() {
  if (!currentProduct) return;
  database.ref('orders').push({
    productId: currentProduct.id,
    productTitle: currentProduct.title,
    userEmail: currentUser?.email || 'guest',
    status: 'new',
    createdAt: firebase.database.ServerValue.TIMESTAMP
  });
  contactSupplier();
}

function loadRelatedProducts(category, currentId) {
  database.ref('products').orderByChild('category').equalTo(category).once('value').then(snapshot => {
    const data = snapshot.val();
    const related = data ? Object.values(data).filter(p => p.id !== parseInt(currentId)).slice(0, 4) : [];
    const grid = document.getElementById('relatedProducts');
    if (!grid) return;
    
    if (related.length === 0) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;padding:2rem;">No related products</p>';
      return;
    }
    
    grid.innerHTML = related.map(p => `
      <div class="product-card" onclick="location.href='product-detail.html?id=${p.id}'" style="cursor:pointer;">
        <div class="product-img">
          ${(p.img&&p.img.startsWith('http')) ? `<img src="${p.img}" style="width:100%;height:100%;object-fit:cover;" alt="${p.title}">` : (p.img || '📦')}
        </div>
        <div class="product-info">
          <div class="product-title">${p.title}</div>
          <div class="price-range">${p.price || 'Contact'}</div>
          <div class="rating"><i class="fas fa-star"></i> ${p.rating||'4.5'} | ${p.reviews||0} orders</div>
          <button class="btn btn-red btn-full" onclick="event.stopPropagation();location.href='product-detail.html?id=${p.id}'" style="margin-top:5px;">View Details</button>
        </div>
      </div>
    `).join('');
  });
}

// Auth & Modal
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
window.logout = function() { auth.signOut().then(() => location.reload()); };
window.changeImg = changeImg;
window.contactSupplier = contactSupplier;
window.startOrder = startOrder;

// Hamburger
document.getElementById('hamburgerBtn')?.addEventListener('click', () => {
  document.querySelector('.category-nav-links').classList.toggle('show');
});

// Search
document.getElementById('navSearchBtn')?.addEventListener('click', () => {
  const q = document.getElementById('navSearch').value.trim();
  if(q) window.location.href = 'products.html?search=' + encodeURIComponent(q);
});
document.getElementById('navSearch')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const q = e.target.value.trim();
    if(q) window.location.href = 'products.html?search=' + encodeURIComponent(q);
  }
});

// Close modals
document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', function(e) { if(e.target === this) this.classList.remove('active'); }));

// Init
document.addEventListener('DOMContentLoaded', loadProductDetail);
