function renderProducts() {

  const container =
    document.getElementById('allProductsContainer');

  if (!container) return;

  let filtered = allProducts;

  // CATEGORY FILTER
  if (
    categoryFilter &&
    categoryFilter !== 'all'
  ) {

    filtered = filtered.filter(
      p => p.category === categoryFilter
    );

  }

  // SEARCH FILTER
  if (searchQuery) {

    const q = searchQuery.toLowerCase();

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
  document.getElementById('resultCount')
    .innerHTML =
    `Showing ${filtered.length} Products`;

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

        <span class="verified-tag">

          Verified

        </span>

        <img

          src="${
            p.image ||
            'https://via.placeholder.com/500x500'
          }"

          class="product-real-img"

          alt="${p.title}"

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
