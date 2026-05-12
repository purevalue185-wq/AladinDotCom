// ==========================================
// ALADINDOTCOM PRODUCT DETAIL PAGE
// FINAL ALIBABA-STYLE VERSION
// ==========================================

const urlParams =
  new URLSearchParams(location.search);

const productId =
  parseInt(urlParams.get('id'));

// ==========================================
// LOAD PRODUCT
// ==========================================
function loadProduct() {

  database
    .ref('products/' + productId)

    .once('value')

    .then(snapshot => {

      const product = snapshot.val();

      // NOT FOUND
      if (!product) {

        document
          .getElementById(
            'productDetailContainer'
          )

          .innerHTML = `

            <div class="empty-products">

              <i class="fas fa-box-open"></i>

              <h2>
                Product Not Found
              </h2>

              <p>
                This product may have been removed.
              </p>

              <a
                href="products.html"
                class="btn btn-primary"
              >

                Back To Products

              </a>

            </div>

          `;

        return;

      }

      renderProduct(product);

      loadRelated(product.category);

    });

}

// ==========================================
// RENDER PRODUCT
// ==========================================
function renderProduct(product) {

  // BREADCRUMB
  document
    .getElementById('breadcrumbProduct')
    .textContent = product.title;

  // PAGE TITLE
  document.title =
    product.title + ' | AladinDotCom';

  // IMAGES
  const images =

    product.images && product.images.length

    ? product.images

    : [product.image];

  // RENDER
  document
    .getElementById('productDetailContainer')

    .innerHTML = `

      <div class="product-detail-layout">

        <!-- LEFT -->
        <div class="product-gallery">

          <!-- MAIN IMAGE -->
          <div class="gallery-main">

            <img

              src="${
                images[0] ||
                'https://via.placeholder.com/700x700?text=Product'
              }"

              id="mainProductImage"

              class="main-product-image"

            >

            <span class="verified-tag detail-tag">

              Verified

            </span>

          </div>

          <!-- THUMBS -->
          <div class="gallery-thumbs">

            ${images.map((img, i) => `

              <div
                class="gallery-thumb ${i===0?'active':''}"

                onclick="
                  changeMainImage('${img}',this)
                "
              >

                <img src="${img}">

              </div>

            `).join('')}

          </div>

        </div>

        <!-- RIGHT -->
        <div class="product-detail-info">

          <!-- TOP -->
          <div class="product-top-info">

            <span class="moq-badge">

              ${product.moq || 'MOQ Available'}

            </span>

            <span class="shipping-badge">

              Fast Shipping

            </span>

          </div>

          <!-- TITLE -->
          <h1 class="detail-title">

            ${product.title}

          </h1>

          <!-- RATINGS -->
          <div class="detail-rating-row">

            <div class="rating-stars">

              ★★★★★

            </div>

            <span>

              ${product.rating || 5.0}

            </span>

            <span>

              (${product.reviews || 0} Reviews)

            </span>

          </div>

          <!-- PRICE -->
          <div class="detail-price-box">

            <div class="price-label">

              Wholesale Price

            </div>

            <div class="detail-price">

              ${product.price || 'Rs Contact'}

            </div>

            <div class="bulk-text">

              Bulk pricing available

            </div>

          </div>

          <!-- SUPPLIER -->
          <div class="supplier-box">

            <div class="supplier-row">

              <span>

                Supplier

              </span>

              <strong>

                ${product.supplier || 'Aladin Verified Supplier'}

              </strong>

            </div>

            <div class="supplier-row">

              <span>

                Shipping

              </span>

              <strong>

                ${product.shipping || 'Worldwide Shipping'}

              </strong>

            </div>

            <div class="supplier-row">

              <span>

                Origin

              </span>

              <strong>

                China Import

              </strong>

            </div>

          </div>

          <!-- DESCRIPTION -->
          <div class="detail-description">

            <h3>

              Product Description

            </h3>

            <p>

              ${product.desc || 'No description available.'}

            </p>

          </div>

          <!-- BULK TABLE -->
          <div class="bulk-pricing-box">

            <h3>

              Bulk Pricing

            </h3>

            <table class="bulk-pricing-table">

              <thead>

                <tr>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Price
                  </th>

                </tr>

              </thead>

              <tbody>

                ${(product.bulkPrices || []).map(bp => `

                  <tr>

                    <td>

                      ${bp.qty}

                    </td>

                    <td>

                      <strong>

                        ${bp.price}

                      </strong>

                    </td>

                  </tr>

                `).join('')}

              </tbody>

            </table>

          </div>

          <!-- SPECIFICATIONS -->
          <div class="specifications-box">

            <h3>

              Specifications

            </h3>

            <div class="specifications-list">

              ${Object.entries(product.specifications || {})

                .map(([k,v]) => `

                <div class="spec-item">

                  <span>

                    ${k}

                  </span>

                  <strong>

                    ${v}

                  </strong>

                </div>

              `).join('')}

            </div>

          </div>

          <!-- ACTIONS -->
          <div class="detail-actions">

            <button

              class="btn btn-primary btn-large"

              onclick="
                orderNow(
                  '${product.id}',
                  '${escapeStr(product.title)}'
                )
              "
            >

              <i class="fas fa-envelope"></i>

              Send Inquiry

            </button>

            <a

              href="
                https://wa.me/947XXXXXXXX?text=
                I'm%20interested%20in%20${encodeURIComponent(product.title)}
              "

              target="_blank"

              class="btn btn-accent btn-large"
            >

              <i class="fab fa-whatsapp"></i>

              WhatsApp

            </a>

          </div>

        </div>

      </div>

    `;

}

// ==========================================
// CHANGE IMAGE
// ==========================================
function changeMainImage(img, el) {

  document
    .getElementById('mainProductImage')
    .src = img;

  document
    .querySelectorAll('.gallery-thumb')

    .forEach(t =>
      t.classList.remove('active')
    );

  el.classList.add('active');

}

// ==========================================
// RELATED PRODUCTS
// ==========================================
function loadRelated(category) {

  database
    .ref('products')

    .orderByChild('category')

    .equalTo(category)

    .once('value')

    .then(snapshot => {

      const data = snapshot.val();

      const related =

        data

        ? Object.values(data)

          .filter(p => p.id !== productId)

          .slice(0, 4)

        : [];

      document
        .getElementById('relatedProducts')

        .innerHTML =

        related.length === 0

        ? `

          <p class="empty-related">

            No Related Products

          </p>

        `

        :

        related.map(p => `

          <div
            class="product-card"
            onclick="
              location.href=
              'product-detail.html?id=${p.id}'
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
                  'https://via.placeholder.com/500x500'
                }"

                class="product-real-img"

              >

            </div>

            <!-- INFO -->
            <div class="product-info">

              <div class="product-title">

                ${p.title}

              </div>

              <div class="price-range">

                ${p.price || 'Rs Contact'}

              </div>

              <button
                class="view-btn"

                onclick="
                  event.stopPropagation();
                  location.href=
                  'product-detail.html?id=${p.id}'
                "
              >

                View Details

              </button>

            </div>

          </div>

        `).join('');

    });

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
// ESCAPE STRING
// ==========================================
function escapeStr(str) {

  return str

    .replace(/'/g, "\\'")

    .replace(/"/g, '\\"');

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
// SEARCH
// ==========================================
document
.getElementById('navSearchBtn')

?.addEventListener('click', () => {

  const q =
    document
      .getElementById('navSearch')
      .value
      .trim();

  if (q) {

    location.href =
      'products.html?search=' +
      encodeURIComponent(q);

  }

});

// ==========================================
// INIT
// ==========================================
document.addEventListener(

  'DOMContentLoaded',

  loadProduct

);
