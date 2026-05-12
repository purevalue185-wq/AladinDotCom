# products.js

```javascript id="qf5xva"
// ==========================================
// PRODUCTS PAGE SCRIPT
// ==========================================

let allProducts = [];

const urlParams =
  new URLSearchParams(location.search);

const categoryFilter =
  urlParams.get('category');

const searchQuery =
  urlParams.get('search');

// ==========================================
// LOAD PRODUCTS
// ==========================================
function loadProducts() {

  database.ref('products')

    .once('value')

    .then(snapshot => {

      const data = snapshot.val();

      if (!data) return;

      allProducts = Object.values(data);

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

    electronics:'Electronics',

    kitchen:'Kitchen Products',

    beauty:'Beauty Products',

    household:'Household Products'

  };

  // CATEGORY
  if (
    categoryFilter &&
    categoryNames[categoryFilter]
  ) {

    title.textContent =
      categoryNames[categoryFilter];

    subtitle.textContent =
      'Wholesale ' +
      categoryNames[categoryFilter];

  }

  // SEARCH
  else if (searchQuery) {

    title.textContent =
      'Search Results';

    subtitle.textContent =
      'Results for "' + searchQuery + '"';

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

  // CATEGORY
  if (
    categoryFilter &&
    categoryFilter !== 'all'
  ) {

    filtered = filtered.filter(

      p =>
      p.category === categoryFilter

    );

  }

  // SEARCH
  if (searchQuery) {

    const q =
      searchQuery.toLowerCase();

    filtered = filtered.filter(p =>

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
  document
    .getElementById('resultCount')

    .innerHTML =

    `Showing ${filtered.length} Products`;

  // EMPTY
  if (filtered.length === 0) {

    container.innerHTML = `

      <div class="empty-products">

        <h2>

          No Products Found

        </h2>

        <p>

          Try another keyword.

        </p>

      </div>

    `;

    return;

  }

  // PRODUCTS
  container.innerHTML = filtered.map(p => `

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

  location.href =
    'product-detail.html?id=' + id;

}

// ==========================================
// FILTER BUTTONS
// ==========================================
document
.querySelectorAll('.filter-btn')

.forEach(btn => {

  btn.addEventListener('click', function(){

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
