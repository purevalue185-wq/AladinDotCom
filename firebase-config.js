// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-GwdavNZShEDDrs3ZCp0WgtaXjIjnSL4",
  authDomain: "aladindotcom.firebaseapp.com",
  projectId: "aladindotcom",
  storageBucket: "aladindotcom.firebasestorage.app",
  messagingSenderId: "833214079251",
  appId: "1:833214079251:web:c62f0a277b8ae7f4e17ae6",
  measurementId: "G-8PXPKHVQX7",
  databaseURL: "https://aladindotcom-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

console.log('Firebase initialized successfully');

// Default products for initial setup
const defaultProducts = [
  {
    id: 1, title: "Bluetooth Earbuds Pro", category: "electronics", moq: "MOQ 50 units",
    price: "$4.20 - $6.80", img: "🎧", images: ["🎧", "🔊", "📱"],
    desc: "High-quality wireless earbuds with noise cancellation. Bluetooth 5.0, touch controls.",
    specifications: {"Brand": "AudioTech Pro", "Battery Life": "8 hours", "Warranty": "1 year"},
    shipping: "7-12 days",
    bulkPrices: [{"qty": "50-100", "price": "$6.80"}, {"qty": "101-500", "price": "$5.50"}, {"qty": "500+", "price": "$4.20"}],
    supplier: "Shenzhen Audio Electronics", rating: 4.8, reviews: 156
  },
  {
    id: 2, title: "Stainless Steel Cookware Set", category: "kitchen", moq: "MOQ 20 sets",
    price: "$18.50 - $24.00", img: "🍳", images: ["🍳", "🥘", "🔪"],
    desc: "Premium 5-piece kitchen set. Durable stainless steel with non-stick coating.",
    specifications: {"Material": "Stainless Steel 304", "Pieces": "5", "Dishwasher Safe": "Yes"},
    shipping: "10-15 days",
    bulkPrices: [{"qty": "20-50", "price": "$24.00"}, {"qty": "51-200", "price": "$21.00"}, {"qty": "200+", "price": "$18.50"}],
    supplier: "Guangzhou Kitchenware", rating: 4.6, reviews: 98
  },
  {
    id: 3, title: "Organic Face Serum", category: "beauty", moq: "MOQ 100 units",
    price: "$2.30 - $3.90", img: "✨", images: ["✨", "💆", "🌿"],
    desc: "Vitamin C serum with natural ingredients. Dermatologist tested.",
    specifications: {"Size": "30ml", "Key Ingredients": "Vitamin C, Hyaluronic Acid", "Paraben Free": "Yes"},
    shipping: "8-14 days",
    bulkPrices: [{"qty": "100-500", "price": "$3.90"}, {"qty": "501-1000", "price": "$3.00"}, {"qty": "1000+", "price": "$2.30"}],
    supplier: "Seoul Beauty Co.", rating: 4.9, reviews: 234
  },
  {
    id: 4, title: "Foldable Storage Bins", category: "household", moq: "MOQ 30 units",
    price: "$5.80 - $8.20", img: "📦", images: ["📦", "🗃️", "🏠"],
    desc: "Space-saving fabric storage bins with handles. Multiple colors available.",
    specifications: {"Material": "Non-woven fabric", "Sizes": "S, M, L", "Foldable": "Yes"},
    shipping: "9-13 days",
    bulkPrices: [{"qty": "30-100", "price": "$8.20"}, {"qty": "101-300", "price": "$7.00"}, {"qty": "300+", "price": "$5.80"}],
    supplier: "Yiwu Home Products", rating: 4.5, reviews: 67
  }
];

// Initialize database with default products
function initializeDatabase() {
  database.ref('products').once('value').then((snapshot) => {
    if (!snapshot.exists()) {
      console.log('Initializing database with default products...');
      const updates = {};
      defaultProducts.forEach(product => {
        product.createdAt = firebase.database.ServerValue.TIMESTAMP;
        updates[product.id] = product;
      });
      return database.ref('products').set(updates);
    }
  }).then(() => {
    console.log('Database ready');
  }).catch((error) => {
    console.error('Database init error:', error);
  });
}

initializeDatabase();