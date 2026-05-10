let currentUser = null;
let allProducts = [];
const urlParams = new URLSearchParams(location.search);
const categoryFilter = urlParams.get('category');
const searchQuery = urlParams.get('search');

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

function loadProducts() {
  database.ref('products').once('value').then(snapshot => {
    const data = snapshot.val();
    allProducts = data ? Object.values(data) : [];
    updatePageHeader();
    renderProducts();
    setActiveFilter();
  });
}

function updatePageHeader() {
  const title = document.getElementById('pageTitle');
  const subtitle = document.getElementById('pageSubtitle');
  
  const categoryNames = {
    'electronics': 'Electronics',
    'kitchen': 'Kitchen Items',
    'beauty': 'Beauty Products',
    'household': 'Household Products',
    'packaging': 'Packaging Materials',
    'industrial': 'Industrial Items'
  };
  
  if (categoryFilter && categoryNames[categoryFilter]) {
    title.textContent = categoryNames[categoryFilter];
    subtitle.textContent = 'Bulk wholesale ' + categoryFilter + ' products';
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
  if (categoryFilter && categoryFilter !== 'all') {
    filtered = allProducts.filter(p => p.category === categoryFilter);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }
  
  document.getElementById('resultCount').innerHTML = 'Showing <span>' + filtered.length + '</span> products';
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;grid-column:1/-1;padding:4rem;background:white;border-radius:1rem;">
        <i class="fas fa-search" style="font-size:4rem;color:#cbd5e1;"></i>
        <h3>No Products Found</h3>
        <p>Try different category or search</p>
        <a href="products.html" class="btn btn-primary" style="margin-top:1rem;">Show All</a>
      </div>`;
    return;
  }
  
  container.innerHTML = filtered.map(p => `
    <div class="product-card" onclick="goToDetail('${p.id}')" style="cursor:pointer;">
      <div class="product-img">${p.img || '📦'}</div>
      <div class="product-info">
        <span class="moq-badge">${p.moq || 'MOQ Available'}</span>
        <div class="product-title">${p.title}</div>
        <div class="rating">${'★'.repeat(Math.floor(p.rating||0))} (${p.reviews||0})</div>
        <div class="price-range">${p.price || 'Contact'}</div>
        <button class="btn btn-primary btn-full" onclick="event.stopPropagation();goToDetail('${p.id}')">View Details</button>
        <button class="btn btn-accent btn-full" onclick="event.stopPropagation();orderNow('${p.id}','${escapeStr(p.title)}')" style="margin-top:0.5rem;">WhatsApp Order</button>
      </div>
    </div>
  `).join('');
}

function goToDetail(id) { window.location.href = 'product-detail.html?id=' + id; }
function escapeStr(s) { return s.replace(/'/g,"\\'").replace(/"/g,'\\"'); }

function orderNow(id, title) {
  const phone = '15551234567';
  const msg = `🛒 Order: ${title} (ID:${id})`;
  database.ref('orders').push({ productId:id, productTitle:title, status:'new', createdAt:firebase.database.ServerValue.TIMESTAMP });
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
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

// Auth functions
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function loginWithEmail() {
  const e = document.getElementById('loginEmail').value.trim();
  const p = document.getElementById('loginPassword').value;
  if(!e||!p) return alert('Fill fields');
  auth.signInWithEmailAndPassword(e,p).then(()=>{closeModal('loginModal');if(e==='purevalue185@gmail.com')location.href='admin.html';}).catch(err=>alert(err.message));
}
function signupWithEmail() {
  const n = document.getElementById('signupName').value.trim();
  const e = document.getElementById('signupEmail').value.trim();
  const p = document.getElementById('signupPassword').value;
  if(!n||!e||!p) return alert('Fill fields');
  if(p.length<6) return alert('Password 6+ chars');
  auth.createUserWithEmailAndPassword(e,p).then(r=>r.user.updateProfile({displayName:n})).then(()=>{closeModal('signupModal');alert('Created!');}).catch(err=>alert(err.message));
}
function loginWithGoogle() { auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(()=>closeModal('loginModal')).catch(()=>{}); }
function signupWithGoogle() { auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(()=>closeModal('signupModal')).catch(()=>{}); }
function logout() { auth.signOut(); }

document.getElementById('hamburgerBtn')?.addEventListener('click',()=>document.getElementById('navLinks').classList.toggle('show'));
document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',function(e){if(e.target===this)this.classList.remove('active');}));

window.openModal=openModal; window.closeModal=closeModal;
window.loginWithEmail=loginWithEmail; window.signupWithEmail=signupWithEmail;
window.loginWithGoogle=loginWithGoogle; window.signupWithGoogle=signupWithGoogle;
window.logout=logout; window.goToDetail=goToDetail; window.orderNow=orderNow;

document.addEventListener('DOMContentLoaded', loadProducts);
