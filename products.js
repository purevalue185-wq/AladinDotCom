// ==========================================
// ALADINDOTCOM - PRODUCTS PAGE SCRIPT
// FINAL VERSION
// ==========================================

let currentUser = null;
let allProducts = [];
const urlParams = new URLSearchParams(location.search);
const categoryFilter = urlParams.get('category');
const searchQuery = urlParams.get('search');

auth.onAuthStateChanged(user => { currentUser = user; updateUI(); });

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

function loadProducts() {
  database.ref('products').once('value').then(snapshot => {
    const data = snapshot.val();
    allProducts = data ? Object.values(data) : [];
    updatePageTitle();
    renderProducts();
    setActiveFilter();
  });
}

function updatePageTitle() {
  const title = document.getElementById('pageTitle');
  const subtitle = document.getElementById('pageSubtitle');
  if (!title || !subtitle) return;
  
  if (categoryFilter) {
    const names = {electronics:'Electronics',kitchen:'Kitchen',beauty:'Beauty',household:'Household',packaging:'Packaging',industrial:'Industrial'};
    title.textContent = names[categoryFilter] || 'Products';
    subtitle.textContent = 'Wholesale ' + (names[categoryFilter] || '') + ' at factory prices';
  } else if (searchQuery) {
    title.textContent = 'Search Results';
    subtitle.textContent = 'Results for: "' + searchQuery + '"';
  } else {
    title.textContent = 'All Products';
    subtitle.textContent = 'Browse our complete wholesale catalog';
  }
}

function setActiveFilter() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (categoryFilter && btn.dataset.category === categoryFilter) btn.classList.add('active');
    else if (!categoryFilter && btn.dataset.category === 'all') btn.classList.add('active');
  });
}

function renderProducts() {
  const container = document.getElementById('allProductsContainer');
  if (!container) return;
  
  let filtered = allProducts;
  if (categoryFilter && categoryFilter !== 'all') filtered = allProducts.filter(p => p.category === categoryFilter);
  if (searchQuery) { 
    const q = searchQuery.toLowerCase(); 
    filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)); 
  }
  
  document.getElementById('resultCount').innerHTML = 'Showing <strong>' + filtered.length + '</strong> products';
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem;background:white;border:1px solid #e8e8e8;border-radius:3px;">
        <i class="fas fa-search" style="font-size:3rem;color:#d1d5db;"></i>
        <h3 style="margin:1rem 0;">No Products Found</h3>
        <p style="color:#999;">Try a different category or search term</p>
        <a href="products.html" class="btn btn-red" style="margin-top:1rem;">Show All Products</a>
      </div>`;
    return;
  }
  
  container.innerHTML = filtered.map(p => {
    const imgHTML = (p.img && p.img.startsWith('http')) 
      ? `<img src="${p.img}" style="width:100%;height:100%;object-fit:cover;" alt="${p.title}">`
      : (p.img || '📦');
    
    return `
    <div class="product-card" onclick="goToDetail('${p.id}')">
      <div class="product-img">${imgHTML}</div>
      <div class="product-info">
        <span class="moq-badge">${p.moq || 'MOQ Available'}</span>
        <div class="product-title">${p.title}</div>
        <div class="price-range">${p.price || 'Contact for Price'}</div>
        <div class="rating"><i class="fas fa-star"></i> ${p.rating||'4.5'} | ${p.reviews||0} orders</div>
        <p style="font-size:11px;color:#999;margin:3px 0;">${p.supplier || 'Verified Supplier'}</p>
        <button class="btn btn-red btn-full" onclick="event.stopPropagation();goToDetail('${p.id}')" style="margin-top:5px;">View Details</button>
        <button class="btn btn-orange btn-full" onclick="event.stopPropagation();orderNow('${p.id}','${escapeStr(p.title)}')" style="margin-top:4px;"><i class="fab fa-whatsapp"></i> Contact Supplier</button>
      </div>
    </div>`;
  }).join('');
}

function goToDetail(id) { window.location.href = 'product-detail.html?id=' + id; }
function escapeStr(s) { return s ? s.replace(/'/g,"\\'").replace(/"/g,'\\"') : ''; }

function orderNow(id, title) {
  const phone = '15551234567';
  database.ref('orders').push({ 
    productId: id, 
    productTitle: title, 
    status: 'new', 
    createdAt: firebase.database.ServerValue.TIMESTAMP 
  });
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent('🛒 Interested in: ' + title + ' (ID:' + id + ')\nPlease send best price & MOQ.')}`, '_blank');
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => { 
  btn.addEventListener('click', function() { 
    const cat = this.dataset.category; 
    location.href = cat === 'all' ? 'products.html' : 'products.html?category=' + cat; 
  }); 
});

// Search
document.getElementById('productSearchBtn')?.addEventListener('click', () => { 
  const q = document.getElementById('productSearchInput').value.trim(); 
  if(q) location.href = 'products.html?search=' + encodeURIComponent(q); 
});

// Enter key search
document.getElementById('productSearchInput')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const q = e.target.value.trim();
    if(q) location.href = 'products.html?search=' + encodeURIComponent(q);
  }
});

// Hamburger menu
document.getElementById('hamburgerBtn')?.addEventListener('click', () => {
  document.querySelector('.category-nav-links').classList.toggle('show');
});

// Modal functions
window.openModal = function(id) { document.getElementById(id).classList.add('active'); };
window.closeModal = function(id) { document.getElementById(id).classList.remove('active'); };

// Auth functions
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

// Global functions
window.goToDetail = goToDetail;
window.orderNow = orderNow;

// Close modals on outside click
document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', function(e) { if(e.target === this) this.classList.remove('active'); }));

// Initialize
document.addEventListener('DOMContentLoaded', loadProducts);
