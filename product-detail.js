// ==========================================
// ALADINDOTCOM - PRODUCT DETAIL PAGE
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
    document.getElementById('productDetailContent').innerHTML = `
      <div style="text-align:center;padding:3rem;background:white;border:1px solid var(--border);border-radius:3px;">
        <i class="fas fa-exclamation-circle" style="font-size:3rem;color:#999;"></i>
        <h2 style="margin:1rem 0;">Product Not Found</h2>
        <a href="products.html" class="btn btn-red">Browse Products</a>
      </div>`;
    return;
  }
  database.ref('products/' + productId).once('value').then(snapshot => {
    const product = snapshot.val();
    if (!product) {
      document.getElementById('productDetailContent').innerHTML = `
        <div style="text-align:center;padding:3rem;background:white;border:1px solid var(--border);border-radius:3px;">
          <i class="fas fa-box-open" style="font-size:3rem;color:#999;"></i>
          <h2 style="margin:1rem 0;">Product Not Found</h2>
          <a href="products.html" class="btn btn-red">Browse Products</a>
        </div>`;
      return;
    }
    currentProduct = product;
    document.title = product.title + ' | AladinDotCom';
    document.getElementById('breadcrumbTitle').textContent = product.title;
    renderProductDetail(product);
    loadRelatedProducts(product.category, product.id);
  });
}

function renderImageHTML(img) {
  if (!img) return '📦';
  if (img.startsWith('http')) {
    return `<img src="${img}" style="width:100%;height:100%;object-fit:cover;" alt="Product" onerror="this.innerHTML='<span style=font-size:3rem>📦</span>'">`;
  }
  return `<span style="font-size:3rem;">${img}</span>`;
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
    <div class="detail-container">
      <!-- Gallery -->
      <div>
        <div class="detail-main-img" id="mainImg">
          ${renderImageHTML(images[0])}
        </div>
        <div class="detail-thumbs">
          ${images.map((img, i) => `
            <div class="detail-thumb ${i===0?'active':''}" onclick="changeImg('${img.replace(/'/g, "\\'")}', this)">
              ${renderImageHTML(img)}
            </div>
          `).join('')}
        </div>
        <p style="font-size:11px;color:#999;margin-top:6px;">${images.length} image${images.length>1?'s':''} | Click to view</p>
      </div>
      
      <!-- Product Info -->
      <div>
        <h1 class="detail-title">${product.title}</h1>
        
        <div class="detail-price-row">
          <span class="detail-price">${product.price || 'Contact for Price'}</span>
          <span class="detail-moq">${product.moq || 'Flexible MOQ'}</span>
        </div>
        
        <div class="rating" style="margin:8px 0;font-size:13px;">
          <span style="color:#f59e0b;">${'★'.repeat(Math.floor(product.rating||0))}${(product.rating||0)%1>=0.5?'½':''}</span>
          <strong>${product.rating||'4.5'}</strong> 
          <span style="color:#999;">(${product.reviews||0} reviews | ${Math.floor((product.reviews||0)*1.5)} orders)</span>
        </div>
        
        <div class="detail-actions">
          <button class="btn btn-orange btn-lg" onclick="contactSupplier()">
            <i class="fab fa-whatsapp"></i> Contact Supplier
          </button>
          <button class="btn btn-red btn-lg" onclick="startOrder()">
            <i class="fas fa-shopping-cart"></i> Start Order
          </button>
        </div>
        
        <div class="supplier-box">
          <h4><i class="fas fa-store"></i> ${product.supplier || 'Verified Supplier'}</h4>
          <p><i class="fas fa-check-circle" style="color:#10b981;"></i> Verified Supplier</p>
          <p><i class="fas fa-truck"></i> Shipping: ${product.shipping || 'Worldwide'}</p>
        </div>
        
        ${bulkPrices.length > 0 ? `
          <h4 style="margin-top:15px;">Bulk Pricing</h4>
          <table class="bulk-table">
            <thead><tr><th>Quantity</th><th>Unit Price</th></tr></thead>
            <tbody>
              ${bulkPrices.map(bp => `<tr><td>${bp.qty}</td><td><strong>${bp.price}</strong></td></tr>`).join('')}
            </tbody>
          </table>
        ` : ''}
        
        ${Object.keys(specs).length > 0 ? `
          <h4 style="margin-top:15px;">Specifications</h4>
          <div class="spec-list">
            ${Object.entries(specs).map(([k,v]) => `
              <div><span>${k}</span><span>${v}</span></div>
            `).join('')}
          </div>
        ` : ''}
        
        <h4 style="margin-top:15px;">Product Description</h4>
        <p style="font-size:13px;color:#666;line-height:1.6;">${product.desc || 'Premium quality wholesale product. Contact supplier for more details.'}</p>
      </div>
    </div>
  `;
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
  const msg = `Hi, I'm interested in:\n\n${currentProduct.title}\nPrice: ${currentProduct.price}\nMOQ: ${currentProduct.moq}\n\nPlease send more details.`;
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
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;">No related products found</p>';
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
          <button class="btn btn-red btn-full" onclick="event.stopPropagation();location.href='product-detail.html?id=${p.id}'" style="margin-top:5px;">View Details</button>
        </div>
      </div>
    `).join('');
  });
}

// Auth & Modal Functions
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

// Hamburger menu
document.getElementById('hamburgerBtn')?.addEventListener('click', () => {
  document.querySelector('.category-nav-links').classList.toggle('show');
});

// Close modals
document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', function(e) { if(e.target === this) this.classList.remove('active'); }));

// Search
document.getElementById('navSearchBtn')?.addEventListener('click', () => {
  const q = document.getElementById('navSearch').value.trim();
  if(q) window.location.href = 'products.html?search=' + encodeURIComponent(q);
});

// Initialize
document.addEventListener('DOMContentLoaded', loadProductDetail);
