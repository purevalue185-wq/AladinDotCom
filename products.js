// ==========================================
// ALADINDOTCOM - PRODUCTS PAGE SCRIPT
// ==========================================

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
    renderProducts();
    setActiveFilter();
  });
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
    container.innerHTML = `<div class="no-products" style="grid-column:1/-1;"><i class="fas fa-search" style="font-size:3rem;color:#d1d5db;"></i><h3>No Products</h3><a href="products.html" class="btn btn-primary" style="margin-top:1rem;">Show All</a></div>`;
    return;
  }
  
  container.innerHTML = filtered.map(p => `
    <div class="deal-card" onclick="goToDetail('${p.id}')">
      <div class="deal-img">
        ${p.img || '📦'}
        <span class="deal-badge">TOP DEAL</span>
        ${p.rating >= 4.8 ? '<span class="hot-badge">HOT</span>' : ''}
      </div>
      <div class="deal-info">
        <div class="deal-title">${p.title}</div>
        <div class="deal-price">${p.price || 'Contact'}</div>
        <div class="deal-moq">${p.moq || 'Flexible MOQ'}</div>
        <div class="deal-sold">
          <i class="fas fa-star" style="color:#f59e0b;"></i> ${p.rating||'4.5'} 
          <span style="margin:0 0.5rem;">|</span>
          <i class="fas fa-shopping-cart"></i> ${p.reviews||0} orders
        </div>
        <div class="deal-supplier">${p.supplier || 'Verified Supplier'}</div>
        <button class="btn btn-primary btn-full" onclick="event.stopPropagation();goToDetail('${p.id}')" style="margin-top:0.5rem;">View Details</button>
        <button class="btn btn-accent btn-full" onclick="event.stopPropagation();orderNow('${p.id}','${escapeStr(p.title)}')" style="margin-top:0.3rem;"><i class="fab fa-whatsapp"></i> Contact Supplier</button>
      </div>
    </div>
  `).join('');
}

function goToDetail(id) { window.location.href = 'product-detail.html?id=' + id; }
function escapeStr(s) { return s ? s.replace(/'/g,"\\'").replace(/"/g,'\\"') : ''; }

function orderNow(id, title) {
  const phone = '15551234567';
  const msg = `🛒 Interested in: ${title} (ID:${id})\nPlease send best price & MOQ.`;
  database.ref('orders').push({ productId:id, productTitle:title, status:'new', createdAt:firebase.database.ServerValue.TIMESTAMP });
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const cat = this.dataset.category;
    location.href = cat === 'all' ? 'products.html' : 'products.html?category=' + cat;
  });
});

document.getElementById('productSearchBtn')?.addEventListener('click', () => {
  const q = document.getElementById('productSearchInput').value.trim();
  if(q) location.href = 'products.html?search=' + encodeURIComponent(q);
});

document.getElementById('hamburgerBtn')?.addEventListener('click',()=>document.getElementById('navLinks').classList.toggle('show'));

window.openModal=function(id){document.getElementById(id).classList.add('active');};
window.closeModal=function(id){document.getElementById(id).classList.remove('active');};
window.loginWithEmail=function(){
  const e=document.getElementById('loginEmail').value.trim();
  const p=document.getElementById('loginPassword').value;
  if(!e||!p) return alert('Fill fields');
  auth.signInWithEmailAndPassword(e,p).then(()=>{closeModal('loginModal');if(e==='purevalue185@gmail.com')location.href='admin.html';}).catch(err=>alert(err.message));
};
window.signupWithEmail=function(){
  const n=document.getElementById('signupName').value.trim();
  const e=document.getElementById('signupEmail').value.trim();
  const p=document.getElementById('signupPassword').value;
  if(!n||!e||!p) return alert('Fill fields');
  if(p.length<6) return alert('Password 6+ chars');
  auth.createUserWithEmailAndPassword(e,p).then(r=>r.user.updateProfile({displayName:n})).then(()=>{closeModal('signupModal');alert('Welcome!');}).catch(err=>alert(err.message));
};
window.loginWithGoogle=function(){auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(()=>closeModal('loginModal')).catch(()=>{});};
window.signupWithGoogle=function(){auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(()=>closeModal('signupModal')).catch(()=>{});};
window.logout=function(){auth.signOut();};
window.goToDetail=goToDetail;
window.orderNow=orderNow;

document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',function(e){if(e.target===this)this.classList.remove('active');}));
document.addEventListener('DOMContentLoaded', loadProducts);
