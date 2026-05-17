// ==========================================
// PRODUCT DETAIL PAGE - WITH QUANTITY SELECTOR
// ==========================================

let currentProduct = null;
let selectedQuantity = 1;
let quantityType = 'pieces';
const urlParams = new URLSearchParams(window.location.search);
const pid = urlParams.get('id');

console.log('Product Detail Page - Looking for ID:', pid);

auth.onAuthStateChanged(user => {
  const lb = document.getElementById('loginBtn');
  const sb = document.getElementById('signupBtn');
  const ob = document.getElementById('logoutBtn');
  const ud = document.getElementById('userDisplay');
  if (user) {
    if(lb) lb.style.display = 'none';
    if(sb) sb.style.display = 'none';
    if(ob) ob.style.display = 'inline-block';
    if(ud) { ud.style.display = 'inline'; ud.textContent = '👤 ' + (user.displayName || user.email); }
  } else {
    if(lb) lb.style.display = 'inline-block';
    if(sb) sb.style.display = 'inline-block';
    if(ob) ob.style.display = 'none';
    if(ud) ud.style.display = 'none';
  }
});

function loadProduct() {
  if (!pid) {
    document.getElementById('productDetailContent').innerHTML = `
      <div style="text-align:center;padding:50px;background:white;border:1px solid #e8e8e8;border-radius:4px;">
        <i class="fas fa-box-open" style="font-size:50px;color:#ccc;"></i>
        <h2 style="margin:15px 0;">No Product Selected</h2>
        <p style="color:#666;">Please select a product from our catalog.</p>
        <a href="products.html" class="btn btn-red" style="margin-top:15px;">Browse Products</a>
      </div>`;
    return;
  }

  database.ref('products/' + pid).get().then(snap => {
    if (snap.exists()) {
      const p = snap.val();
      p._id = pid;
      showProduct(p);
      loadRelated(p.category, pid);
      return;
    }
    database.ref('products').get().then(all => {
      const data = all.val();
      if (!data) { showError(); return; }
      for (const [k, v] of Object.entries(data)) {
        if (String(k) === String(pid) || String(v.id) === String(pid)) {
          v._id = k;
          showProduct(v);
          loadRelated(v.category, k);
          return;
        }
      }
      showError();
    });
  }).catch(() => showError());
}

function showError() {
  document.getElementById('productDetailContent').innerHTML = `
    <div style="text-align:center;padding:50px;background:white;border:1px solid #e8e8e8;border-radius:4px;">
      <i class="fas fa-exclamation-circle" style="font-size:50px;color:#ccc;"></i>
      <h2 style="margin:15px 0;">Product Not Found</h2>
      <p style="color:#666;">The product you're looking for doesn't exist or was removed.</p>
      <a href="products.html" class="btn btn-red" style="margin-top:15px;">Browse Products</a>
    </div>`;
}

function showProduct(p) {
  currentProduct = p;
  document.title = (p.title || 'Product') + ' - AladinDotCom';
  document.getElementById('breadcrumbTitle').textContent = p.title || 'Details';

  const imgs = (p.images && p.images.length) ? p.images : (p.img ? [p.img] : ['📦']);
  const prices = p.bulkPrices || [];
  const specs = p.specifications || {};

  document.getElementById('productDetailContent').innerHTML = `
    <div class="detail-container">
      <div>
        <div class="detail-main-img" id="mainImg">${imgTag(imgs[0])}</div>
        ${imgs.length > 1 ? `
        <div class="detail-thumbs" style="margin-top:8px;">
          ${imgs.map((img, i) => `<div class="detail-thumb ${i===0?'active':''}" onclick="changeImg('${String(img).replace(/'/g, "\\'")}', this)">${imgTag(img)}</div>`).join('')}
        </div>` : ''}
        <p style="font-size:11px;color:#999;margin-top:6px;">${imgs.length} image${imgs.length>1?'s':''}</p>
      </div>
      <div>
        <h1 style="font-size:20px;font-weight:600;color:#333;margin-bottom:10px;">${p.title || 'No Title'}</h1>
        
        <div style="background:#fef2f2;padding:12px;border-radius:4px;margin:10px 0;display:flex;align-items:baseline;gap:10px;">
          <span style="font-size:24px;font-weight:700;color:#E31E24;">${p.price || 'Contact for Price'}</span>
          <span style="font-size:13px;color:#666;">/ ${p.moq || 'Flexible MOQ'}</span>
        </div>
        
        <div style="font-size:13px;color:#666;margin:8px 0;">
          <span style="color:#f59e0b;">★</span> ${p.rating||'4.5'} | ${p.reviews||0} reviews | ${Math.floor((p.reviews||0)*1.5)} orders
        </div>
        
        <!-- QUANTITY SELECTOR -->
        <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:15px;border-radius:8px;margin:15px 0;">
          <h4 style="font-size:14px;font-weight:600;color:#333;margin-bottom:10px;">
            <i class="fas fa-calculator"></i> Order Quantity
          </h4>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;border:2px solid #d1d5db;border-radius:6px;overflow:hidden;">
              <button onclick="decreaseQty()" style="background:#f3f4f6;border:none;padding:8px 15px;cursor:pointer;font-size:18px;font-weight:700;color:#333;">−</button>
              <input type="number" id="quantityInput" value="1" min="1" onchange="updateQty(this.value)" style="width:80px;border:none;text-align:center;font-size:16px;font-weight:600;padding:8px;outline:none;">
              <button onclick="increaseQty()" style="background:#f3f4f6;border:none;padding:8px 15px;cursor:pointer;font-size:18px;font-weight:700;color:#333;">+</button>
            </div>
            <select id="qtyType" onchange="updateQtyType(this.value)" style="padding:10px 15px;border:2px solid #d1d5db;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer;outline:none;">
              <option value="pieces">Pieces (PCS)</option>
              <option value="cases">Cases</option>
              <option value="cartons">Cartons</option>
              <option value="pallets">Pallets</option>
              <option value="containers">Containers</option>
              <option value="sets">Sets</option>
              <option value="pairs">Pairs</option>
              <option value="dozens">Dozens</option>
              <option value="kg">Kilograms (KG)</option>
              <option value="tons">Tons</option>
              <option value="liters">Liters</option>
              <option value="meters">Meters</option>
            </select>
          </div>
          <p style="font-size:12px;color:#666;margin-top:8px;">
            <i class="fas fa-info-circle"></i> Min Order: ${p.moq || 'Flexible'} | 
            Selected: <strong id="displayQty">1 Pieces</strong>
          </p>
        </div>
        
        <div style="display:flex;gap:10px;margin:15px 0;flex-wrap:wrap;">
          <button class="btn btn-orange" onclick="contactNow()" style="flex:1;min-width:150px;padding:12px;">
            <i class="fab fa-whatsapp"></i> Inquire Now
          </button>
          <button class="btn btn-red" onclick="orderNow()" style="flex:1;min-width:150px;padding:12px;">
            <i class="fas fa-shopping-cart"></i> Place Order
          </button>
        </div>
        
        <div style="background:#f0f9ff;border:1px solid #bae6fd;padding:12px;border-radius:4px;margin:10px 0;">
          <p style="font-weight:600;color:#0369a1;margin-bottom:4px;"><i class="fas fa-store"></i> ${p.supplier || 'Pure Value Pvt Ltd'}</p>
          <p style="font-size:12px;color:#666;margin:2px 0;"><i class="fas fa-check-circle" style="color:#10b981;"></i> Verified Supplier</p>
          <p style="font-size:12px;color:#666;margin:2px 0;"><i class="fas fa-truck"></i> Shipping: ${p.shipping || 'Worldwide Delivery'}</p>
          <p style="font-size:12px;color:#666;margin:2px 0;"><i class="fas fa-shield-alt"></i> Trade Assurance Protected</p>
        </div>
        
        ${prices.length ? `
        <div style="margin:15px 0;">
          <h4 style="font-size:14px;border-bottom:2px solid #e8e8e8;padding-bottom:5px;margin-bottom:8px;">📊 Bulk Pricing</h4>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead><tr style="background:#f5f5f5;"><th style="padding:8px;text-align:left;border:1px solid #eee;">Quantity</th><th style="padding:8px;text-align:left;border:1px solid #eee;">Unit Price</th></tr></thead>
            <tbody>${prices.map(bp => `<tr><td style="padding:8px;border:1px solid #eee;">${bp.qty}</td><td style="padding:8px;border:1px solid #eee;font-weight:700;color:#E31E24;">${bp.price}</td></tr>`).join('')}</tbody>
          </table>
        </div>` : ''}
        
        ${Object.keys(specs).length ? `
        <div style="margin:15px 0;">
          <h4 style="font-size:14px;border-bottom:2px solid #e8e8e8;padding-bottom:5px;margin-bottom:8px;">📋 Specifications</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;font-size:13px;">
            ${Object.entries(specs).map(([k,v]) => `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f5f5f5;"><span style="color:#999;">${k}</span><span style="font-weight:500;">${v}</span></div>`).join('')}
          </div>
        </div>` : ''}
        
        <div style="margin:15px 0;">
          <h4 style="font-size:14px;border-bottom:2px solid #e8e8e8;padding-bottom:5px;margin-bottom:8px;">📝 Description</h4>
          <p style="font-size:13px;color:#666;line-height:1.6;">${p.desc || 'Premium quality wholesale product. Contact supplier for more details and sample requests.'}</p>
        </div>
      </div>
    </div>`;
}

// Quantity Functions
function increaseQty() {
  selectedQuantity++;
  document.getElementById('quantityInput').value = selectedQuantity;
  updateDisplay();
}

function decreaseQty() {
  if (selectedQuantity > 1) {
    selectedQuantity--;
    document.getElementById('quantityInput').value = selectedQuantity;
    updateDisplay();
  }
}

function updateQty(val) {
  const num = parseInt(val);
  if (num && num > 0) {
    selectedQuantity = num;
  } else {
    selectedQuantity = 1;
    document.getElementById('quantityInput').value = 1;
  }
  updateDisplay();
}

function updateQtyType(type) {
  quantityType = type;
  updateDisplay();
}

function updateDisplay() {
  const display = document.getElementById('displayQty');
  if (display) {
    display.textContent = selectedQuantity + ' ' + quantityType.charAt(0).toUpperCase() + quantityType.slice(1);
  }
}

function imgTag(img) {
  if (!img) return '📦';
  if (String(img).startsWith('http')) return `<img src="${img}" style="width:100%;height:100%;object-fit:contain;" alt="Product" onerror="this.innerHTML='📦'">`;
  return `<span style="font-size:2rem;">${img}</span>`;
}

function changeImg(img, el) {
  const m = document.getElementById('mainImg');
  if (String(img).startsWith('http')) m.innerHTML = `<img src="${img}" style="width:100%;height:100%;object-fit:contain;" alt="Product">`;
  else m.innerHTML = `<span style="font-size:5rem;">${img}</span>`;
  document.querySelectorAll('.detail-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

function contactNow() {
  if (!currentProduct) return;
  const qtyDisplay = selectedQuantity + ' ' + quantityType;
  const phone = '94705374701';
  const msg = `🛒 *Product Inquiry - Pure Value Pvt Ltd*\n\n` +
    `📦 *Product:* ${currentProduct.title}\n` +
    `🆔 *ID:* ${currentProduct._id || pid}\n` +
    `💰 *Price:* ${currentProduct.price}\n` +
    `📦 *MOQ:* ${currentProduct.moq}\n` +
    `🔢 *Order Qty:* ${qtyDisplay}\n` +
    `🚚 *Shipping:* ${currentProduct.shipping || 'To be discussed'}\n\n` +
    `Please send me:\n` +
    `- Final price for ${qtyDisplay}\n` +
    `- Shipping cost & time\n` +
    `- Payment terms\n\n` +
    `Thank you! 🙏`;
  
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

function orderNow() {
  if (!currentProduct) return;
  const qtyDisplay = selectedQuantity + ' ' + quantityType;
  
  database.ref('orders').push({
    productId: currentProduct._id || pid,
    productTitle: currentProduct.title,
    quantity: selectedQuantity,
    quantityType: quantityType,
    quantityDisplay: qtyDisplay,
    price: currentProduct.price,
    status: 'new',
    createdAt: firebase.database.ServerValue.TIMESTAMP
  });
  
  contactNow();
}

function loadRelated(cat, cid) {
  if (!cat) return;
  database.ref('products').orderByChild('category').equalTo(cat).get().then(snap => {
    const data = snap.val();
    const items = data ? Object.entries(data).filter(([k]) => String(k) !== String(cid)).map(([k, v]) => ({...v, _id: k})).slice(0, 4) : [];
    const grid = document.getElementById('relatedProducts');
    if (!grid) return;
    grid.innerHTML = items.length ? items.map(p => `
      <div class="product-card" onclick="location.href='product-detail.html?id=${p._id}'" style="cursor:pointer;">
        <div class="product-img">${(p.img&&String(p.img).startsWith('http'))?`<img src="${p.img}" style="width:100%;height:100%;object-fit:cover;">`:p.img||'📦'}</div>
        <div class="product-info">
          <div class="product-title">${p.title}</div>
          <div class="price-range">${p.price||'Contact'}</div>
          <button class="btn btn-red btn-full" onclick="event.stopPropagation();location.href='product-detail.html?id=${p._id}'">View Details</button>
        </div>
      </div>
    `).join('') : '<p style="grid-column:1/-1;text-align:center;color:#999;padding:20px;">No related products</p>';
  });
}

// Auth
window.openModal = id => document.getElementById(id).classList.add('active');
window.closeModal = id => document.getElementById(id).classList.remove('active');
window.loginWithEmail = () => {
  const e = document.getElementById('loginEmail').value.trim(), p = document.getElementById('loginPassword').value;
  if(!e||!p) return alert('Fill fields');
  auth.signInWithEmailAndPassword(e,p).then(()=>{closeModal('loginModal');if(e==='purevalue185@gmail.com')location.href='admin.html';}).catch(err=>alert(err.message));
};
window.signupWithEmail = () => {
  const n = document.getElementById('signupName').value.trim(), e = document.getElementById('signupEmail').value.trim(), p = document.getElementById('signupPassword').value;
  if(!n||!e||!p) return alert('Fill fields');
  if(p.length<6) return alert('Password 6+ chars');
  auth.createUserWithEmailAndPassword(e,p).then(r=>r.user.updateProfile({displayName:n})).then(()=>{closeModal('signupModal');alert('Welcome!');}).catch(err=>alert(err.message));
};
window.loginWithGoogle = () => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(()=>closeModal('loginModal')).catch(()=>{});
window.signupWithGoogle = () => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(()=>closeModal('signupModal')).catch(()=>{});
window.logout = () => auth.signOut().then(()=>location.reload());
window.changeImg = changeImg;
window.contactNow = contactNow;
window.orderNow = orderNow;
window.increaseQty = increaseQty;
window.decreaseQty = decreaseQty;
window.updateQty = updateQty;
window.updateQtyType = updateQtyType;

// Hamburger
document.getElementById('hamburgerBtn')?.addEventListener('click', ()=>document.querySelector('.category-nav-links')?.classList.toggle('show'));
// Search
document.getElementById('navSearchBtn')?.addEventListener('click', ()=>{const q=document.getElementById('navSearch').value.trim();if(q)location.href='products.html?search='+encodeURIComponent(q);});
// Close modals
document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click', function(e){if(e.target===this)this.classList.remove('active');}));

// Init
document.addEventListener('DOMContentLoaded', loadProduct);
