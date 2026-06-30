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

app.use(cors());
app.use(express.json());

// Local File Database Fallback Config
const dbPath = path.join(__dirname, 'db.json');
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ users: [], stores: [], products: [], orders: [] }, null, 2));
}

const readLocalDb = () => {
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {
    return { users: [], stores: [], products: [], orders: [] };
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
});

// ---------------- DATABASE SCHEMAS (MONGODB) ----------------

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

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


// ---------------- API ROUTE CONTROLLERS ----------------

// 1. AUTH REGISTER
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (isMongoConnected) {
    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already exists' });

      const newUser = new User({ name, email, password });
      await newUser.save();
      return res.status(201).json({ id: newUser._id.toString(), name: newUser.name, email: newUser.email });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    // Fail-safe Local JSON Mode
    const db = readLocalDb();
    if (db.users.some(u => u.email === email)) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const newUser = { id: 'usr_' + Date.now(), name, email, password };
    db.users.push(newUser);
    writeLocalDb(db);
    return res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email });
  }
});

// 2. AUTH LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (isMongoConnected) {
    try {
      const user = await User.findOne({ email, password });
      if (!user) return res.status(400).json({ message: 'Invalid email or password' });
      return res.json({ id: user._id.toString(), name: user.name, email: user.email });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    // Fail-safe Local JSON Mode
    const db = readLocalDb();
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });
    return res.json({ id: user.id, name: user.name, email: user.email });
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
  const store = db.stores.find(s => s.ownerId === ownerId);
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

// 10. CREATE E-COMMERCE ORDER
app.post('/api/orders', async (req, res) => {
  const orderData = req.body;
  
  if (isMongoConnected) {
    try {
      const newOrder = new Order(orderData);
      await newOrder.save();
      return res.status(201).json(newOrder);
    } catch (err) {
      console.warn('[MongoDB] Order save failed, storing locally:', err.message);
    }
  }
  
  const db = readLocalDb();
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

