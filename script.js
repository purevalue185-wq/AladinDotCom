// Global variables
let currentUser = null;
let verificationId = null;
let products = [];

// Categories
const categories = [
  {name:'Electronics',icon:'fa-mobile-alt',slug:'electronics'},
  {name:'Kitchen',icon:'fa-utensils',slug:'kitchen'},
  {name:'Beauty',icon:'fa-spa',slug:'beauty'},
  {name:'Household',icon:'fa-home',slug:'household'},
  {name:'Packaging',icon:'fa-box',slug:'packaging'},
  {name:'Industrial',icon:'fa-industry',slug:'industrial'}
];

// Modal functions
window.openModal = function(id) {
  document.getElementById(id).classList.add('active');
};
window.closeModal = function(id) {
  document.getElementById(id).classList.remove('active');
};

// Auth state
auth.onAuthStateChanged(user => {
  currentUser = user;
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userDisplay = document.getElementById('userDisplay');
  
  if (user) {
    if(loginBtn) loginBtn.style.display = 'none';
    if(signupBtn) signupBtn.style.display = 'none';
    if(logoutBtn) logoutBtn.style.display = 'inline-flex';
    if(userDisplay) {
      userDisplay.style.display = 'inline';
      userDisplay.textContent = user.email || user.phoneNumber || 'User';
    }
  } else {
    if(loginBtn) loginBtn.style.display = 'inline-flex';
    if(signupBtn) signupBtn.style.display = 'inline-flex';
    if(logoutBtn) logoutBtn.style.display = 'none';
    if(userDisplay) userDisplay.style.display = 'none';
  }
  loadProducts();
});

// Email Login
window.loginWithEmail = function() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  if(!email || !password) return alert('Fill all fields');
  
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      closeModal('loginModal');
      alert('Login successful!');
      if(email === 'purevalue185@gmail.com') window.location.href = 'admin.html';
    })
    .catch(e => alert(e.message));
};

// Email Signup
window.signupWithEmail = function() {
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  if(!name || !email || !password) return alert('Fill all fields');
  if(password.length < 6) return alert('Password must be 6+ characters');
  
  auth.createUserWithEmailAndPassword(email, password)
    .then(result => {
      return result.user.updateProfile({displayName: name});
    })
    .then(() => {
      closeModal('signupModal');
      alert('Account created! You can now see prices and order.');
    })
    .catch(e => alert(e.message));
};

// Google Login
window.loginWithGoogle = function() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => {
      closeModal('loginModal');
      alert('Welcome ' + result.user.displayName + '!');
    })
    .catch(e => alert(e.message));
};

// Google Signup
window.signupWithGoogle = function() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => {
      closeModal('signupModal');
      alert('Account created! Welcome ' + result.user.displayName + '!');
    })
    .catch(e => alert(e.message));
};

// Phone Login
window.loginWithPhone = function() {
  closeModal('loginModal');
  openModal('phoneModal');
  renderRecaptcha();
};

// Send phone code
window.sendPhoneCode = function() {
  const phone = document.getElementById('phoneNumber').value;
  if(!phone) return alert('Enter phone number');
  
  const appVerifier = window.recaptchaVerifier;
  auth.signInWithPhoneNumber(phone, appVerifier)
    .then(result => {
      verificationId = result.verificationId;
      document.getElementById('sendCodeBtn').style.display = 'none';
      document.getElementById('codeSection').style.display = 'block';
    })
    .catch(e => alert(e.message));
};

// Verify phone code
window.verifyPhoneCode = function() {
  const code = document.getElementById('verificationCode').value;
  const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, code);
  auth.signInWithCredential(credential)
    .then(() => {
      closeModal('phoneModal');
      alert('Phone verified!');
    })
    .catch(e => alert(e.message));
};

// Recaptcha
function renderRecaptcha() {
  if(!window.recaptchaVerifier) {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      size: 'normal',
      callback: () => {}
    });
    window.recaptchaVerifier.render();
  }
}

// Logout
window.logout = function() {
  auth.signOut().then(() => alert('Logged out'));
};

// Load products
function loadProducts() {
  database.ref('products').on('value', snapshot => {
    const data = snapshot.val();
    products = data ? Object.values(data) : [];
    renderCategories();
    renderProducts(products.slice(0, 4));
  });
}

function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  if(!grid) return;
  grid.innerHTML = categories.map(c => `
    <a href="products.html?category=${c.slug}" class="category-card">
      <i class="fas ${c.icon} category-icon"></i>
      <h3>${c.name}</h3>
    </a>
  `).join('');
}

function renderProducts(prods) {
  const container = document.getElementById('productsContainer');
  if(!container) return;
  
  if(!currentUser) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem;background:white;border-radius:1rem;">
        <i class="fas fa-lock" style="font-size:3rem;color:var(--gray-600);"></i>
        <h3 style="margin:1rem 0;">Login to See Prices</h3>
        <p>Register or login to view bulk wholesale prices and place orders.</p>
        <button class="btn btn-primary" onclick="openModal('signupModal')" style="margin-top:1rem;">Register Now</button>
      </div>`;
    return;
  }
  
  if(prods.length === 0) {
    container.innerHTML = '<p style="text-align:center;grid-column:1/-1;">No products</p>';
    return;
  }
  
  container.innerHTML = prods.map(p => `
    <div class="product-card" onclick="location.href='product-detail.html?id=${p.id}'">
      <div class="product-img">${p.img||'📦'}</div>
      <div class="product-info">
        <span class="moq-badge">${p.moq||'MOQ Available'}</span>
        <div class="product-title">${p.title}</div>
        <div class="rating">${'★'.repeat(Math.floor(p.rating||0))} (${p.reviews||0})</div>
        <div class="price-range">${p.price||'Contact'}</div>
        <button class="btn btn-primary btn-full" onclick="event.stopPropagation();orderProduct('${p.id}','${p.title}')">
          <i class="fab fa-whatsapp"></i> Order Now
        </button>
      </div>
    </div>
  `).join('');
}

// Order product
window.orderProduct = function(id, title) {
  if(!currentUser) return alert('Please login first!');
  
  const phone = '15551234567'; // Your WhatsApp number
  const message = `Hi! I want to order:\n\nProduct: ${title}\nID: ${id}\n\nMy Email: ${currentUser.email || 'N/A'}\n\nPlease send me more details.`;
  
  // Save order to Firebase
  database.ref('orders').push({
    productId: id,
    productTitle: title,
    userEmail: currentUser.email,
    userName: currentUser.displayName || 'User',
    userId: currentUser.uid,
    status: 'new',
    createdAt: firebase.database.ServerValue.TIMESTAMP
  });
  
  // Open WhatsApp
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
};

// Contact form
document.getElementById('sendInquiryBtn')?.addEventListener('click', () => {
  const name = document.getElementById('contactName').value;
  const email = document.getElementById('contactEmail').value;
  const message = document.getElementById('contactMessage').value;
  
  if(!name || !email || !message) return alert('Fill all fields');
  
  database.ref('inquiries').push({
    name, email, message, status: 'new',
    createdAt: firebase.database.ServerValue.TIMESTAMP
  }).then(() => {
    alert('Inquiry sent! We will contact you soon.');
    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactMessage').value = '';
  });
});

// Search
document.getElementById('heroSearchBtn')?.addEventListener('click', () => {
  const q = document.getElementById('heroSearchInput').value.trim();
  if(q) location.href = `products.html?search=${encodeURIComponent(q)}`;
});

// Mobile menu
document.getElementById('hamburgerBtn')?.addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('show');
});

// Close modals on outside click
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', function(e) {
    if(e.target === this) this.classList.remove('active');
  });
});

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});