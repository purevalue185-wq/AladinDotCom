function renderProducts() {

  const container =
    document.getElementById('allProductsContainer');

  if (!container) return;

  let filtered = allProducts;

  // CATEGORY
  if (
    categoryFilter &&
    categoryFilter !== 'all'
  ) {

    filtered = filtered.filter(
      p => p.category === categoryFilter
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
  const countEl =
    document.getElementById('resultCount');

  if (countEl) {

    countEl.innerHTML =
      `Showing ${filtered.length} Products`;

  }

  // EMPTY
  if (filtered.length === 0) {

    container.innerHTML = `

      <div class="empty-products">

        <h2>No Products Found</h2>

        <p>
          Try another category or keyword.
        </p>

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

          ${p.title || 'Wholesale Product'}

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
