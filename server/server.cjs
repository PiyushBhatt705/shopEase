const dns = require('dns');
try {
  // Use public high-performance DNS resolvers to bypass local ISP blocks
  dns.setServers(['1.1.1.1', '8.8.8.8']); 
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  console.warn('[DNS Config] Could not set custom DNS resolvers:', e.message);
}

const fs = require('fs');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://shopease-piyush-one.vercel.app',
  'https://shopease-aaqd.onrender.com'
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any vercel.app subdomain (preview deployments)
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    return callback(new Error('CORS: origin not allowed'));
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Local File Database Fallback Config
const dbPath = path.join(__dirname, 'db.json');
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ users: [], stores: [], products: [], orders: [], notifications: [] }, null, 2));
}

const readLocalDb = () => {
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    if (!db.notifications) db.notifications = [];
    return db;
  } catch (e) {
    return { users: [], stores: [], products: [], orders: [], notifications: [] };
  }
};

const writeLocalDb = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('[Local DB] Write error:', e);
  }
};

// Check if MongoDB is successfully connected
let isMongoConnected = false;

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000 // 5 seconds timeout before falling back
})
.then(() => {
  isMongoConnected = true;
  console.log('🚀 MongoDB Atlas Cloud Database connected successfully!');
  syncLocalDbToMongo();
})
.catch(err => {
  isMongoConnected = false;
  console.warn('⚠️ MongoDB connection failed. Falling back to robust local file-based database (db.json)...');
  console.warn(`Reason: ${err.message}`);
});

// Watch connection changes
mongoose.connection.on('disconnected', () => {
  isMongoConnected = false;
  console.warn('⚠️ MongoDB disconnected. Falling back to local file storage.');
});
mongoose.connection.on('connected', () => {
  isMongoConnected = true;
  console.log('🚀 MongoDB reconnected successfully.');
  syncLocalDbToMongo();
});

// ---------------- DATABASE SCHEMAS (MONGODB) ----------------

const UserSchema = new mongoose.Schema({
  id: { type: String }, // To store local usr_ ID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  walletBalance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// Helper to look up a User by either MongoDB ObjectId, local id, or email
const findUserById = async (id) => {
  if (!id) return null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    const user = await User.findById(id).catch(() => null);
    if (user) return user;
  }
  const user = await User.findOne({ $or: [{ id: id }, { email: id }] }).catch(() => null);
  return user;
};

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Notification = mongoose.model('Notification', NotificationSchema);

const StoreSchema = new mongoose.Schema({
  ownerId: { type: String, required: true },
  businessName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  category: { type: String, required: true },
  gstin: { type: String, required: true },
  payoutId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Store = mongoose.model('Store', StoreSchema);

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  description: { type: String, required: true },
  category: { type: String, required: true },
  images: { type: [String], default: [] },
  stock: { type: Number, default: 10 },
  sellerId: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', ProductSchema);

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  shippingDetails: { type: Object, required: true },
  amount: { type: Number, required: true },
  discount: { type: Number, required: true },
  status: { type: String, default: 'placed' },
  timestamp: { type: Number, required: true },
  deliveryDate: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', OrderSchema);

// ---------------- AUTOMATIC OFFLINE DATA SYNC TO MONGODB ----------------
const syncLocalDbToMongo = async () => {
  console.log('🔄 [Sync] Starting offline local DB synchronization with MongoDB Atlas...');
  try {
    const db = readLocalDb();
    
    // 1. Sync Users
    if (Array.isArray(db.users) && db.users.length > 0) {
      console.log(`[Sync] Syncing ${db.users.length} users...`);
      for (const u of db.users) {
        const email = u.email;
        if (!email) continue;
        const exists = await User.findOne({ email });
        if (!exists) {
          const newU = new User({
            id: u.id || u._id,
            name: u.name,
            email: u.email,
            password: u.password,
            walletBalance: u.walletBalance || 0,
            createdAt: u.createdAt || new Date()
          });
          await newU.save();
          console.log(`[Sync] Migrated user: ${u.email}`);
        }
      }
    }

    // 2. Sync Stores
    if (Array.isArray(db.stores) && db.stores.length > 0) {
      console.log(`[Sync] Syncing ${db.stores.length} stores...`);
      for (const s of db.stores) {
        const ownerId = s.ownerId || s.owner_id;
        if (!ownerId) continue;
        const exists = await Store.findOne({ ownerId });
        if (!exists) {
          const newS = new Store({
            ownerId,
            businessName: s.businessName || s.business_name,
            email: s.email,
            phone: s.phone,
            category: s.category,
            gstin: s.gstin || 'GST-UNREGISTERED',
            payoutId: s.payoutId || s.payout_id || 'PAY_' + Math.floor(1000000 + Math.random() * 9000000),
            createdAt: s.createdAt || new Date()
          });
          await newS.save();
          console.log(`[Sync] Migrated store: ${newS.businessName}`);
        }
      }
    }

    // 3. Sync Products
    if (Array.isArray(db.products) && db.products.length > 0) {
      console.log(`[Sync] Syncing ${db.products.length} products...`);
      for (const p of db.products) {
        if (!p.id) continue;
        const exists = await Product.findOne({ id: p.id });
        if (!exists) {
          const newP = new Product({
            id: p.id,
            title: p.title,
            price: p.price,
            originalPrice: p.originalPrice || p.price,
            description: p.description,
            category: p.category,
            images: p.images || [],
            stock: p.stock || 10,
            sellerId: p.sellerId || p.seller_id || '',
            createdAt: p.createdAt || new Date()
          });
          await newP.save();
          console.log(`[Sync] Migrated product: ${p.title}`);
        }
      }
    }

    // 4. Sync Orders
    if (Array.isArray(db.orders) && db.orders.length > 0) {
      console.log(`[Sync] Syncing ${db.orders.length} orders...`);
      for (const o of db.orders) {
        if (!o.orderId) continue;
        const exists = await Order.findOne({ orderId: o.orderId });
        if (!exists) {
          const newO = new Order({
            orderId: o.orderId,
            userId: o.userId || o.user_id,
            items: o.items,
            shippingDetails: o.shippingDetails || o.shipping_details,
            amount: o.amount,
            discount: o.discount || 0,
            status: o.status,
            timestamp: o.timestamp || Date.now(),
            deliveryDate: o.deliveryDate || '',
            createdAt: o.createdAt || new Date()
          });
          await newO.save();
          console.log(`[Sync] Migrated order: ${o.orderId}`);
        }
      }
    }

    // 5. Sync Notifications
    if (Array.isArray(db.notifications) && db.notifications.length > 0) {
      console.log(`[Sync] Syncing ${db.notifications.length} notifications...`);
      for (const n of db.notifications) {
        if (!n.userId || !n.message) continue;
        const exists = await Notification.findOne({ userId: n.userId, message: n.message });
        if (!exists) {
          const newN = new Notification({
            userId: n.userId,
            message: n.message,
            isRead: n.isRead || false,
            createdAt: n.createdAt || new Date()
          });
          await newN.save();
          console.log(`[Sync] Migrated notification for user: ${n.userId}`);
        }
      }
    }

    console.log('✅ [Sync] Offline DB synchronization completed successfully!');
  } catch (err) {
    console.error('❌ [Sync] Sync process failed:', err.message);
  }
};

// ---------------- API ROUTE CONTROLLERS ----------------

// 1. AUTH REGISTER
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (isMongoConnected) {
    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already exists' });

      const newUser = new User({ name, email, password, walletBalance: 0.00 });
      await newUser.save();
      return res.status(201).json({ id: newUser._id.toString(), name: newUser.name, email: newUser.email, walletBalance: newUser.walletBalance || 0 });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    // Fail-safe Local JSON Mode
    const db = readLocalDb();
    if (db.users.some(u => u.email === email)) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const newUser = { id: 'usr_' + Date.now(), name, email, password, walletBalance: 0.00 };
    db.users.push(newUser);
    writeLocalDb(db);
    return res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email, walletBalance: newUser.walletBalance });
  }
});

// 2. AUTH LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (isMongoConnected) {
    try {
      const user = await User.findOne({ email, password });
      if (!user) return res.status(400).json({ message: 'Invalid email or password' });
      return res.json({ id: user._id.toString(), name: user.name, email: user.email, walletBalance: user.walletBalance || 0 });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    // Fail-safe Local JSON Mode
    const db = readLocalDb();
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });
    return res.json({ id: user.id, name: user.name, email: user.email, walletBalance: user.walletBalance || 0 });
  }
});

// 3. PRODUCTS LIST
app.get('/api/products', async (req, res) => {
  let customItems = [];
  
  if (isMongoConnected) {
    try {
      customItems = await Product.find({});
    } catch (err) {
      console.error('[MongoDB] Fetch products failed, using local backup:', err.message);
      customItems = readLocalDb().products;
    }
  } else {
    customItems = readLocalDb().products;
  }

  let baseProducts = [];
  try {
    const response = await fetch("https://dummyjson.com/products?limit=100");
    const data = await response.json();
    baseProducts = (data.products || []).map(p => ({
      ...p,
      id: `dj_${p.id}`
    }));
  } catch (err) {
    console.error("Base products fetch failed:", err.message);
  }

  res.json([...customItems, ...baseProducts]);
});

// 4. GET SINGLE PRODUCT
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  
  if (id.startsWith("dj_")) {
    try {
      const realId = id.replace("dj_", "");
      const response = await fetch(`https://dummyjson.com/products/${realId}`);
      if (!response.ok) return res.status(404).json({ message: 'Product not found' });
      const data = await response.json();
      return res.json({
        ...data,
        id: `dj_${data.id}`
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (id.startsWith("fs_")) {
    try {
      const realId = id.replace("fs_", "");
      const response = await fetch(`https://fakestoreapi.com/products/${realId}`);
      if (!response.ok) return res.status(404).json({ message: 'Product not found' });
      const data = await response.json();
      return res.json({
        ...data,
        id: `fs_${data.id}`,
        images: [data.image]
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (isMongoConnected) {
    try {
      const match = await Product.findOne({ id });
      if (match) return res.json(match);
    } catch (err) {
      console.warn('[MongoDB] Get details failed, looking in local db:', err.message);
    }
  }
  
  const db = readLocalDb();
  const match = db.products.find(p => p.id === id);
  if (!match) return res.status(404).json({ message: 'Product not found' });
  res.json(match);
});

// 5. CREATE PRODUCT (LIST NEW LIVE)
app.post('/api/products', async (req, res) => {
  const productData = req.body;
  
  if (isMongoConnected) {
    try {
      const newProduct = new Product(productData);
      await newProduct.save();
      return res.status(201).json(newProduct);
    } catch (err) {
      console.warn('[MongoDB] Product create failed, saving locally:', err.message);
    }
  }
  
  const db = readLocalDb();
  db.products.push(productData);
  writeLocalDb(db);
  res.status(201).json(productData);
});

// 6. REGISTER SELLER STORE
app.post('/api/seller/register', async (req, res) => {
  const storeData = req.body;
  
  if (isMongoConnected) {
    try {
      const newStore = new Store(storeData);
      await newStore.save();
      return res.status(201).json(newStore);
    } catch (err) {
      console.warn('[MongoDB] Store registration failed, saving locally:', err.message);
    }
  }
  
  const db = readLocalDb();
  db.stores.push(storeData);
  writeLocalDb(db);
  res.status(201).json(storeData);
});

// 7. GET SELLER STORE
app.get('/api/seller/store/:ownerId', async (req, res) => {
  const { ownerId } = req.params;
  
  if (isMongoConnected) {
    try {
      const store = await Store.findOne({ ownerId });
      if (store) return res.json(store);
    } catch (err) {
      console.warn('[MongoDB] Get store failed, looking in local db:', err.message);
    }
  }
  
  const db = readLocalDb();
  const store = db.stores.find(s => s.ownerId === ownerId || s.owner_id === ownerId);
  if (!store) return res.status(404).json({ message: 'Store not found' });
  res.json(store);
});

// 8. GET SELLER INVENTORY
app.get('/api/seller/inventory/:ownerId', async (req, res) => {
  const { ownerId } = req.params;
  
  if (isMongoConnected) {
    try {
      const list = await Product.find({ sellerId: ownerId });
      return res.json(list);
    } catch (err) {
      console.warn('[MongoDB] Get inventory failed, loading from local db:', err.message);
    }
  }
  
  const db = readLocalDb();
  const list = db.products.filter(p => p.sellerId === ownerId);
  res.json(list);
});

// 9. DELETE SELLER PRODUCT
app.delete('/api/products/:productId', async (req, res) => {
  const { productId } = req.params;
  
  if (isMongoConnected) {
    try {
      await Product.findOneAndDelete({ id: productId });
      return res.json({ success: true });
    } catch (err) {
      console.warn('[MongoDB] Delete product failed, unlisting locally:', err.message);
    }
  }
  
  const db = readLocalDb();
  db.products = db.products.filter(p => p.id !== productId);
  writeLocalDb(db);
  res.json({ success: true });
});

// 9a. UPDATE SELLER PRODUCT DETAILS
app.put('/api/products/:productId', async (req, res) => {
  const { productId } = req.params;
  const updateData = req.body;
  
  let updatedProduct = null;
  if (isMongoConnected) {
    try {
      updatedProduct = await Product.findOneAndUpdate({ id: productId }, { $set: updateData }, { new: true });
    } catch (err) {
      console.error('[MongoDB] Update product failed:', err.message);
    }
  }
  
  if (!updatedProduct) {
    const db = readLocalDb();
    const idx = db.products.findIndex(p => p.id === productId);
    if (idx !== -1) {
      db.products[idx] = { ...db.products[idx], ...updateData };
      writeLocalDb(db);
      updatedProduct = db.products[idx];
    }
  }
  
  if (updatedProduct) {
    return res.json(updatedProduct);
  }
  res.status(404).json({ message: 'Product not found' });
});

// 9b. GET SELLER ORDERS
app.get('/api/seller/orders/:sellerId', async (req, res) => {
  const { sellerId } = req.params;
  if (isMongoConnected) {
    try {
      // Find orders containing items with matching sellerId
      const list = await Order.find({
        $or: [
          { "items.seller_id": sellerId },
          { "items.sellerId": sellerId }
        ]
      });
      return res.json(list);
    } catch (err) {
      console.warn('[MongoDB] Get seller orders failed, loading locally:', err.message);
    }
  }
  const db = readLocalDb();
  const list = (db.orders || []).filter(o => 
    o.items && o.items.some(item => (item.seller_id === sellerId || item.sellerId === sellerId))
  );
  res.json(list);
});

// 9c. UPDATE ORDER SHIPPING STATUS
app.patch('/api/orders/:orderId/status', async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  
  let updatedOrder = null;
  if (isMongoConnected) {
    try {
      const order = await Order.findOne({ orderId });
      if (order) {
        order.status = status;
        if (status === 'delivered') {
          order.deliveryDate = new Date().toLocaleDateString() + " at " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        await order.save();
        updatedOrder = order;
      }
    } catch (err) {
      console.error('[MongoDB] Update order status failed:', err.message);
    }
  }
  
  if (!updatedOrder) {
    const db = readLocalDb();
    const idx = db.orders.findIndex(o => o.orderId === orderId);
    if (idx !== -1) {
      db.orders[idx].status = status;
      if (status === 'delivered') {
        db.orders[idx].deliveryDate = new Date().toLocaleDateString() + " at " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      writeLocalDb(db);
      updatedOrder = db.orders[idx];
    }
  }
  
  if (updatedOrder) {
    return res.json(updatedOrder);
  }
  res.status(404).json({ message: 'Order not found' });
});

app.post('/api/orders', async (req, res) => {
  const orderData = req.body;
  // Normalize payload keys for schema validation
  if (orderData.shipping_details && !orderData.shippingDetails) {
    orderData.shippingDetails = orderData.shipping_details;
  }
  if (orderData.user_id && !orderData.userId) {
    orderData.userId = orderData.user_id;
  }
  const { userId, items, useWallet, amount } = orderData;
  
  if (isMongoConnected) {
    try {
      // 1. Handle Wallet Deduction for Buyer
      if (useWallet) {
        let user = await findUserById(userId);
        if (user) {
           const deductAmount = Math.min(amount, user.walletBalance || 0);
           user.walletBalance -= deductAmount;
           await user.save();
        }
      }

      // 2. Handle Merchant Crediting, Stock Deduction & Notifications
      for (const item of items || []) {
         const sellerId = item.seller_id || item.sellerId;
         
         // 2a. Decrement Mongo Product Stock
         const prod = await Product.findOne({ id: item.id });
         if (prod) {
            prod.stock = Math.max(0, (prod.stock || 10) - (item.quantity || 1));
            await prod.save();
            
            // If stock drops to 10 or below, trigger warning alert to merchant
            if (prod.stock <= 10 && sellerId) {
               const lowStockNotif = new Notification({
                 userId: sellerId,
                 message: `⚠️ Low Stock Warning: Only ${prod.stock} items left for your product "${prod.title}". Please restock soon.`
               });
               await lowStockNotif.save();
            }
         }

         // 2b. Credit Merchant Wallet & Notify
         if (sellerId) {
            let seller = await findUserById(sellerId);
            if (seller) {
               const earnings = item.price * (item.quantity || 1);
               seller.walletBalance = (seller.walletBalance || 0) + earnings;
               await seller.save();

               const notif = new Notification({
                 userId: sellerId,
                 message: `Your product "${item.title}" has been ordered! $${earnings.toFixed(2)} has been added to your wallet.`
               });
               await notif.save();
            }
         }
      }

      const newOrder = new Order(orderData);
      await newOrder.save();
      return res.status(201).json(newOrder);
    } catch (err) {
      console.warn('[MongoDB] Order save failed, storing locally:', err.message);
    }
  }
  
  // Local DB Fallback
  const db = readLocalDb();
  if (useWallet) {
     const userIndex = db.users.findIndex(u => u.id === userId || u._id === userId);
     if (userIndex !== -1) {
        const currentBalance = db.users[userIndex].walletBalance || 0;
        const deductAmount = Math.min(amount, currentBalance);
        db.users[userIndex].walletBalance = currentBalance - deductAmount;
     }
  }
  for (const item of items || []) {
     // Decrement local product stock
     const pIdx = db.products.findIndex(p => p.id === item.id);
     if (pIdx !== -1) {
        db.products[pIdx].stock = Math.max(0, (db.products[pIdx].stock || 10) - (item.quantity || 1));
        const finalStock = db.products[pIdx].stock;
        
        // Notify seller if stock is <= 10
        const sellerId = item.seller_id || item.sellerId;
        if (finalStock <= 10 && sellerId) {
           db.notifications.push({
             id: 'notif_' + Date.now() + Math.random(),
             userId: sellerId,
             message: `⚠️ Low Stock Warning: Only ${finalStock} items left for your product "${db.products[pIdx].title}". Please restock soon.`,
             isRead: false,
             createdAt: new Date().toISOString()
           });
        }
     }

     const sellerId = item.seller_id || item.sellerId;
     if (sellerId) {
        const sIdx = db.users.findIndex(u => u.id === sellerId || u._id === sellerId);
        if (sIdx !== -1) {
           const earnings = item.price * (item.quantity || 1);
           db.users[sIdx].walletBalance = (db.users[sIdx].walletBalance || 0) + earnings;
           db.notifications.push({
             id: 'notif_' + Date.now() + Math.random(),
             userId: sellerId,
             message: `Your product "${item.title}" has been ordered! $${earnings.toFixed(2)} has been added to your wallet.`,
             isRead: false,
             createdAt: new Date().toISOString()
           });
        }
     }
  }
  db.orders.push(orderData);
  writeLocalDb(db);
  res.status(201).json(orderData);
});

// 11. LIST ACTIVE IN-TRANSIT SHIPMENTS
app.get('/api/orders/active/:userId', async (req, res) => {
  const { userId } = req.params;
  
  if (isMongoConnected) {
    try {
      const active = await Order.find({ userId, status: { $ne: 'delivered' } });
      return res.json(active);
    } catch (err) {
      console.warn('[MongoDB] Active orders load failed, loading locally:', err.message);
    }
  }
  
  const db = readLocalDb();
  const active = db.orders.filter(o => o.userId === userId && o.status !== 'delivered');
  res.json(active);
});

// 12. LIST COMPLETED DELIVERED HISTORY
app.get('/api/orders/delivered/:userId', async (req, res) => {
  const { userId } = req.params;
  
  if (isMongoConnected) {
    try {
      const delivered = await Order.find({ userId, status: 'delivered' });
      return res.json(delivered);
    } catch (err) {
      console.warn('[MongoDB] Delivered orders load failed, loading locally:', err.message);
    }
  }
  
  const db = readLocalDb();
  const delivered = db.orders.filter(o => o.userId === userId && o.status === 'delivered');
  res.json(delivered);
});

// 13. FAST FORWARD SHIPMENT TIMESTAMP
app.post('/api/orders/advance/:orderId', async (req, res) => {
  const { orderId } = req.params;
  
  if (isMongoConnected) {
    try {
      const order = await Order.findOne({ orderId });
      if (order) {
        const elapsedSeconds = (Date.now() - order.timestamp) / 1000;
        let shiftMs = 11000;
        if (elapsedSeconds < 10) shiftMs = (12 - elapsedSeconds) * 1000;
        else if (elapsedSeconds < 20) shiftMs = (22 - elapsedSeconds) * 1000;
        else if (elapsedSeconds < 30) shiftMs = (32 - elapsedSeconds) * 1000;

        order.timestamp = order.timestamp - shiftMs;
        await order.save();
        return res.json(order);
      }
    } catch (err) {
      console.warn('[MongoDB] Order advance failed, executing locally:', err.message);
    }
  }
  
  const db = readLocalDb();
  const orderIdx = db.orders.findIndex(o => o.orderId === orderId);
  if (orderIdx !== -1) {
    const order = db.orders[orderIdx];
    const elapsedSeconds = (Date.now() - order.timestamp) / 1000;
    let shiftMs = 11000;
    if (elapsedSeconds < 10) shiftMs = (12 - elapsedSeconds) * 1000;
    else if (elapsedSeconds < 20) shiftMs = (22 - elapsedSeconds) * 1000;
    else if (elapsedSeconds < 30) shiftMs = (32 - elapsedSeconds) * 1000;

    order.timestamp = order.timestamp - shiftMs;
    db.orders[orderIdx] = order;
    writeLocalDb(db);
    return res.json(order);
  }
  
  res.status(404).json({ message: 'Order not found' });
});

// 14. RESET ORDER TRANSIT
app.post('/api/orders/reset/:orderId', async (req, res) => {
  const { orderId } = req.params;
  
  if (isMongoConnected) {
    try {
      const order = await Order.findOne({ orderId });
      if (order) {
        order.status = 'placed';
        order.timestamp = Date.now();
        order.deliveryDate = '';
        await order.save();
        return res.json(order);
      }
    } catch (err) {
      console.warn('[MongoDB] Order reset failed, resetting locally:', err.message);
    }
  }
  
  const db = readLocalDb();
  const orderIdx = db.orders.findIndex(o => o.orderId === orderId);
  if (orderIdx !== -1) {
    const order = db.orders[orderIdx];
    order.status = 'placed';
    order.timestamp = Date.now();
    order.deliveryDate = '';
    db.orders[orderIdx] = order;
    writeLocalDb(db);
    return res.json(order);
  }
  
  res.status(404).json({ message: 'Order not found' });
});


// ---------------- BACKGROUND DAEMON TRANSIT TRACKER ----------------

setInterval(async () => {
  if (isMongoConnected) {
    try {
      const transitOrders = await Order.find({ status: { $ne: 'delivered' } });
      for (let i = 0; i < transitOrders.length; i++) {
        const order = transitOrders[i];
        const elapsedSeconds = (Date.now() - order.timestamp) / 1000;
        let statusChanged = false;

        if (elapsedSeconds >= 30) {
          order.status = 'delivered';
          order.deliveryDate = new Date().toLocaleDateString() + " at " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          statusChanged = true;
        } else if (elapsedSeconds >= 20 && order.status !== 'out_for_delivery') {
          order.status = 'out_for_delivery';
          statusChanged = true;
        } else if (elapsedSeconds >= 10 && order.status !== 'shipped' && order.status !== 'out_for_delivery') {
          order.status = 'shipped';
          statusChanged = true;
        }

        if (statusChanged) {
          await order.save();
          console.log(`[Cloud Daemon] Order ${order.orderId} advanced status: ${order.status}`);
        }
      }
    } catch (err) {
      console.error('[Cloud Daemon] Transit loop failed:', err.message);
    }
  } else {
    // Fail-safe Local JSON database updates
    try {
      const db = readLocalDb();
      let hasChanges = false;
      
      db.orders = db.orders.map(order => {
        const elapsedSeconds = (Date.now() - order.timestamp) / 1000;
        let updatedOrder = { ...order };
        let statusChanged = false;

        if (order.status !== 'delivered') {
          if (elapsedSeconds >= 30) {
            updatedOrder.status = 'delivered';
            updatedOrder.deliveryDate = new Date().toLocaleDateString() + " at " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            statusChanged = true;
          } else if (elapsedSeconds >= 20 && order.status !== 'out_for_delivery') {
            updatedOrder.status = 'out_for_delivery';
            statusChanged = true;
          } else if (elapsedSeconds >= 10 && order.status !== 'shipped' && order.status !== 'out_for_delivery') {
            updatedOrder.status = 'shipped';
            statusChanged = true;
          }
        }

        if (statusChanged) {
          hasChanges = true;
          console.log(`[Local Daemon] Order ${order.orderId} advanced status: ${updatedOrder.status}`);
          return updatedOrder;
        }
        return order;
      });

      if (hasChanges) {
        writeLocalDb(db);
      }
    } catch (err) {
      console.error('[Local Daemon] Transit loop failed:', err.message);
    }
  }
}, 3000);



// 14. GET WALLET BALANCE
app.get('/api/user/:id/wallet', async (req, res) => {
  const { id } = req.params;
  console.log(`[Wallet API] Fetching balance for user: ${id}`);
  if (isMongoConnected) {
    try {
      let user = await findUserById(id);
      if (user) {
        console.log(`[Wallet API] Found Mongo user: ${user.email}, balance: ${user.walletBalance}`);
        return res.json({ balance: user.walletBalance || 0 });
      }
    } catch (err) {
      console.error(`[Wallet API] Mongo fetch error:`, err.message);
    }
  }
  const db = readLocalDb();
  const user = db.users.find(u => u.id === id || u._id === id);
  console.log(`[Wallet API] Local db lookup for user: ${id}, found: ${!!user}`);
  res.json({ balance: user ? (user.walletBalance || 0) : 0 });
});

// 15. WITHDRAW FUNDS
app.post('/api/user/:id/withdraw', async (req, res) => {
  const { id } = req.params;
  console.log(`[Withdraw API] Initiating payout for user: ${id}`);
  if (isMongoConnected) {
    try {
      let user = await findUserById(id);
      if (user) {
        console.log(`[Withdraw API] Resetting Mongo wallet balance for user: ${user.email}`);
        user.walletBalance = 0;
        await user.save();
        console.log(`[Withdraw API] Mongo wallet balance successfully reset.`);
        return res.json({ success: true });
      }
    } catch (err) {
      console.error(`[Withdraw API] Mongo withdraw error:`, err.message);
    }
  }
  const db = readLocalDb();
  const userIndex = db.users.findIndex(u => u.id === id || u._id === id);
  if (userIndex !== -1) {
    db.users[userIndex].walletBalance = 0;
    writeLocalDb(db);
    console.log(`[Withdraw API] Reset local wallet balance for user index: ${userIndex}`);
  }
  res.json({ success: true });
});

// 15b. DEPOSIT FUNDS (FOR TESTING)
app.post('/api/user/:id/deposit', async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const depositAmount = parseFloat(amount) || 100;
  console.log(`[Deposit API] Depositing $${depositAmount} for user: ${id}`);
  if (isMongoConnected) {
    try {
      let user = await findUserById(id);
      if (user) {
        user.walletBalance = (user.walletBalance || 0) + depositAmount;
        await user.save();
        console.log(`[Deposit API] Mongo wallet balance successfully updated to: $${user.walletBalance}`);
        return res.json({ success: true, balance: user.walletBalance });
      }
    } catch (err) {
      console.error(`[Deposit API] Mongo deposit error:`, err.message);
    }
  }
  const db = readLocalDb();
  const userIndex = db.users.findIndex(u => u.id === id || u._id === id);
  if (userIndex !== -1) {
    db.users[userIndex].walletBalance = (db.users[userIndex].walletBalance || 0) + depositAmount;
    writeLocalDb(db);
    console.log(`[Deposit API] Updated local wallet balance for user index: ${userIndex}`);
    return res.json({ success: true, balance: db.users[userIndex].walletBalance });
  }
  res.json({ success: true, balance: depositAmount });
});

// 16. GET NOTIFICATIONS
app.get('/api/notifications/:userId', async (req, res) => {
  const { userId } = req.params;
  if (isMongoConnected) {
    try {
      const notifs = await Notification.find({ userId, isRead: false }).sort({ createdAt: -1 });
      return res.json(notifs);
    } catch (err) {}
  }
  const db = readLocalDb();
  const notifs = (db.notifications || []).filter(n => n.userId === userId && !n.isRead).reverse();
  res.json(notifs);
});

// 17. MARK NOTIFICATIONS READ
app.post('/api/notifications/:userId/read', async (req, res) => {
  const { userId } = req.params;
  if (isMongoConnected) {
    try {
      await Notification.updateMany({ userId, isRead: false }, { isRead: true });
      return res.json({ success: true });
    } catch (err) {}
  }
  const db = readLocalDb();
  if (db.notifications) {
    db.notifications.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
    writeLocalDb(db);
  }
  res.json({ success: true });
});

// Start server listener
app.listen(PORT, () => {
  console.log(`Express API Server listening on port ${PORT}...`);
});

// ─────────────────────────────────────────────────────────────────────────────
// KEEP-ALIVE SELF-PING (prevents Render free tier from sleeping)
// Sends a GET /api/ping to itself every 14 minutes
// ─────────────────────────────────────────────────────────────────────────────

// Health-check endpoint
app.get('/api/ping', (req, res) => {
  res.json({ status: 'alive', time: new Date().toISOString() });
});

const RENDER_URL = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL || null;
const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

if (RENDER_URL) {
  setInterval(async () => {
    const pingUrl = `${RENDER_URL}/api/ping`;
    try {
      const res = await fetch(pingUrl);
      const data = await res.json();
      console.log(`[Keep-Alive] Pinged ${pingUrl} → ${data.status} at ${data.time}`);
    } catch (err) {
      console.warn(`[Keep-Alive] Ping failed:`, err.message);
    }
  }, PING_INTERVAL_MS);

  console.log(`[Keep-Alive] Self-ping enabled every 14 min → ${RENDER_URL}/api/ping`);
} else {
  console.log(`[Keep-Alive] RENDER_EXTERNAL_URL not set – skipping self-ping (local dev mode).`);
}

