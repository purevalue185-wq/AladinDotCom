// Firebase Configuration
const firebaseConfig = {

  apiKey: "AIzaSyC-GwdavNZShEDDrs3ZCp0WgtaXjIjnSL4",

  authDomain: "aladindotcom.firebaseapp.com",

  projectId: "aladindotcom",

  storageBucket: "aladindotcom.firebasestorage.app",

  messagingSenderId: "833214079251",

  appId: "1:833214079251:web:c62f0a277b8ae7f4e17ae6",

  measurementId: "G-8PXPKHVQX7",

  databaseURL:
  "https://aladindotcom-default-rtdb.firebaseio.com"

};

// ==========================================
// INITIALIZE FIREBASE
// ==========================================
firebase.initializeApp(firebaseConfig);

const database =
  firebase.database();

const auth =
  firebase.auth();

console.log('Firebase initialized');

// ==========================================
// DEFAULT PRODUCTS
// ==========================================
const defaultProducts = [

  {
    id: 1,

    title:
    "Bluetooth Earbuds Pro",

    category:
    "electronics",

    moq:
    "MOQ 50 Units",

    price:
    "Rs 1,350 - Rs 2,200",

    image:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200",

    images: [

      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200",

      "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1200",

      "https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=1200"

    ],

    desc:
    "Premium wireless earbuds with noise cancellation, Bluetooth 5.0 and long battery backup.",

    specifications: {

      "Bluetooth":
      "5.0",

      "Battery":
      "8 Hours",

      "Charging":
      "USB Type-C",

      "Water Resistance":
      "IPX5",

      "Warranty":
      "1 Year"

    },

    shipping:
    "7-12 Days Shipping",

    bulkPrices: [

      {
        qty: "50-100 Units",
        price: "Rs 2,200/unit"
      },

      {
        qty: "101-500 Units",
        price: "Rs 1,850/unit"
      },

      {
        qty: "500+ Units",
        price: "Rs 1,350/unit"
      }

    ],

    supplier:
    "Shenzhen Audio Electronics Co.",

    rating: 4.8,

    reviews: 156,

    createdAt:
    firebase.database.ServerValue.TIMESTAMP

  },

  {
    id: 2,

    title:
    "Stainless Steel Cookware Set",

    category:
    "kitchen",

    moq:
    "MOQ 20 Sets",

    price:
    "Rs 6,500 - Rs 8,900",

    image:
    "https://images.unsplash.com/photo-1584990347449-a9f4357f3b5e?q=80&w=1200",

    images: [

      "https://images.unsplash.com/photo-1584990347449-a9f4357f3b5e?q=80&w=1200",

      "https://images.unsplash.com/photo-1514996937319-344454492b37?q=80&w=1200",

      "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=1200"

    ],

    desc:
    "Premium stainless steel cookware set for modern kitchens.",

    specifications: {

      "Material":
      "Stainless Steel 304",

      "Pieces":
      "5 Pieces",

      "Dishwasher Safe":
      "Yes",

      "Warranty":
      "2 Years"

    },

    shipping:
    "10-15 Days Shipping",

    bulkPrices: [

      {
        qty: "20-50 Sets",
        price: "Rs 8,900/set"
      },

      {
        qty: "51-200 Sets",
        price: "Rs 7,400/set"
      },

      {
        qty: "200+ Sets",
        price: "Rs 6,500/set"
      }

    ],

    supplier:
    "Guangzhou Kitchenware Ltd.",

    rating: 4.7,

    reviews: 98,

    createdAt:
    firebase.database.ServerValue.TIMESTAMP

  },

  {
    id: 3,

    title:
    "Organic Vitamin C Face Serum",

    category:
    "beauty",

    moq:
    "MOQ 100 Units",

    price:
    "Rs 750 - Rs 1,350",

    image:
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200",

    images: [

      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200",

      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200",

      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1200"

    ],

    desc:
    "Vitamin C serum with natural ingredients and skin hydration technology.",

    specifications: {

      "Size":
      "30ml",

      "Skin Type":
      "All Skin Types",

      "Paraben Free":
      "Yes",

      "Shelf Life":
      "24 Months"

    },

    shipping:
    "8-14 Days Shipping",

    bulkPrices: [

      {
        qty: "100-500 Units",
        price: "Rs 1,350/unit"
      },

      {
        qty: "501-1000 Units",
        price: "Rs 1,050/unit"
      },

      {
        qty: "1000+ Units",
        price: "Rs 750/unit"
      }

    ],

    supplier:
    "Seoul Beauty Co.",

    rating: 4.9,

    reviews: 234,

    createdAt:
    firebase.database.ServerValue.TIMESTAMP

  },

  {
    id: 4,

    title:
    "Foldable Storage Organizer Box",

    category:
    "household",

    moq:
    "MOQ 30 Units",

    price:
    "Rs 1,950 - Rs 3,200",

    image:
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200",

    images: [

      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200",

      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?q=80&w=1200",

      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200"

    ],

    desc:
    "Foldable storage organizers with premium fabric and reinforced handles.",

    specifications: {

      "Material":
      "Non-woven Fabric",

      "Sizes":
      "S, M, L",

      "Foldable":
      "Yes",

      "Weight Capacity":
      "15kg"

    },

    shipping:
    "9-13 Days Shipping",

    bulkPrices: [

      {
        qty: "30-100 Units",
        price: "Rs 3,200/unit"
      },

      {
        qty: "101-300 Units",
        price: "Rs 2,600/unit"
      },

      {
        qty: "300+ Units",
        price: "Rs 1,950/unit"
      }

    ],

    supplier:
    "Yiwu Home Products",

    rating: 4.5,

    reviews: 67,

    createdAt:
    firebase.database.ServerValue.TIMESTAMP

  }

];

// ==========================================
// INITIALIZE DATABASE
// ==========================================
function initializeDatabase() {

  const productsRef =
    database.ref('products');

  productsRef

    .once('value')

    .then(snapshot => {

      if (!snapshot.exists()) {

        console.log(
          'Initializing products...'
        );

        const updates = {};

        defaultProducts.forEach(product => {

          updates[product.id] = product;

        });

        return productsRef.set(updates);

      }

    })

    .then(() => {

      console.log(
        'Database Ready'
      );

    })

    .catch(error => {

      console.error(
        'Database Error:',
        error
      );

    });

}

// ==========================================
// HELPERS
// ==========================================
function getProductsRef() {

  return database.ref('products');

}

function getOrdersRef() {

  return database.ref('orders');

}

function getInquiriesRef() {

  return database.ref('inquiries');

}

// ==========================================
// RUN
// ==========================================
initializeDatabase();
