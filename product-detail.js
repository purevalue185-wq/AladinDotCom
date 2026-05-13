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
    if(logoutBtn) logoutBtn.style.display = 'inline-flex';
    if(userDisplay) { userDisplay.style.display = 'inline'; userDisplay.textContent = '👤 ' + (currentUser.displayName || currentUser.email); }
  } else {
    if(loginBtn) loginBtn.style.display = 'inline-flex';
    if(signupBtn) signupBtn.style.display = 'inline-flex';
    if(logoutBtn) logoutBtn.style.display = 'none';
    if(userDisplay) userDisplay.style.display = 'none';
  }
}

function loadProductDetail() {
  if (!productId) {
    document.getElementById('productDetailContent').innerHTML = '<div style="text-align:center;padding:3rem;"><h2>Product Not Found</h2><a href="products.html" class="btn btn-primary">Browse Products</a></div>';
    return;
  }
  database.ref('products/' + productId).once('value').then(snapshot => {
    const product = snapshot.val();
    if (!product) {
      document.getElementById('productDetailContent').innerHTML = '<div style="text-align:center;padding:3rem;"><h2>Product Not Found</h2><a href="products.html" class="btn btn-primary">Browse Products</a></div>';
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
    return `<img src="${img}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" alt="Product Image" onerror="this.parentElement.innerHTML='📦'">`;
  }
  return `<span style="font-size:4rem;">${img}</span>`;
}

function renderProductDetail(product) {
  const container = document.getElementById('productDetailContent');
  
  // Get all images (up to 5+)
  let images = [];
  if (product.images && product.images.length > 0) {
    images = product.images.slice(0, 5); // Show up to 5 images
  } else if (product.img) {
    images = [product.img];
  } else {
    images = ['📦'];
  }
  
  const bulkPrices = product.bulkPrices || [];
  const specs = product.specifications || {};
  
  container.innerHTML = `
    <div class="detail-container">
      <!-- Gallery with Multiple Images -->
      <div class="detail-gallery">
        <div class="detail-main-img" id="mainImg">
          ${renderImageHTML(images[0])}
        </div>
        <div class="detail-thumbs">
          ${images.map((img, i) => `
            <div class="detail-thumb ${i===0?'active':''}" onclick="changeImg('${img.replace(/'/g, "\\'")}', this)" style="overflow:hidden;">
              ${renderImageHTML(img)}
            </div>
          `).join('')}
        </div>
        <p style="font-size:0.8rem;color:#999;margin-top:0.5rem;">${images.length} image${images.length>1?'s':''} | Click thumbnails to view</p>
      </div>
      
      <!-- Product Info -->
      <div class="detail-info">
        <h1 class="detail-title">${product.title}</h1>
        
        <div class="detail-price-row">
          <span class="detail-price">${product.price || 'Contact for Price'}</span>
          <span class="detail-moq">${product.moq || 'Flexible MOQ'}</span>
        </div>
        
        <div class="detail-rating">
          <span style="color:#f59e0b;">${'★'.repeat(Math.floor(product.rating||0))}${(product.rating||0)%1>=0.5?'½':''}</span>
          <strong>${product.rating||'4.5'}</strong> 
          <span style="color:#999;">(${product.reviews||0} reviews | ${Math.floor((product.reviews||0)*1.5)} orders)</span>
        </div>
        
        <div class="detail-actions">
          <button class="btn btn-accent btn-lg" onclick="contactSupplier()">
            <i class="fab fa-whatsapp"></i> Contact Supplier
          </button>
          <button class="btn btn-primary btn-lg" onclick="startOrder()">
            <i class="fas fa-shopping-cart"></i> Start Order
          </button>
        </div>
        
        <div class="detail-supplier-box">
          <h4><i class="fas fa-store"></i> ${product.supplier || 'Verified Supplier'}</h4>
          <p><i class="fas fa-check-circle" style="color:#10b981;"></i> Verified Supplier</p>
          <p><i class="fas fa-truck"></i> Shipping: ${product.shipping || 'Worldwide'}</p>
        </div>
        
        ${bulkPrices.length > 0 ? `
          <div class="detail-pricing">
            <h4>📊 Bulk Pricing</h4>
            <table class="bulk-pricing-table">
              <thead><tr><th>Quantity</th><th>Unit Price</th></tr></thead>
              <tbody>
                ${bulkPrices.map(bp => `<tr><td>${bp.qty}</td><td><strong>${bp.price}</strong></td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
        
        ${Object.keys(specs).length > 0 ? `
          <div class="detail-specs">
            <h4>📋 Specifications</h4>
            <div class="specifications-list">
              ${Object.entries(specs).map(([k,v]) => `
                <div class="spec-row"><span>${k}</span><span>${v}</span></div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <div class="detail-desc">
          <h4>📝 Product Description</h4>
          <p>${product.desc || 'Premium quality wholesale product. Contact supplier for more details.'}</p>
        </div>
      </div>
    </div>
  `;
}

function changeImg(img, el) {
  const mainImg = document.getElementById('mainImg');
  if (img.startsWith('http')) {
    mainImg.innerHTML = `<img src="${img}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" alt="Product">`;
  } else {
    mainImg.innerHTML = `<span style="font-size:8rem;">${img}</span>`;
  }
  document.querySelectorAll('.detail-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

function contactSupplier() {
  if (!currentProduct) return;
  const phone = '15551234567';
  const msg = `Hi, I'm interested in:\n\n${currentProduct.title}\nPrice: ${currentProduct.price}\nMOQ: ${currentProduct.moq}\n\nPlease send more details.`;
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
    grid.innerHTML = related.length === 0 ? '<p style="grid-column:1/-1;">No related products</p>' : related.map(p => `
      <div class="product-card" onclick="location.href='product-detail.html?id=${p.id}'" style="cursor:pointer;">
        <div class="product-img">${(p.img&&p.img.startsWith('http'))?`<img src="${p.img}" style="width:100%;height:100%;object-fit:cover;">`:p.img||'📦'}</div>
        <div class="product-info">
          <div class="product-title">${p.title}</div>
          <div class="price-range">${p.price||'Contact'}</div>
          <button class="btn btn-primary btn-full" onclick="event.stopPropagation();location.href='product-detail.html?id=${p.id}'">View</button>
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
window.logout=function(){auth.signOut();};
window.changeImg=changeImg;window.contactSupplier=contactSupplier;window.startOrder=startOrder;

document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',function(e){if(e.target===this)this.classList.remove('active');}));
document.addEventListener('DOMContentLoaded', loadProductDetail);
