// ==========================================
// ALADINDOTCOM - PRODUCTS PAGE FINAL VERSION
// ALIBABA STYLE MARKETPLACE UI
// ==========================================

let currentUser = null;
let allProducts = [];

const urlParams =
  new URLSearchParams(location.search);

const categoryFilter =
  urlParams.get('category');

const searchQuery =
  urlParams.get('search');

// ==========================================
// AUTH STATE
// ==========================================
auth.onAuthStateChanged(user => {

  currentUser = user;

  updateUI();

});

// ==========================================
// UPDATE NAVBAR UI
// ==========================================
function updateUI() {

  const loginBtn =
    document.getElementById('loginBtn');

  const signupBtn =
    document.getElementById('signupBtn');

  const logoutBtn =
    document.getElementById('logoutBtn');

  const userDisplay =
    document.getElementById('userDisplay');

  if (currentUser) {

    if (loginBtn)
      loginBtn.style.display = 'none';

    if (signupBtn)
      signupBtn.style.display = 'none';

    if (logoutBtn)
      logoutBtn.style.display = 'inline-flex';

    if (userDisplay) {

      userDisplay.style.display = 'inline-flex';

      userDisplay.innerHTML = `

        <i class="fas fa-user-circle"></i>

        ${currentUser.displayName || currentUser.email}

      `;

    }

  } else {

    if (loginBtn)
      loginBtn.style.display = 'inline-flex';

    if (signupBtn)
      signupBtn.style.display = 'inline-flex';

    if (logoutBtn)
      logoutBtn.style.display = 'none';

    if (userDisplay)
      userDisplay.style.display = 'none';

  }

}

// ==========================================
// LOAD PRODUCTS
// ==========================================
function loadProducts() {

  database.ref('products')

    .once('value')

    .then(snapshot => {

      const data = snapshot.val();

      allProducts =
        data
        ? Object.values(data)
        : [];

      updatePageHeader();

      renderProducts();

      setActiveFilter();

    });

}

// ==========================================
// PAGE HEADER
// ==========================================
function updatePageHeader() {

  const title =
    document.getElementById('pageTitle');

  const subtitle =
    document.getElementById('pageSubtitle');

  const categoryNames = {

    electronics: 'Electronics',

    kitchen: 'Kitchen Items',

    beauty: 'Beauty Products',

    household: 'Household Products',

    packaging: 'Packaging Materials',

    industrial: 'Industrial Products'

  };

  // CATEGORY
  if (
    categoryFilter &&
    categoryNames[categoryFilter]
  ) {

    title.textContent =
      categoryNames[categoryFilter];

    subtitle.textContent =
      'Bulk wholesale ' +
      categoryNames[categoryFilter];

  }

  // SEARCH
  else if (searchQuery) {

    title.textContent =
      'Search Results';

    subtitle.textContent =
      'Results for "' + searchQuery + '"';

  }

  // DEFAULT
  else {

    title.textContent =
      'All Products';

    subtitle.textContent =
      'Browse wholesale import products';

  }

}

// ==========================================
// ACTIVE FILTER
// ==========================================
function setActiveFilter() {

  document
    .querySelectorAll('.filter-btn')

    .forEach(btn => {

      btn.classList.remove('active');

      if (
        categoryFilter &&
        btn.dataset.category === categoryFilter
      ) {

        btn.classList.add('active');

      }

      else if (
        !categoryFilter &&
        btn.dataset.category === 'all'
      ) {

        btn.classList.add('active');

      }

    });

}

// ==========================================
// RENDER PRODUCTS
// ==========================================
function renderProducts() {

  const container =
    document.getElementById(
      'allProductsContainer'
    );

  if (!container) return;

  let filtered = allProducts;

  // CATEGORY FILTER
  if (
    categoryFilter &&
    categoryFilter !== 'all'
  ) {

    filtered =
      filtered.filter(
        p => p.category === categoryFilter
      );

  }

  // SEARCH FILTER
  if (searchQuery) {

    const q =
      searchQuery.toLowerCase();

    filtered =
      filtered.filter(p =>

        (p.title || '')
          .toLowerCase()
          .includes(q)

        ||

        (p.category || '')
          .toLowerCase()
          .includes(q)

      );

  }

  // COUNT
  document.getElementById(
    'resultCount'
  ).innerHTML =

  `Showing <span>${filtered.length}</span> Products`;

  // EMPTY
  if (filtered.length === 0) {

    container.innerHTML = `

      <div class="empty-products">

        <i class="fas fa-search"></i>

        <h3>
          No Products Found
        </h3>

        <p>
          Try different keywords or categories.
        </p>

        <a
          href="products.html"
          class="btn btn-primary"
        >

          Show All Products

        </a>

      </div>

    `;

    return;

  }

  // PRODUCTS
  container.innerHTML = filtered.map(p => `

    <div
      class="product-card"
      onclick="goToDetail('${p.id}')"
    >

      <!-- IMAGE -->
      <div class="product-img-wrap">

        <!-- VERIFIED -->
        <span class="verified-tag">

          Verified

        </span>

        <!-- IMAGE -->
        <img

          src="${
            p.image ||
            'https://via.placeholder.com/600x600?text=Product'
          }"

          alt="${p.title}"

          class="product-real-img"

          loading="lazy"

        >

      </div>

      <!-- INFO -->
      <div class="product-info">

        <!-- TOP -->
        <div class="product-top-row">

          <span class="moq-badge">

            ${p.moq || 'MOQ Available'}

          </span>

          <span class="shipping-badge">

            Fast Shipping

          </span>

        </div>

        <!-- TITLE -->
        <div class="product-title">

          ${p.title || 'Wholesale Product'}

        </div>

        <!-- SUPPLIER -->
        <div class="supplier-name">

          <i class="fas fa-shield-alt"></i>

          ${p.supplier || 'Aladin Verified Supplier'}

        </div>

        <!-- RATING -->
        <div class="rating-row">

          <div class="rating-stars">

            ★★★★★

          </div>

          <span>

            (${p.reviews || 0})

          </span>

        </div>

        <!-- PRICE -->
        <div class="price-range">

          ${p.price || 'Rs Contact'}

        </div>

        <!-- BULK -->
        <div class="bulk-text">

          Bulk Pricing Available

        </div>

        <!-- SHIPPING -->
        <div class="shipping-text">

          Worldwide Shipping Available

        </div>

        <!-- BUTTONS -->
        <div class="product-bottom">

          <button

            class="view-btn"

            onclick="
              event.stopPropagation();
              goToDetail('${p.id}')
            "

          >

            <i class="fas fa-eye"></i>

            View Details

          </button>

          <button

            class="whatsapp-btn"

            onclick="
              event.stopPropagation();
              orderNow(
                '${p.id}',
                '${escapeStr(p.title || 'Product')}'
              )
            "

          >

            <i class="fab fa-whatsapp"></i>

          </button>

        </div>

      </div>

    </div>

  `).join('');

}

// ==========================================
// GO TO DETAIL
// ==========================================
function goToDetail(id) {

  window.location.href =
    'product-detail.html?id=' + id;

}

// ==========================================
// ESCAPE STRING
// ==========================================
function escapeStr(str) {

  return str

    .replace(/'/g, "\\'")

    .replace(/"/g, '\\"');

}

// ==========================================
// WHATSAPP ORDER
// ==========================================
function orderNow(id, title) {

  const phone =
    '947XXXXXXXX';

  const message =

`🛒 Wholesale Inquiry

📦 Product: ${title}

🆔 Product ID: ${id}

Please send MOQ pricing and shipping details.`;

  database.ref('orders').push({

    productId: id,

    productTitle: title,

    status: 'new',

    createdAt:
      firebase.database.ServerValue.TIMESTAMP

  });

  window.open(

    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,

    '_blank'

  );

}

// ==========================================
// FILTER BUTTONS
// ==========================================
document
.querySelectorAll('.filter-btn')

.forEach(btn => {

  btn.addEventListener('click', function() {

    const cat =
      this.dataset.category;

    location.href =

      cat === 'all'

      ? 'products.html'

      : 'products.html?category=' + cat;

  });

});

// ==========================================
// SEARCH
// ==========================================
document
.getElementById('productSearchBtn')

?.addEventListener('click', () => {

  const q =
    document
      .getElementById('productSearchInput')
      .value
      .trim();

  if (q) {

    location.href =
      'products.html?search=' +
      encodeURIComponent(q);

  }

});

// ==========================================
// MODALS
// ==========================================
function openModal(id) {

  document
    .getElementById(id)
    .classList
    .add('active');

}

function closeModal(id) {

  document
    .getElementById(id)
    .classList
    .remove('active');

}

// ==========================================
// LOGIN
// ==========================================
function loginWithEmail() {

  const email =
    document
      .getElementById('loginEmail')
      .value
      .trim();

  const password =
    document
      .getElementById('loginPassword')
      .value;

  if (!email || !password)
    return alert('Fill all fields');

  auth
    .signInWithEmailAndPassword(email, password)

    .then(() => {

      closeModal('loginModal');

      if (
        email === 'purevalue185@gmail.com'
      ) {

        location.href = 'admin.html';

      }

    })

    .catch(err => alert(err.message));

}

// ==========================================
// SIGNUP
// ==========================================
function signupWithEmail() {

  const name =
    document
      .getElementById('signupName')
      .value
      .trim();

  const email =
    document
      .getElementById('signupEmail')
      .value
      .trim();

  const password =
    document
      .getElementById('signupPassword')
      .value;

  if (!name || !email || !password)
    return alert('Fill all fields');

  if (password.length < 6)
    return alert('Password must be 6+ chars');

  auth
    .createUserWithEmailAndPassword(
      email,
      password
    )

    .then(r =>

      r.user.updateProfile({

        displayName: name

      })

    )

    .then(() => {

      closeModal('signupModal');

      alert('Account Created');

    })

    .catch(err => alert(err.message));

}

// ==========================================
// GOOGLE LOGIN
// ==========================================
function loginWithGoogle() {

  auth
    .signInWithPopup(
      new firebase.auth.GoogleAuthProvider()
    )

    .then(() => {

      closeModal('loginModal');

    })

    .catch(() => {});

}

function signupWithGoogle() {

  auth
    .signInWithPopup(
      new firebase.auth.GoogleAuthProvider()
    )

    .then(() => {

      closeModal('signupModal');

    })

    .catch(() => {});

}

// ==========================================
// LOGOUT
// ==========================================
function logout() {

  auth.signOut();

}

// ==========================================
// MOBILE MENU
// ==========================================
document
.getElementById('hamburgerBtn')

?.addEventListener('click', () => {

  document
    .getElementById('navLinks')
    .classList
    .toggle('show');

});

// ==========================================
// CLOSE MODAL
// ==========================================
document
.querySelectorAll('.modal')

.forEach(modal => {

  modal.addEventListener('click', function(e) {

    if (e.target === this) {

      this.classList.remove('active');

    }

  });

});

// ==========================================
// GLOBAL
// ==========================================
window.openModal = openModal;
window.closeModal = closeModal;

window.loginWithEmail = loginWithEmail;
window.signupWithEmail = signupWithEmail;

window.loginWithGoogle = loginWithGoogle;
window.signupWithGoogle = signupWithGoogle;

window.logout = logout;

window.goToDetail = goToDetail;
window.orderNow = orderNow;

// ==========================================
// INIT
// ==========================================
document.addEventListener(

  'DOMContentLoaded',

  loadProducts

);
