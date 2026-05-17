// ==========================================
// ALADINDOTCOM - PRODUCT DETAIL PAGE
// FINAL VERSION - MATCHES YOUR FIREBASE STRUCTURE
// ==========================================

let currentUser = null;
let currentProduct = null;
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

console.log('=== PRODUCT DETAIL PAGE LOADED ===');
console.log('Looking for Product ID:', productId);

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
      <div style="text-align:center;padding:50px;background:white;border:1px solid #e8e8e8;border-radius:4px;">
        <h2>No Product ID</h2>
        <p style="color:#666;margin:10px 0;">Please select a product from our catalog.</p>
        <a href="products.html" class="btn btn-red">Browse Products</a>
      </div>`;
    return;
  }

  // Direct lookup by key (matching your Firebase structure)
  database.ref('products/' + productId).once('value')
    .then(snapshot => {
      console.log('Direct lookup result:', snapshot.val());
      
      if (snapshot.exists()) {
        const product = snapshot.val();
        product.id = productId; // Ensure ID is set
        displayProduct(product);
        return;
      }
      
      // Fallback: search all products
      console.log('Direct lookup failed, searching all products...');
      return database.ref('products').once('value').then(allSnapshot => {
        const data = allSnapshot.val();
        if (!data) {
          showNotFound();
          return;
        }
        
        // Search by matching id field
        for (const [key, value] of Object.entries(data)) {
          if (String(value.id) === String(productId) || String(key) === String(productId)) {
            console.log('Found product by search:', key, value);
            value.id = key; // Ensure ID is set
            displayProduct(value);
            return;
          }
        }
        
        showNotFound();
      });
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('productDetailContent').innerHTML = `
        <div style="text-align:center;padding:50px;background:white;border:1px solid #e8e8e8;border-radius:4px;">
          <h2>Error Loading Product</h2>
          <p style="color:#666;margin:10px 0;">Please try again later.</p>
          <a href="products.html" class="btn btn-red">Browse Products</a>
        </div>`;
    });
}

function showNotFound() {
  document.getElementById('productDetailContent').innerHTML = `
    <div style="text-align:center;padding:50px;background:white;border:1px solid #e8e8e8;border-radius:4px;">
      <i class="fas fa-box-open" style="font-size:50px;color:#ccc;"></i>
      <h2 style="margin:15px 0;">Product Not Found</h2>
      <p style="color:#666;margin-bottom:20px;">Product ID: ${productId}</p>
      <a href="products.html" class="btn btn-red">Browse Products</a>
      <a href="index.html" class="btn btn-white" style="margin-left:10px;">Go Home</a>
    </div>`;
}

function displayProduct(product) {
  currentProduct = product;
  console.log('Displaying product:', product);
  
  document.title = (product.title || 'Product') + ' - AladinDotCom';
  const breadcrumb = document.getElementById('breadcrumbTitle');
  if (breadcrumb) breadcrumb.textContent = product.title || 'Product Details';
  
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
  
  document.getElementById('productDetailContent').innerHTML = `
    <div class="detail-container">
      <div>
        <div class="detail-main-img" id="mainImg">${renderImg(images[0])}</div>
        ${images.length > 1 ? `
        <div class="detail-thumbs" style="margin-top:8px;">
          ${images.map((img, i) => `
            <div class="detail-thumb ${i===0?'active':''}" onclick="changeMainImage('${String(img).replace(/'/g, "\\'")}', this)">
              ${renderImg(img)}
            </div>
          `).join('')}
        </div>` : ''}
      </div>
      
      <div>
        <h1 style="font-size:20px;font-weight:600;color:#333;margin-bottom:10px;">${product.title || 'No Title'}</h1>
        
        <div style="background:#fef2f2;padding:12px;border-radius:4px;margin:10px 0;display:flex;align-items:baseline;gap:10px;">
          <span style="font-size:24px;font-weight:700;color:#E31E24;">${product.price || 'Contact'}</span>
          <span style="font-size:13px;color:#666;">/ ${product.moq || 'Flexible MOQ'}</span>
        </div>
        
        <div style="font-size:13px;color:#666;margin:8px 0;">
          <span style="color:#f59e0b;">★</span> ${product.rating||'4.5'} | ${product.reviews||0} reviews
        </div>
        
        <div style="display:flex;gap:10px;margin:15px 0;">
          <button class="btn btn-orange" onclick="contactWhatsApp()" style="flex:1;padding:12px;">
            <i class="fab fa-whatsapp"></i> Contact Supplier
          </button>
          <button class="btn btn-red" onclick="startOrder()" style="flex:1;padding:12px;">
            <i class="fas fa-shopping-cart"></i> Start Order
          </button>
        </div>
        
        <div style="background:#f0f9ff;border:1px solid #bae6fd;padding:12px;border-radius:4px;margin:10px 0;">
          <p style="font-weight:600;color:#0369a1;"><i class="fas fa-store"></i> ${product.supplier || 'Verified Supplier'}</p>
          <p style="font-size:12px;color:#666;"><i class="fas fa-truck"></i> Shipping: ${product.shipping || 'Worldwide'}</p>
        </div>
        
        ${bulkPrices.length > 0 ? `
        <div style="margin:15px 0;">
          <h4 style="border-bottom:2px solid #e8e8e8;padding-bottom:5px;">Bulk Pricing</h4>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead><tr style="background:#f5f5f5;"><th style="padding:8px;text-align:left;border:1px solid #eee;">Quantity</th><th style="padding:8px;text-align:left;border:1px solid #eee;">Price</th></tr></thead>
            <tbody>${bulkPrices.map(bp => `<tr><td style="padding:8px;border:1px solid #eee;">${bp.qty}</td><td style="padding:8px;border:1px solid #eee;font-weight:700;color:#E31E24;">${bp.price}</td></tr>`).join('')}</tbody>
          </table>
        </div>` : ''}
        
        ${Object.keys(specs).length > 0 ? `
        <div style="margin:15px 0;">
          <h4 style="border-bottom:2px solid #e8e8e8;padding-bottom:5px;">Specifications</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;font-size:13px;">
            ${Object.entries(specs).map(([k,v]) => `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f5f5f5;"><span style="color:#999;">${k}</span><span style="font-weight:500;">${v}</span></div>`).join('')}
          </div>
        </div>` : ''}
        
        <div style="margin:15px 0;">
          <h4 style="border-bottom:2px solid #e8e8e8;padding-bottom:5px;">Description</h4>
          <p style="font-size:13px;color:#666;line-height:1.6;">${product.desc || 'No description.'}</p>
        </div>
      </div>
    </div>`;
  
  // Load related products
  if (product.category) {
    loadRelatedProducts(product.category, product.id || productId);
  }
}

function renderImg(img) {
  if (!img) return '📦';
  if (String(img).startsWith('http')) {
    return `<img src="${img}" style="width:100%;height:100%;object-fit:contain;" onerror="this.innerHTML='📦'">`;
  }
  return `<span style="font-size:3rem;">${img}</span>`;
}

function changeMainImage(img, el) {
  const main = document.getElementById('mainImg');
  if (String(img).startsWith('http')) {
    main.innerHTML = `<img src="${img}" style="width:100%;height:100%;object-fit:contain;">`;
  } else {
    main.innerHTML = `<span style="font-size:5rem;">${img}</span>`;
  }
  document.querySelectorAll('.detail-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

function contactWhatsApp() {
  if (!currentProduct) return alert('Product not loaded');
  const phone = '15551234567';
  const msg = `Hi, I'm interested in:\n\n${currentProduct.title}\nPrice: ${currentProduct.price}\nMOQ: ${currentProduct.moq}\n\nPlease send details.`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

function startOrder() {
  if (!currentProduct) return alert('Product not loaded');
  database.ref('orders').push({
    productId: currentProduct.id || productId,
    productTitle: currentProduct.title,
    status: 'new',
    createdAt: firebase.database.ServerValue.TIMESTAMP
  });
  contactWhatsApp();
}

function loadRelatedProducts(category, currentId) {
  database.ref('products').orderByChild('category').equalTo(category).once('value').then(snapshot => {
    const data = snapshot.val();
    const related = data ? Object.entries(data)
      .filter(([key]) => String(key) !== String(currentId))
      .map(([key, value]) => ({...value, id: key}))
      .slice(0, 4) : [];
    
    const grid = document.getElementById('relatedProducts');
    if (!grid) return;
    
    if (related.length === 0) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;padding:20px;">No related products</p>';
      return;
    }
    
    grid.innerHTML = related.map(p => `
      <div class="product-card" onclick="location.href='product-detail.html?id=${p.id}'" style="cursor:pointer;">
        <div class="product-img">${(p.img&&String(p.img).startsWith('http'))?`<img src="${p.img}" style="width:100%;height:100%;object-fit:cover;">`:p.img||'📦'}</div>
        <div class="product-info">
          <div class="product-title">${p.title}</div>
          <div class="price-range">${p.price||'Contact'}</div>
          <button class="btn btn-red btn-full" onclick="event.stopPropagation();location.href='product-detail.html?id=${p.id}'">View</button>
        </div>
      </div>
    `).join('');
  });
}

// Auth
window.openModal=function(id){document.getElementById(id).classList.add('active');};
window.closeModal=function(id){document.getElementById(id).classList.remove('active');};
window.loginWithEmail=function(){const e=document.getElementById('loginEmail').value.trim();const p=document.getElementById('loginPassword').value;if(!e||!p)return alert('Fill fields');auth.signInWithEmailAndPassword(e,p).then(()=>{closeModal('loginModal');if(e==='purevalue185@gmail.com')location.href='admin.html';}).catch(err=>alert(err.message));};
window.signupWithEmail=function(){const n=document.getElementById('signupName').value.trim();const e=document.getElementById('signupEmail').value.trim();const p=document.getElementById('signupPassword').value;if(!n||!e||!p)return alert('Fill fields');if(p.length<6)return alert('Password 6+ chars');auth.createUserWithEmailAndPassword(e,p).then(r=>r.user.updateProfile({displayName:n})).then(()=>{closeModal('signupModal');alert('Welcome!');}).catch(err=>alert(err.message));};
window.loginWithGoogle=function(){auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(()=>closeModal('loginModal')).catch(()=>{});};
window.signupWithGoogle=function(){auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(()=>closeModal('signupModal')).catch(()=>{});};
window.logout=function(){auth.signOut().then(()=>location.reload());};
window.changeMainImage=changeMainImage;
window.contactWhatsApp=contactWhatsApp;
window.startOrder=startOrder;

document.getElementById('hamburgerBtn')?.addEventListener('click',()=>document.querySelector('.category-nav-links')?.classList.toggle('show'));
document.getElementById('navSearchBtn')?.addEventListener('click',()=>{const q=document.getElementById('navSearch').value.trim();if(q)window.location.href='products.html?search='+encodeURIComponent(q);});
document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',function(e){if(e.target===this)this.classList.remove('active');}));

document.addEventListener('DOMContentLoaded', loadProductDetail);
