// ==========================================
// PRODUCT DETAIL PAGE - FINAL
// ==========================================

let currentProduct = null;
const urlParams = new URLSearchParams(window.location.search);
const pid = urlParams.get('id');

console.log('Page loaded. Looking for product ID:', pid);

// Auth UI
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

// Load product
function loadProduct() {
  if (!pid) {
    document.getElementById('productDetailContent').innerHTML = `
      <div style="text-align:center;padding:50px;background:white;border:1px solid #e8e8e8;border-radius:4px;">
        <h2>No Product Selected</h2>
        <a href="products.html" class="btn btn-red" style="margin-top:15px;">Browse Products</a>
      </div>`;
    return;
  }

  // Get product directly by key
  database.ref('products/' + pid).get().then(snap => {
    if (snap.exists()) {
      const p = snap.val();
      p._id = pid;
      showProduct(p);
      loadRelated(p.category, pid);
      return;
    }
    // Search all products
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
      <i class="fas fa-box-open" style="font-size:50px;color:#ccc;"></i>
      <h2 style="margin:15px 0;">Product Not Found</h2>
      <a href="products.html" class="btn btn-red">Browse Products</a>
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
      </div>
      <div>
        <h1 style="font-size:20px;font-weight:600;">${p.title || ''}</h1>
        <div style="background:#fef2f2;padding:12px;border-radius:4px;margin:10px 0;">
          <span style="font-size:24px;font-weight:700;color:#E31E24;">${p.price || 'Contact'}</span>
          <span style="font-size:13px;color:#666;margin-left:10px;">/ ${p.moq || 'Flexible MOQ'}</span>
        </div>
        <div style="font-size:13px;color:#666;margin:8px 0;">★ ${p.rating||'4.5'} | ${p.reviews||0} reviews</div>
        <div style="display:flex;gap:10px;margin:15px 0;">
          <button class="btn btn-orange" onclick="contactNow()" style="flex:1;padding:12px;"><i class="fab fa-whatsapp"></i> Contact Supplier</button>
          <button class="btn btn-red" onclick="orderNow()" style="flex:1;padding:12px;"><i class="fas fa-shopping-cart"></i> Start Order</button>
        </div>
        <div style="background:#f0f9ff;border:1px solid #bae6fd;padding:12px;border-radius:4px;margin:10px 0;">
          <p style="font-weight:600;color:#0369a1;"><i class="fas fa-store"></i> ${p.supplier || 'Verified Supplier'}</p>
          <p style="font-size:12px;color:#666;"><i class="fas fa-truck"></i> Shipping: ${p.shipping || 'Worldwide'}</p>
        </div>
        ${prices.length ? `
        <div style="margin:15px 0;"><h4 style="border-bottom:2px solid #e8e8e8;padding-bottom:5px;">Bulk Pricing</h4>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead><tr style="background:#f5f5f5;"><th style="padding:8px;border:1px solid #eee;">Quantity</th><th style="padding:8px;border:1px solid #eee;">Price</th></tr></thead>
            <tbody>${prices.map(bp => `<tr><td style="padding:8px;border:1px solid #eee;">${bp.qty}</td><td style="padding:8px;border:1px solid #eee;font-weight:700;color:#E31E24;">${bp.price}</td></tr>`).join('')}</tbody>
          </table></div>` : ''}
        ${Object.keys(specs).length ? `
        <div style="margin:15px 0;"><h4 style="border-bottom:2px solid #e8e8e8;padding-bottom:5px;">Specifications</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;font-size:13px;">
            ${Object.entries(specs).map(([k,v]) => `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f5f5f5;"><span style="color:#999;">${k}</span><span style="font-weight:500;">${v}</span></div>`).join('')}
          </div></div>` : ''}
        <div style="margin:15px 0;"><h4 style="border-bottom:2px solid #e8e8e8;padding-bottom:5px;">Description</h4><p style="font-size:13px;color:#666;line-height:1.6;">${p.desc || 'No description.'}</p></div>
      </div>
    </div>`;
}

function imgTag(img) {
  if (!img) return '📦';
  if (String(img).startsWith('http')) return `<img src="${img}" style="width:100%;height:100%;object-fit:contain;" onerror="this.innerHTML='📦'">`;
  return `<span style="font-size:2rem;">${img}</span>`;
}

function changeImg(img, el) {
  const m = document.getElementById('mainImg');
  if (String(img).startsWith('http')) m.innerHTML = `<img src="${img}" style="width:100%;height:100%;object-fit:contain;">`;
  else m.innerHTML = `<span style="font-size:5rem;">${img}</span>`;
  document.querySelectorAll('.detail-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

function contactNow() {
  if (!currentProduct) return;
  window.open(`https://wa.me/15551234567?text=${encodeURIComponent('Hi, interested in: ' + currentProduct.title + ' - Price: ' + currentProduct.price)}`, '_blank');
}

function orderNow() {
  if (!currentProduct) return;
  database.ref('orders').push({ productId: currentProduct._id || pid, productTitle: currentProduct.title, status: 'new', createdAt: firebase.database.ServerValue.TIMESTAMP });
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
        <div class="product-img">${(p.img&&String(p.img).startsWith('http')) ? `<img src="${p.img}" style="width:100%;height:100%;object-fit:cover;">` : (p.img||'📦')}</div>
        <div class="product-info"><div class="product-title">${p.title}</div><div class="price-range">${p.price||'Contact'}</div><button class="btn btn-red btn-full" onclick="event.stopPropagation();location.href='product-detail.html?id=${p._id}'">View</button></div>
      </div>`).join('') : '<p style="grid-column:1/-1;text-align:center;color:#999;padding:20px;">No related products</p>';
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

document.getElementById('hamburgerBtn')?.addEventListener('click', ()=>document.querySelector('.category-nav-links')?.classList.toggle('show'));
document.getElementById('navSearchBtn')?.addEventListener('click', ()=>{const q=document.getElementById('navSearch').value.trim();if(q)location.href='products.html?search='+encodeURIComponent(q);});
document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click', function(e){if(e.target===this)this.classList.remove('active');}));

document.addEventListener('DOMContentLoaded', loadProduct);
