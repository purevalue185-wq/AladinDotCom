// ==========================================
// PRODUCTS PAGE SCRIPT
// ==========================================

let currentUser = null;
let allProducts = [];
const urlParams = new URLSearchParams(location.search);
const categoryFilter = urlParams.get('category');
const searchQuery = urlParams.get('search');

// ==========================================
// AUTH STATE
// ==========================================
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
    if (loginBtn) loginBtn.style.display = 'none';
    if (signupBtn) signupBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
    if (userDisplay) {
      userDisplay.style.display = 'inline';
      userDisplay.textContent = '👤 ' + (currentUser.displayName || currentUser.email || 'User');
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (signupBtn) signupBtn.style.display = 'inline-flex';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (userDisplay) userDisplay.style.display = 'none';
  }
}

// ==========================================
// LOAD PRODUCTS
// ==========================================
function loadProducts() {
  database.ref('products').once('value').then(snapshot => {
    const data = snapshot.val();
    allProducts = data ? Object.values(data) : [];
    console.log('All products loaded:', allProducts.length);
    renderProducts();
    setActiveFilter();
  });
}

// ==========================================
// SET ACTIVE FILTER BUTTON
// ==========================================
function setActiveFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.classList.remove('active');
    if (categoryFilter && btn.dataset.category === categoryFilter) {
      btn.classList.add('active');
    } else if (!categoryFilter && btn.dataset.category === 'all') {
      btn.classList.add('active');
    }
  });
}

// ==========================================
// RENDER PRODUCTS
// ==========================================
function renderProducts() {
  const container = document.getElementById('allProductsContainer');
  if (!container) return;
  
  let filtered = allProducts;
  
  // Apply category filter
  if (categoryFilter && categoryFilter !== 'all') {
    filtered = allProducts.filter(p => p.category === categoryFilter);
  }
  
  // Apply search filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.desc && p.desc.toLowerCase().includes(q))
    );
  }
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;grid-column:1/-1;padding:3rem;">
        <i class="fas fa-search" style="font-size:3rem;color:var(--gray-400);"></i>
        <h3 style="margin-top:1rem;">No Products Found</h3>
        <p>Try adjusting your search or filter criteria</p>
        <button class="btn btn-primary" onclick="location.href='products.html'" style="margin-top:1rem;">Show All Products</button>
      </div>`;
    return;
  }
  
  container.innerHTML = filtered.map(p => `
    <div class="product-card" onclick="goToDetail('${p.id}')" style="cursor:pointer;">
      <div class="product-img">${p.img || '📦'}</div>
      <div class="product-info">
        <span class="moq-badge">${p.moq || 'MOQ Available'}</span>
        <div class="product-title">${p.title}</div>
        <div class="rating">
          ${'★'.repeat(Math.floor(p.rating || 0))}${(p.rating || 0) % 1 >= 0.5 ? '½' : ''} 
          (${p.reviews || 0})
        </div>
        <div class="price-range">${p.price || 'Contact for Price'}</div>
        <p style="font-size:0.85rem;color:var(--gray-600);">${p.supplier || 'Verified Supplier'}</p>
        <div style="display:flex;flex-direction:column;gap:0.5rem;margin-top:1rem;">
          <button class="btn btn-primary btn-full" onclick="event.stopPropagation();goToDetail('${p.id}')">
            <i class="fas fa-eye"></i> View Details
          </button>
          <button class="btn btn-accent btn-full" onclick="event.stopPropagation();orderWhatsApp('${p.id}', '${escapeStr(p.title)}')">
            <i class="fab fa-whatsapp"></i> Order Now
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ==========================================
// GO TO PRODUCT DETAIL
// ==========================================
function goToDetail(productId) {
  window.location.href = 'product-detail.html?id=' + productId;
}

// ==========================================
// ORDER VIA WHATSAPP
// ==========================================
function orderWhatsApp(productId, productTitle) {
  const phoneNumber = '15551234567'; // 👈 CHANGE THIS
  const userName = currentUser ? (currentUser.displayName || currentUser.email) : 'Guest';
  const userEmail = currentUser ? currentUser.email : 'Not logged in';
  
  const message = `🛒 *New Order*\n\n📦 ${productTitle}\n🆔 ID: ${productId}\n👤 ${userName}\n📧 ${userEmail}\n\nPlease send bulk pricing details.`;
  
  database.ref('orders').push({
    productId, productTitle, userName, userEmail,
    userId: currentUser ? currentUser.uid : 'guest',
    status: 'new',
    createdAt: firebase.database.ServerValue.TIMESTAMP
  });
  
  window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
}

// ==========================================
// HELPER
// ==========================================
function escapeStr(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// ==========================================
// FILTER BUTTONS
// ==========================================
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const cat = this.dataset.category;
    if (cat === 'all') {
      window.location.href = 'products.html';
    } else {
      window.location.href = 'products.html?category=' + cat;
    }
  });
});

// ==========================================
// SEARCH
// ==========================================
document.getElementById('productSearchBtn')?.addEventListener('click', () => {
  const q = document.getElementById('productSearchInput').value.trim();
  if (q) {
    window.location.href = 'products.html?search=' + encodeURIComponent(q);
  }
});

// Allow Enter key to search
document.getElementById('productSearchInput')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const q = e.target.value.trim();
    if (q) {
      window.location.href = 'products.html?search=' + encodeURIComponent(q);
    }
  }
});

// ==========================================
// MODAL FUNCTIONS
// ==========================================
function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// ==========================================
// AUTH FUNCTIONS
// ==========================================
function loginWithEmail() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) return alert('Fill all fields');

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      closeModal('loginModal');
      if (email === 'purevalue185@gmail.com') {
        window.location.href = 'admin.html';
      }
    })
    .catch(e => alert('Error: ' + e.message));
}

function signupWithEmail() {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;

  if (!name || !email || !password) return alert('Fill all fields');
  if (password.length < 6) return alert('Password must be 6+ characters');

  auth.createUserWithEmailAndPassword(email, password)
    .then(result => result.user.updateProfile({ displayName: name }))
    .then(() => {
      closeModal('signupModal');
      alert('Account created!');
    })
    .catch(e => alert('Error: ' + e.message));
}

function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(() => closeModal('loginModal'))
    .catch(e => {
      if (e.code !== 'auth/popup-closed-by-user') alert('Error: ' + e.message);
    });
}

function signupWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(() => closeModal('signupModal'))
    .catch(e => {
      if (e.code !== 'auth/popup-closed-by-user') alert('Error: ' + e.message);
    });
}

function logout() {
  auth.signOut().then(() => alert('Logged out'));
}

// ==========================================
// MOBILE MENU
// ==========================================
document.getElementById('hamburgerBtn')?.addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('show');
});

// ==========================================
// CLOSE MODALS
// ==========================================
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('active');
  });
});

// ==========================================
// MAKE FUNCTIONS GLOBAL
// ==========================================
window.openModal = openModal;
window.closeModal = closeModal;
window.loginWithEmail = loginWithEmail;
window.signupWithEmail = signupWithEmail;
window.loginWithGoogle = loginWithGoogle;
window.signupWithGoogle = signupWithGoogle;
window.logout = logout;
window.goToDetail = goToDetail;
window.orderWhatsApp = orderWhatsApp;

// ==========================================
// INITIALIZE
// ==========================================
document.addEventListener('DOMContentLoaded', loadProducts);
