// ==========================================
// ALADINDOTCOM - HOMEPAGE SCRIPT
// ==========================================

let currentUser = null;
let products = [];

function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

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

function loadProducts() {
  database.ref('products').on('value', (snapshot) => {
    const data = snapshot.val();
    products = data ? Object.values(data) : [];
    renderCategories();
    renderFeaturedProducts();
  });
}

function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;

  const categories = [
    { name: 'Electronics', icon: 'fa-mobile-alt', slug: 'electronics' },
    { name: 'Kitchen Items', icon: 'fa-utensils', slug: 'kitchen' },
    { name: 'Beauty Products', icon: 'fa-spa', slug: 'beauty' },
    { name: 'Household', icon: 'fa-home', slug: 'household' },
    { name: 'Packaging', icon: 'fa-box', slug: 'packaging' },
    { name: 'Industrial', icon: 'fa-industry', slug: 'industrial' }
  ];

  grid.innerHTML = categories.map(c => `
    <div class="category-card" onclick="goToCategory('${c.slug}')">
      <i class="fas ${c.icon} category-icon"></i>
      <h3>${c.name}</h3>
    </div>
  `).join('');
}

function renderFeaturedProducts() {
  const container = document.getElementById('productsContainer');
  if (!container) return;

  const featuredProducts = products.slice(0, 6);

  if (featuredProducts.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem;">
        <i class="fas fa-box-open" style="font-size:3rem;color:var(--gray-500);"></i>
        <h3>No Products Yet</h3>
        <p>Check back soon!</p>
      </div>`;
    return;
  }

  container.innerHTML = featuredProducts.map(p => `
    <div class="product-card" onclick="goToProductDetail('${p.id}')" style="cursor:pointer;">
      <div class="product-img">${p.img || '📦'}</div>
      <div class="product-info">
        <span class="moq-badge">${p.moq || 'MOQ Available'}</span>
        <div class="product-title">${p.title}</div>
        <div class="price-range">${p.price || 'Contact for Price'}</div>
        <div class="rating">
          <i class="fas fa-star"></i> ${p.rating || '4.5'} | ${p.reviews || 0} orders
        </div>
        <button class="btn btn-primary btn-full" onclick="event.stopPropagation();goToProductDetail('${p.id}')" style="margin-top:0.5rem;">View Details</button>
        <button class="btn btn-accent btn-full" onclick="event.stopPropagation();orderWhatsApp('${p.id}', '${escapeStr(p.title)}')" style="margin-top:0.3rem;"><i class="fab fa-whatsapp"></i> Chat Now</button>
      </div>
    </div>
  `).join('');
}

function goToProductDetail(productId) {
  window.location.href = 'product-detail.html?id=' + productId;
}

function goToCategory(category) {
  window.location.href = 'products.html?category=' + category;
}

function goToAllProducts() {
  window.location.href = 'products.html';
}

function orderWhatsApp(productId, productTitle) {
  const phoneNumber = '15551234567';
  const userName = currentUser ? (currentUser.displayName || currentUser.email) : 'Guest';
  const userEmail = currentUser ? currentUser.email : 'Not logged in';
  
  const message = `🛒 *New Order*\n\n📦 ${productTitle}\n🆔 ID: ${productId}\n👤 ${userName}\n📧 ${userEmail}\n\nPlease send bulk pricing.`;
  
  database.ref('orders').push({
    productId, productTitle, userName, userEmail,
    userId: currentUser ? currentUser.uid : 'guest',
    status: 'new',
    createdAt: firebase.database.ServerValue.TIMESTAMP
  });
  
  window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
}

function escapeStr(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function loginWithEmail() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) return alert('Fill all fields');
  
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      closeModal('loginModal');
      if (email === 'purevalue185@gmail.com') window.location.href = 'admin.html';
    })
    .catch(e => alert('Error: ' + e.message));
}

function signupWithEmail() {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  if (!name || !email || !password) return alert('Fill all fields');
  if (password.length < 6) return alert('Password 6+ characters');
  
  auth.createUserWithEmailAndPassword(email, password)
    .then(r => r.user.updateProfile({ displayName: name }))
    .then(() => { closeModal('signupModal'); alert('Account created!'); })
    .catch(e => alert('Error: ' + e.message));
}

function loginWithGoogle() {
  auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .then(() => closeModal('loginModal'))
    .catch(e => { if (e.code !== 'auth/popup-closed-by-user') alert('Error: ' + e.message); });
}

function signupWithGoogle() {
  auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .then(() => closeModal('signupModal'))
    .catch(e => { if (e.code !== 'auth/popup-closed-by-user') alert('Error: ' + e.message); });
}

function logout() {
  auth.signOut().then(() => alert('Logged out'));
}

document.getElementById('sendInquiryBtn')?.addEventListener('click', () => {
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const message = document.getElementById('contactMessage').value.trim();
  if (!name || !email || !message) return alert('Fill all fields');
  
  database.ref('inquiries').push({
    name, email, message, status: 'new',
    createdAt: firebase.database.ServerValue.TIMESTAMP
  }).then(() => {
    alert('Message sent!');
    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactMessage').value = '';
  });
});

document.getElementById('heroSearchBtn')?.addEventListener('click', () => {
  const q = document.getElementById('heroSearchInput').value.trim();
  if (q) window.location.href = 'products.html?search=' + encodeURIComponent(q);
});

document.getElementById('navSearchBtn')?.addEventListener('click', () => {
  const q = document.getElementById('navSearch').value.trim();
  if (q) window.location.href = 'products.html?search=' + encodeURIComponent(q);
});

document.getElementById('hamburgerBtn')?.addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('show');
});

document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('active');
  });
});

window.openModal = openModal;
window.closeModal = closeModal;
window.loginWithEmail = loginWithEmail;
window.signupWithEmail = signupWithEmail;
window.loginWithGoogle = loginWithGoogle;
window.signupWithGoogle = signupWithGoogle;
window.logout = logout;
window.goToProductDetail = goToProductDetail;
window.goToCategory = goToCategory;
window.goToAllProducts = goToAllProducts;
window.orderWhatsApp = orderWhatsApp;

document.addEventListener('DOMContentLoaded', () => {
  console.log('Homepage Ready');
  loadProducts();
});
