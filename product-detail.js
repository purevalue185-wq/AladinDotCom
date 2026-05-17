// ==========================================
// ALADINDOTCOM - PRODUCT DETAIL PAGE
// ==========================================

let currentUser = null;
let currentProduct = null;
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

console.log('Product Detail Page Loaded');
console.log('Product ID:', productId);

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
  console.log('Loading product ID:', productId);
  
  if (!productId) {
    showError('No product ID specified.');
    return;
  }
  
  // Try loading from Firebase
  database.ref('products/' + productId).once('value')
    .then(snapshot => {
      const product = snapshot.val();
      console.log('Product from Firebase:', product);
      
      if (product) {
        currentProduct = product;
        document.title = (product.title || 'Product') + ' - AladinDotCom';
        document.getElementById('breadcrumbTitle').textContent = product.title || 'Product Details';
        renderProductDetail(product);
        loadRelatedProducts(product.category, product.id);
      } else {
        // Try loading all products and find by ID
        database.ref('products').once('value').then(allSnapshot => {
          const allData = allSnapshot.val();
          if (allData) {
            const allProducts = Object.values(allData);
            const found = allProducts.find(p => p.id == productId);
            console.log('Found product in list:', found);
            
            if (found) {
              currentProduct = found;
              document.title = (found.title || 'Product') + ' - AladinDotCom';
              document.getElementById('breadcrumbTitle').textContent = found.title || 'Product Details';
              renderProductDetail(found);
              loadRelatedProducts(found.category, found.id);
            } else {
              showError('Product not found. ID: ' + productId);
            }
          } else {
            showError('No products in database.');
          }
        });
      }
    })
    .catch(error => {
      console.error('Firebase error:', error);
      showError('Error loading product. Please try again.');
    });
}

function showError(msg) {
  document.getElementById('productDetailContent').innerHTML = `
    <div style="text-align:center;padding:3rem;background:white;border:1px solid #e8e8e8;border-radius:4px;">
      <i class="fas fa-exclamation-circle" style="font-size:3rem;color:#999;"></i>
      <h2 style="margin:1rem 0;">${msg}</h2>
      <p style="color:#666;margin-bottom:1rem;">The product you're looking for might have been removed or doesn't exist.</p>
      <a href="products.html" class="btn btn-red">Browse All Products</a>
      <a href="index.html" class="btn btn-white" style="margin-left:10px;">Go Home</a>
    </div>`;
}

function renderProductDetail(product) {
  const container = document.getElementById('productDetailContent');
  
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
      <div>
        <div class="detail-main-img" id="mainImg">
          ${renderImg(images[0])}
        </div>
        ${images.length > 1 ? `
        <div class="detail-thumbs">
          ${images.map((img, i) => `
            <div class="detail-thumb ${i===0?'active':''}" onclick="changeImg('${escapeHtml(String(img))}', this)">
              ${renderImg(img)}
            </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
      
      <div>
        <h1 style="font-size:18px;font-weight:600;margin-bottom:10px;">${product.title || 'No Title'}</h1>
        
        <div style="background:#fef2f2;padding:12px;border-radius:4px;margin:10px 0;">
          <span style="font-size:24px;font-weight:700;color:#E31E24;">${product.price || 'Contact for Price'}</span>
          <span style="font-size:13px;color:#666;margin-left:10px;">${product.moq || 'Flexible MOQ'}</span>
        </div>
        
        <div style="font-size:13px;color:#666;margin:8px 0;">
          <span style="color:#f59e0b;">★</span> ${product.rating||'4.5'} | ${product.reviews||0} reviews | ${Math.floor((product.reviews||0)*1.5)} orders
        </div>
        
        <div style="display:flex;gap:10px;margin:15px 0;">
          <button class="btn btn-orange btn-lg" onclick="contactSupplier()" style="flex:1;">
            <i class="fab fa-whatsapp"></i> Contact Supplier
          </button>
          <button class="btn btn-red btn-lg" onclick="startOrder()" style="flex:1;">
            <i class="fas fa-shopping-cart"></i> Start Order
          </button>
        </div>
        
        <div style="background:#f0f9ff;border:1px solid #bae6fd;padding:12px;border-radius:4px;margin:10px 0;">
          <p style="font-weight:600;color:#0369a1;"><i class="fas fa-store"></i> ${product.supplier || 'Verified Supplier'}</p>
          <p style="font-size:12px;color:#666;"><i class="fas fa-check-circle" style="color:#10b981;"></i> Verified Supplier</p>
          <p style="font-size:12px;color:#666;"><i class="fas fa-truck"></i> Shipping: ${product.shipping || 'Worldwide'}</p>
        </div>
        
        ${bulkPrices.length > 0 ? `
        <div style="margin:15px 0;">
          <h4 style="border-bottom:2px solid #e8e8e8;padding-bottom:5px;margin-bottom:8px;">Bulk Pricing</h4>
          <table class="bulk-table">
            <thead><tr><th>Quantity</th><th>Unit Price</th></tr></thead>
            <tbody>${bulkPrices.map(bp => `<tr><td>${bp.qty}</td><td><strong>${bp.price}</strong></td></tr>`).join('')}</tbody>
          </table>
        </div>
        ` : ''}
        
        ${Object.keys(specs).length > 0 ? `
        <div style="margin:15px 0;">
          <h4 style="border-bottom:2px solid #e8e8e8;padding-bottom:5px;margin-bottom:8px;">Specifications</h4>
          <div class="spec-list">
            ${Object.entries(specs).map(([k,v]) => `<div><span>${k}</span><span>${v}</span></div>`).join('')}
          </div>
        </div>
        ` : ''}
        
        <div style="margin:15px 0;">
          <h4 style="border-bottom:2px solid #e8e8e8;padding-bottom:5px;margin-bottom:8px;">Description</h4>
          <p style="font-size:13px;color:#666;line-height:1.6;">${product.desc || 'No description available.'}</p>
        </div>
      </div>
    </div>
  `;
}

function renderImg(img) {
  if (!img) return '📦';
  if (String(img).startsWith('http')) {
    return `<img src="${img}" style="width:100%;height:100%;object-fit:contain;" alt="Product" onerror="this.innerHTML='📦'">`;
  }
  return `<span style="font-size:3rem;">${img}</span>`;
}

function escapeHtml(str) {
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function changeImg(img, el) {
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
  if (!currentProduct) return;
  const phone = '15551234567';
  const msg = `Hi, I'm interested in:\n\nProduct: ${currentProduct.title}\nPrice: ${currentProduct.price}\nMOQ: ${currentProduct.moq}\n\nPlease send more details.`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

function startOrder() {
  if (!currentProduct) return;
  database.ref('orders').push({
    productId: currentProduct.id,
    productTitle: currentProduct.title,
    status: 'new',
    createdAt: firebase.database.ServerValue.TIMESTAMP
  });
  contactSupplier();
}

function loadRelatedProducts(category, currentId) {
  if (!category) return;
  database.ref('products').orderByChild('category').equalTo(category).once('value').then(snapshot => {
    const data = snapshot.val();
    const related = data ? Object.values(data).filter(p => p.id != currentId).slice(0, 4) : [];
    const grid = document.getElementById('relatedProducts');
    if (!grid) return;
    
    if (related.length === 0) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;padding:2rem;">No related products</p>';
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

window.openModal=function(id){document.getElementById(id).classList.add('active');};
window.closeModal=function(id){document.getElementById(id).classList.remove('active');};
window.loginWithEmail=function(){const e=document.getElementById('loginEmail').value.trim();const p=document.getElementById('loginPassword').value;if(!e||!p)return alert('Fill fields');auth.signInWithEmailAndPassword(e,p).then(()=>{closeModal('loginModal');if(e==='purevalue185@gmail.com')location.href='admin.html';}).catch(err=>alert(err.message));};
window.signupWithEmail=function(){const n=document.getElementById('signupName').value.trim();const e=document.getElementById('signupEmail').value.trim();const p=document.getElementById('signupPassword').value;if(!n||!e||!p)return alert('Fill fields');if(p.length<6)return alert('Password 6+ chars');auth.createUserWithEmailAndPassword(e,p).then(r=>r.user.updateProfile({displayName:n})).then(()=>{closeModal('signupModal');alert('Welcome!');}).catch(err=>alert(err.message));};
window.loginWithGoogle=function(){auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(()=>closeModal('loginModal')).catch(()=>{});};
window.signupWithGoogle=function(){auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(()=>closeModal('signupModal')).catch(()=>{});};
window.logout=function(){auth.signOut().then(()=>location.reload());};
window.changeImg=changeImg;
window.contactSupplier=contactSupplier;
window.startOrder=startOrder;

document.getElementById('hamburgerBtn')?.addEventListener('click',()=>{document.querySelector('.category-nav-links')?.classList.toggle('show');});
document.getElementById('navSearchBtn')?.addEventListener('click',()=>{const q=document.getElementById('navSearch').value.trim();if(q)window.location.href='products.html?search='+encodeURIComponent(q);});
document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',function(e){if(e.target===this)this.classList.remove('active');}));

document.addEventListener('DOMContentLoaded', ()=>{
  console.log('Product Detail Page Ready');
  loadProductDetail();
});
