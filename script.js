// ==========================================
// ALADINDOTCOM - MAIN SCRIPT
// ==========================================

let currentUser = null;
let products = [];

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
// FIREBASE AUTH STATE
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
// LOAD PRODUCTS FROM FIREBASE
// ==========================================
function loadProducts() {
  const productsRef = database.ref('products');
  
  productsRef.on('value', (snapshot) => {
    const data = snapshot.val();
    products = data ? Object.values(data) : [];
    console.log('Products loaded:', products.length);
    renderCategories();
    renderProducts();
  }, (error) => {
    console.error('Error loading products:', error);
  });
}

// ==========================================
// RENDER CATEGORIES
// ==========================================
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
    <div class="category-card" onclick="filterByCategory('${c.slug}')">
      <i class="fas ${c.icon} category-icon"></i>
      <h3>${c.name}</h3>
    </div>
  `).join('');
}

// ==========================================
// RENDER PRODUCTS - WITH CLICKABLE CARDS
// ==========================================
function renderProducts(filteredProducts = null) {
  const container = document.getElementById('productsContainer');
  if (!container) return;

  const displayProducts = filteredProducts || products.slice(0, 6);

  if (displayProducts.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem;">
        <i class="fas fa-box-open" style="font-size:3rem;color:var(--gray-600);"></i>
        <h3 style="margin-top:1rem;">No Products Found</h3>
        <p>Check back soon for new wholesale products!</p>
      </div>`;
    return;
  }

  container.innerHTML = displayProducts.map(p => `
    <div class="product-card" onclick="goToProductDetail('${p.id}')" style="cursor:pointer;">
      <div class="product-img">${p.img || '📦'}</div>
      <div class="product-info">
        <span class="moq-badge">${p.moq || 'MOQ Available'}</span>
        <div class="product-title">${p.title}</div>
        <div class="rating">
          ${'★'.repeat(Math.floor(p.rating || 0))}${(p.rating || 0) % 1 >= 0.5 ? '½' : ''} 
          <span style="color:var(--gray-600);">(${p.reviews || 0} reviews)</span>
        </div>
        <div class="price-range">${p.price || 'Contact for Best Price'}</div>
        <p style="font-size:0.85rem;color:var(--gray-600);">Supplier: ${p.supplier || 'Verified Supplier'}</p>
        <p style="font-size:0.85rem;color:var(--gray-600);">Shipping: ${p.shipping || 'Worldwide'}</p>
        
        <div style="display:flex;flex-direction:column;gap:0.5rem;margin-top:1rem;">
          <button class="btn btn-primary btn-full" onclick="event.stopPropagation();goToProductDetail('${p.id}')">
            <i class="fas fa-eye"></i> View Details
          </button>
          <button class="btn btn-accent btn-full" onclick="event.stopPropagation();orderViaWhatsApp('${p.id}', '${escapeString(p.title)}')">
            <i class="fab fa-whatsapp"></i> Order via WhatsApp
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ==========================================
// GO TO PRODUCT DETAIL PAGE
// ==========================================
function goToProductDetail(productId) {
  window.location.href = 'product-detail.html?id=' + productId;
}

// ==========================================
// HELPER: Escape string for JS
// ==========================================
function escapeString(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// ==========================================
// FILTER BY CATEGORY
// ==========================================
function filterByCategory(category) {
  // Go to products page with category filter
  window.location.href = 'products.html?category=' + category;
}

// ==========================================
// ORDER VIA WHATSAPP
// ==========================================
function orderViaWhatsApp(productId, productTitle) {
  const phoneNumber = '15551234567'; // 👈 CHANGE THIS TO YOUR WHATSAPP NUMBER
  const userName = currentUser ? (currentUser.displayName || currentUser.email) : 'Guest Customer';
  const userEmail = currentUser ? currentUser.email : 'Not logged in';
  
  const message = `🛒 *New Wholesale Order*\n\n` +
    `📦 *Product:* ${productTitle}\n` +
    `🆔 *Product ID:* ${productId}\n` +
    `👤 *Customer:* ${userName}\n` +
    `📧 *Email:* ${userEmail}\n\n` +
    `Please send me:\n` +
    `- Bulk pricing details\n` +
    `- MOQ information\n` +
    `- Shipping cost & time\n\n` +
    `Thank you! 🙏`;
  
  // Save order to Firebase
  database.ref('orders').push({
    productId: productId,
    productTitle: productTitle,
    userName: userName,
    userEmail: userEmail,
    userId: currentUser ? currentUser.uid : 'guest',
    status: 'new',
    createdAt: firebase.database.ServerValue.TIMESTAMP
  }).then(() => {
    console.log('Order saved to database');
  }).catch(error => {
    console.error('Error saving order:', error);
  });
  
  // Open WhatsApp
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, '_blank');
}

// ==========================================
// LOGIN FUNCTIONS
// ==========================================
function loginWithEmail() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    alert('Please fill in all fields.');
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then((result) => {
      closeModal('loginModal');
      document.getElementById('loginEmail').value = '';
      document.getElementById('loginPassword').value = '';
      
      if (email === 'purevalue185@gmail.com') {
        window.location.href = 'admin.html';
      } else {
        alert('Welcome! You can now place orders.');
      }
    })
    .catch((error) => {
      alert('Login failed: ' + error.message);
    });
}

function signupWithEmail() {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;

  if (!name || !email || !password) {
    alert('Please fill in all fields.');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters.');
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((result) => {
      return result.user.updateProfile({ displayName: name });
    })
    .then(() => {
      closeModal('signupModal');
      document.getElementById('signupName').value = '';
      document.getElementById('signupEmail').value = '';
      document.getElementById('signupPassword').value = '';
      alert('Account created successfully! Welcome to AladinDotCom!');
    })
    .catch((error) => {
      alert('Signup failed: ' + error.message);
    });
}

function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  
  auth.signInWithPopup(provider)
    .then(() => {
      closeModal('loginModal');
      alert('Welcome! You can now place orders.');
    })
    .catch((error) => {
      if (error.code === 'auth/unauthorized-domain') {
        alert('Google login is not available on this domain. Please use Email/Password login instead.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        // User closed popup, do nothing
      } else {
        alert('Error: ' + error.message);
      }
    });
}

function signupWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  
  auth.signInWithPopup(provider)
    .then(() => {
      closeModal('signupModal');
      alert('Account created! Welcome to AladinDotCom!');
    })
    .catch((error) => {
      if (error.code === 'auth/unauthorized-domain') {
        alert('Google signup is not available on this domain. Please use Email/Password signup instead.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        // User closed popup, do nothing
      } else {
        alert('Error: ' + error.message);
      }
    });
}

// ==========================================
// PHONE LOGIN
// ==========================================
let phoneVerificationId = null;

function loginWithPhone() {
  closeModal('loginModal');
  openModal('phoneModal');
  
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      size: 'normal',
      callback: () => {
        console.log('reCAPTCHA solved');
      }
    });
    window.recaptchaVerifier.render();
  }
}

function sendPhoneCode() {
  const phoneNumber = document.getElementById('phoneNumber').value.trim();
  
  if (!phoneNumber) {
    alert('Please enter your phone number.');
    return;
  }

  const appVerifier = window.recaptchaVerifier;
  
  auth.signInWithPhoneNumber(phoneNumber, appVerifier)
    .then((confirmationResult) => {
      phoneVerificationId = confirmationResult.verificationId;
      document.getElementById('sendCodeBtn').style.display = 'none';
      document.getElementById('codeSection').style.display = 'block';
      alert('Verification code sent to ' + phoneNumber);
    })
    .catch((error) => {
      alert('Error: ' + error.message);
    });
}

function verifyPhoneCode() {
  const code = document.getElementById('verificationCode').value.trim();
  
  if (!code) {
    alert('Please enter the verification code.');
    return;
  }

  const credential = firebase.auth.PhoneAuthProvider.credential(phoneVerificationId, code);
  
  auth.signInWithCredential(credential)
    .then(() => {
      closeModal('phoneModal');
      document.getElementById('phoneNumber').value = '';
      document.getElementById('verificationCode').value = '';
      document.getElementById('sendCodeBtn').style.display = 'block';
      document.getElementById('codeSection').style.display = 'none';
      alert('Phone verified! Welcome!');
    })
    .catch((error) => {
      alert('Invalid code: ' + error.message);
    });
}

function logout() {
  auth.signOut()
    .then(() => {
      alert('Logged out successfully.');
    })
    .catch((error) => {
      console.error('Logout error:', error);
    });
}

// ==========================================
// CONTACT FORM
// ==========================================
document.getElementById('sendInquiryBtn')?.addEventListener('click', () => {
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const message = document.getElementById('contactMessage').value.trim();

  if (!name || !email || !message) {
    alert('Please fill in all fields.');
    return;
  }

  database.ref('inquiries').push({
    name: name,
    email: email,
    message: message,
    status: 'new',
    createdAt: firebase.database.ServerValue.TIMESTAMP
  }).then(() => {
    alert('Thank you! Your message has been sent. We will reply within 24 hours.');
    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactMessage').value = '';
  }).catch((error) => {
    alert('Error sending message. Please try again.');
    console.error('Error:', error);
  });
});

// ==========================================
// SEARCH
// ==========================================
document.getElementById('heroSearchBtn')?.addEventListener('click', () => {
  const query = document.getElementById('heroSearchInput').value.trim().toLowerCase();
  
  if (!query) {
    renderProducts();
    return;
  }

  const filtered = products.filter(p => 
    (p.title && p.title.toLowerCase().includes(query)) ||
    (p.category && p.category.toLowerCase().includes(query)) ||
    (p.desc && p.desc.toLowerCase().includes(query))
  );
  
  renderProducts(filtered);
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('navSearchBtn')?.addEventListener('click', () => {
  const query = document.getElementById('navSearch').value.trim();
  if (query) {
    window.location.href = 'products.html?search=' + encodeURIComponent(query);
  }
});

// ==========================================
// MOBILE MENU
// ==========================================
document.getElementById('hamburgerBtn')?.addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('show');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('show');
  });
});

// ==========================================
// CLOSE MODALS
// ==========================================
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', function(e) {
    if (e.target === this) {
      this.classList.remove('active');
    }
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(modal => {
      modal.classList.remove('active');
    });
  }
});

// ==========================================
// SWITCH BETWEEN LOGIN/SIGNUP
// ==========================================
document.getElementById('switchToSignup')?.addEventListener('click', (e) => {
  e.preventDefault();
  closeModal('loginModal');
  openModal('signupModal');
});

document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
  e.preventDefault();
  closeModal('signupModal');
  openModal('loginModal');
});

// ==========================================
// INITIALIZE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('AladinDotCom initialized');
  loadProducts();
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
window.loginWithPhone = loginWithPhone;
window.sendPhoneCode = sendPhoneCode;
window.verifyPhoneCode = verifyPhoneCode;
window.logout = logout;
window.orderViaWhatsApp = orderViaWhatsApp;
window.filterByCategory = filterByCategory;
window.goToProductDetail = goToProductDetail;
