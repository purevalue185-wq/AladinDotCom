```javascript id="final-script-js"
// ==========================================
// ALADINDOTCOM MAIN SCRIPT
// ==========================================

let currentUser = null;
let products = [];

// ==========================================
// AUTH STATE
// ==========================================
auth.onAuthStateChanged(user => {

  currentUser = user;

  updateUI();

});

// ==========================================
// UPDATE UI
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

      if (!data) return;

      products = Object.values(data);

      renderCategories();

      renderFeaturedProducts();

    })

    .catch(err => {

      console.error(err);

    });

}

// ==========================================
// RENDER CATEGORIES
// ==========================================
function renderCategories() {

  const grid =
    document.getElementById('categoriesGrid');

  if (!grid) return;

  const categories = [

    {
      name:'Electronics',
      icon:'fa-mobile-screen',
      slug:'electronics'
    },

    {
      name:'Kitchen',
      icon:'fa-kitchen-set',
      slug:'kitchen'
    },

    {
      name:'Beauty',
      icon:'fa-spa',
      slug:'beauty'
    },

    {
      name:'Household',
      icon:'fa-house',
      slug:'household'
    }

  ];

  grid.innerHTML = categories.map(c => `

    <div
      class="category-card"

      onclick="
        location.href=
        'products.html?category=${c.slug}'
      "
    >

      <div class="category-icon-wrap">

        <i class="fas ${c.icon} category-icon"></i>

      </div>

      <h3>

        ${c.name}

      </h3>

      <p>

        Wholesale Products

      </p>

    </div>

  `).join('');

}

// ==========================================
// FEATURED PRODUCTS
// ==========================================
function renderFeaturedProducts() {

  const container =
    document.getElementById('productsContainer');

  if (!container) return;

  const featured =
    products.slice(0,8);

  container.innerHTML = featured.map(p => `

    <div
      class="product-card"

      onclick="
        goToDetail('${p.id}')
      "
    >

      <!-- IMAGE -->
      <div class="product-img-wrap">

        <span class="verified-tag">

          Verified

        </span>

        <img

          src="${
            p.image ||
            'https://via.placeholder.com/500'
          }"

          alt="${p.title}"

          class="product-real-img"

        >

      </div>

      <!-- INFO -->
      <div class="product-info">

        <!-- BADGES -->
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

          ${p.title}

        </div>

        <!-- SUPPLIER -->
        <div class="supplier-name">

          <i class="fas fa-shield-alt"></i>

          ${p.supplier || 'Verified Supplier'}

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

        <!-- BUTTON -->
        <div class="product-bottom">

          <button
            class="view-btn"

            onclick="
              event.stopPropagation();
              goToDetail('${p.id}')
            "
          >

            View Details

          </button>

        </div>

      </div>

    </div>

  `).join('');

}

// ==========================================
// DETAIL PAGE
// ==========================================
function goToDetail(id){

  window.location.href =
    'product-detail.html?id=' + id;

}

// ==========================================
// LOGIN
// ==========================================
function loginWithEmail() {

  const email =
    document.getElementById('loginEmail')
    .value
    .trim();

  const password =
    document.getElementById('loginPassword')
    .value;

  if (!email || !password)
    return alert('Fill all fields');

  auth.signInWithEmailAndPassword(
    email,
    password
  )

  .then(() => {

    closeModal('loginModal');

  })

  .catch(err => {

    alert(err.message);

  });

}

// ==========================================
// SIGNUP
// ==========================================
function signupWithEmail() {

  const name =
    document.getElementById('signupName')
    .value
    .trim();

  const email =
    document.getElementById('signupEmail')
    .value
    .trim();

  const password =
    document.getElementById('signupPassword')
    .value;

  if (!name || !email || !password)
    return alert('Fill all fields');

  auth.createUserWithEmailAndPassword(
    email,
    password
  )

  .then(r =>

    r.user.updateProfile({

      displayName:name

    })

  )

  .then(() => {

    closeModal('signupModal');

  })

  .catch(err => {

    alert(err.message);

  });

}

// ==========================================
// LOGOUT
// ==========================================
function logout(){

  auth.signOut();

}

// ==========================================
// MODALS
// ==========================================
function openModal(id){

  document
    .getElementById(id)
    .classList
    .add('active');

}

function closeModal(id){

  document
    .getElementById(id)
    .classList
    .remove('active');

}

// ==========================================
// CONTACT FORM
// ==========================================
document
.getElementById('sendInquiryBtn')

?.addEventListener('click', () => {

  const name =
    document
      .getElementById('contactName')
      .value
      .trim();

  const email =
    document
      .getElementById('contactEmail')
      .value
      .trim();

  const message =
    document
      .getElementById('contactMessage')
      .value
      .trim();

  if (!name || !email || !message)
    return alert('Fill all fields');

  database.ref('inquiries').push({

    name,
    email,
    message,

    createdAt:
    firebase.database.ServerValue.TIMESTAMP

  })

  .then(() => {

    alert('Inquiry Sent');

  });

});

// ==========================================
// SEARCH
// ==========================================
document
.getElementById('heroSearchBtn')

?.addEventListener('click', () => {

  const q =
    document
      .getElementById('heroSearchInput')
      .value
      .trim();

  if(q){

    location.href =
      'products.html?search=' +
      encodeURIComponent(q);

  }

});

document
.getElementById('navSearchBtn')

?.addEventListener('click', () => {

  const q =
    document
      .getElementById('navSearch')
      .value
      .trim();

  if(q){

    location.href =
      'products.html?search=' +
      encodeURIComponent(q);

  }

});

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
// INIT
// ==========================================
document.addEventListener(

  'DOMContentLoaded',

  loadProducts

);
```
