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

// Default products for initial setup
const defaultProducts = [
  {
    id: 1,
    title: "Bluetooth Earbuds Pro",
    category: "electronics",
    moq: "MOQ 50 units",
    price: "$4.20 - $6.80",
    img: "🎧",
    images: ["🎧", "🔊", "📱"],
    desc: "High-quality wireless earbuds with noise cancellation technology. Features Bluetooth 5.0, touch controls, and long battery life. Perfect for bulk import and resale.",
    specifications: {
      "Brand": "AudioTech Pro",
      "Model": "AT-BE500",
      "Battery Life": "8 hours",
      "Charging Case": "Included",
      "Color Options": "Black, White, Blue",
      "Warranty": "1 year"
    },
    shipping: "7-12 days",
    bulkPrices: [
      { qty: "50-100", price: "$6.80/unit" },
      { qty: "101-500", price: "$5.50/unit" },
      { qty: "501-1000", price: "$4.80/unit" },
      { qty: "1000+", price: "$4.20/unit" }
    ],
    supplier: "Shenzhen Audio Electronics Co.",
    rating: 4.8,
    reviews: 156,
    createdAt: firebase.database.ServerValue.TIMESTAMP
  },
  {
    id: 2,
    title: "Stainless Steel Cookware Set",
    category: "kitchen",
    moq: "MOQ 20 sets",
    price: "$18.50 - $24.00",
    img: "🍳",
    images: ["🍳", "🥘", "🔪"],
    desc: "Premium 5-piece kitchen cookware set. Made from durable stainless steel with non-stick coating.",
    specifications: {
      "Material": "Stainless Steel 304",
      "Pieces": "5 pieces",
      "Dishwasher Safe": "Yes",
      "Oven Safe": "Up to 500°F",
      "Warranty": "2 years"
    },
    shipping: "10-15 days",
    bulkPrices: [
      { qty: "20-50", price: "$24.00/set" },
      { qty: "51-200", price: "$21.00/set" },
      { qty: "201-500", price: "$19.50/set" },
      { qty: "500+", price: "$18.50/set" }
    ],
    supplier: "Guangzhou Kitchenware Ltd.",
    rating: 4.6,
    reviews: 98,
    createdAt: firebase.database.ServerValue.TIMESTAMP
  },
  {
    id: 3,
    title: "Organic Face Serum",
    category: "beauty",
    moq: "MOQ 100 units",
    price: "$2.30 - $3.90",
    img: "✨",
    images: ["✨", "💆", "🌿"],
    desc: "Vitamin C face serum with natural ingredients. Dermatologist tested, paraben-free.",
    specifications: {
      "Size": "30ml",
      "Key Ingredients": "Vitamin C, Hyaluronic Acid",
      "Skin Type": "All skin types",
      "Paraben Free": "Yes",
      "Shelf Life": "24 months"
    },
    shipping: "8-14 days",
    bulkPrices: [
      { qty: "100-500", price: "$3.90/unit" },
      { qty: "501-1000", price: "$3.00/unit" },
      { qty: "1001-5000", price: "$2.60/unit" },
      { qty: "5000+", price: "$2.30/unit" }
    ],
    supplier: "Seoul Beauty Co.",
    rating: 4.9,
    reviews: 234,
    createdAt: firebase.database.ServerValue.TIMESTAMP
  },
  {
    id: 4,
    title: "Foldable Storage Bins",
    category: "household",
    moq: "MOQ 30 units",
    price: "$5.80 - $8.20",
    img: "📦",
    images: ["📦", "🗃️", "🏠"],
    desc: "Space-saving fabric storage bins with handles. Available in multiple colors and sizes.",
    specifications: {
      "Material": "Non-woven fabric",
      "Sizes": "S, M, L",
      "Colors": "Gray, Beige, Blue",
      "Foldable": "Yes",
      "Weight Capacity": "15 kg"
    },
    shipping: "9-13 days",
    bulkPrices: [
      { qty: "30-100", price: "$8.20/unit" },
      { qty: "101-300", price: "$7.00/unit" },
      { qty: "301-1000", price: "$6.30/unit" },
      { qty: "1000+", price: "$5.80/unit" }
    ],
    supplier: "Yiwu Home Products",
    rating: 4.5,
    reviews: 67,
    createdAt: firebase.database.ServerValue.TIMESTAMP
  },
  {
    id: 5,
    title: "Smart Watch Fitness Tracker",
    category: "electronics",
    moq: "MOQ 25 units",
    price: "$12.00 - $18.50",
    img: "⌚",
    images: ["⌚", "❤️", "📊"],
    desc: "Waterproof smart watch with heart rate monitor, GPS tracking, and sleep analysis.",
    specifications: {
      "Display": "1.4 inch OLED",
      "Battery": "7 days",
      "Waterproof": "IP68",
      "Sensors": "Heart rate, SpO2",
      "Compatibility": "iOS & Android"
    },
    shipping: "7-10 days",
    bulkPrices: [
      { qty: "25-100", price: "$18.50/unit" },
      { qty: "101-500", price: "$15.00/unit" },
      { qty: "501-2000", price: "$13.50/unit" },
      { qty: "2000+", price: "$12.00/unit" }
    ],
    supplier: "Shenzhen Tech Innovations",
    rating: 4.7,
    reviews: 189,
    createdAt: firebase.database.ServerValue.TIMESTAMP
  },
  {
    id: 6,
    title: "Eco-Friendly Packaging Set",
    category: "packaging",
    moq: "MOQ 100 units",
    price: "$0.80 - $1.50",
    img: "📦",
    images: ["📦", "🌱", "♻️"],
    desc: "Biodegradable packaging solutions for e-commerce businesses.",
    specifications: {
      "Material": "Recycled cardboard",
      "Sizes": "Multiple sizes available",
      "Biodegradable": "Yes",
      "Custom Printing": "Available",
      "MOQ Custom": "500 units"
    },
    shipping: "10-15 days",
    bulkPrices: [
      { qty: "100-500", price: "$1.50/unit" },
      { qty: "501-2000", price: "$1.10/unit" },
      { qty: "2001-5000", price: "$0.95/unit" },
      { qty: "5000+", price: "$0.80/unit" }
    ],
    supplier: "EcoPackage Solutions",
    rating: 4.8,
    reviews: 112,
    createdAt: firebase.database.ServerValue.TIMESTAMP
  }
];

// Initialize database with default products if empty
function initializeDatabase() {
  const productsRef = database.ref('products');
  productsRef.once('value').then((snapshot) => {
    if (!snapshot.exists()) {
      console.log('Initializing database with default products...');
      const updates = {};
      defaultProducts.forEach(product => {
        updates[product.id] = product;
      });
      return productsRef.set(updates);
    }
  }).then(() => {
    console.log('Database initialized successfully');
  }).catch((error) => {
    console.error('Database initialization error:', error);
  });
}

// Helper functions for products
function getProductsRef() {
  return database.ref('products');
}

function getInquiriesRef() {
  return database.ref('inquiries');
}

// Run initialization
initializeDatabase();