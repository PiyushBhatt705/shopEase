const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper to make fetch calls simpler
const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  return response.json();
};

export const apiService = {
  // 1. User Authentication
  auth: {
    async register(name, email, password) {
      return fetchJson(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
    },

    async login(email, password) {
      return fetchJson(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    }
  },

  // 2. Products Catalog & Search
  products: {
    async listAll() {
      return fetchJson(`${API_BASE_URL}/api/products`);
    },

    async getById(id) {
      return fetchJson(`${API_BASE_URL}/api/products/${id}`);
    },

    async create(productData) {
      return fetchJson(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        body: JSON.stringify(productData)
      });
    },

    async update(productId, productData) {
      return fetchJson(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      });
    }
  },

  // 3. Seller Store & Merchant Inventories
  seller: {
    async registerStore(storeDetails) {
      return fetchJson(`${API_BASE_URL}/api/seller/register`, {
        method: 'POST',
        body: JSON.stringify(storeDetails)
      });
    },

    async getStore(ownerId) {
      return fetchJson(`${API_BASE_URL}/api/seller/store/${ownerId}`).catch(() => null);
    },

    async getInventory(ownerId) {
      return fetchJson(`${API_BASE_URL}/api/seller/inventory/${ownerId}`);
    },

    async deleteProduct(productId) {
      return fetchJson(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'DELETE'
      });
    },

    async getOrders(sellerId) {
      return fetchJson(`${API_BASE_URL}/api/seller/orders/${sellerId}`);
    },

    async updateOrderStatus(orderId, status) {
      return fetchJson(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    }
  },

  // 4. E-Commerce Purchases & Tracking
  orders: {
    async create(orderData) {
      return fetchJson(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
    },

    async listActive(userId) {
      return fetchJson(`${API_BASE_URL}/api/orders/active/${userId}`).then(data => {
        return (data || []).map(o => ({
          ...o,
          orderId: o.orderId,
          date: new Date(o.timestamp).toLocaleDateString()
        }));
      });
    },

    async listDelivered(userId) {
      return fetchJson(`${API_BASE_URL}/api/orders/delivered/${userId}`).then(data => {
        return (data || []).map(o => ({
          ...o,
          orderId: o.orderId,
          date: new Date(o.timestamp).toLocaleDateString(),
          deliveryDate: o.deliveryDate
        }));
      });
    },

    async advance(orderId) {
      return fetchJson(`${API_BASE_URL}/api/orders/advance/${orderId}`, {
        method: 'POST'
      });
    },

    async reset(orderId) {
      return fetchJson(`${API_BASE_URL}/api/orders/reset/${orderId}`, {
        method: 'POST'
      });
    }
  },

  // 5. User Wallet & Notifications
  user: {
    async getWallet(userId) {
      return fetchJson(`${API_BASE_URL}/api/user/${userId}/wallet`);
    },
    async withdraw(userId) {
      return fetchJson(`${API_BASE_URL}/api/user/${userId}/withdraw`, { method: 'POST' });
    },
    async deposit(userId, amount) {
      return fetchJson(`${API_BASE_URL}/api/user/${userId}/deposit`, {
        method: 'POST',
        body: JSON.stringify({ amount })
      });
    },
    async getNotifications(userId) {
      return fetchJson(`${API_BASE_URL}/api/notifications/${userId}`);
    },
    async markNotificationsRead(userId) {
      return fetchJson(`${API_BASE_URL}/api/notifications/${userId}/read`, { method: 'POST' });
    }
  }
};
