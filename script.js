function renderFeaturedProducts() {

  const container =
    document.getElementById('productsContainer');

  if (!container) return;

  // SHOW 8 PRODUCTS
  const featuredProducts = products.slice(0, 8);

  // EMPTY STATE
  if (featuredProducts.length === 0) {

    container.innerHTML = `

      <div class="empty-products">

        <i class="fas fa-box-open"></i>

        <h3>No Products Available</h3>

        <p>
          Wholesale products will appear here soon.
        </p>

      </div>

    `;

    return;

  }

  // RENDER PRODUCTS
  container.innerHTML = featuredProducts.map(p => `

    <div
      class="product-card"
      onclick="goToProductDetail('${p.id}')"
    >

      <!-- IMAGE -->
      <div class="product-img-wrap">

        <!-- VERIFIED -->
        <span class="verified-tag">

          Verified

        </span>

        <!-- PRODUCT IMAGE -->
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

            Fast Ship

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

        <!-- RATINGS -->
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

        <!-- BUTTONS -->
        <div class="product-bottom">

          <button

            class="view-btn"

            onclick="
              event.stopPropagation();
              goToProductDetail('${p.id}')
            "

          >

            <i class="fas fa-eye"></i>

            View

          </button>

          <button

            class="whatsapp-btn"

            onclick="
              event.stopPropagation();
              orderWhatsApp(
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
