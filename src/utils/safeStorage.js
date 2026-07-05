/**
 * Safely writes data to localStorage, stripping large base64 strings
 * to prevent QuotaExceededError and wrapping in try-catch blocks.
 */
export const safeLocalStorage = {
  // Helper to strip large base64 image strings from product objects/arrays
  cleanData(data) {
    if (!data) return data;

    // If it's an array, recursively clean each item
    if (Array.isArray(data)) {
      return data.map(item => this.cleanData(item));
    }

    // If it's a product object
    if (typeof data === 'object') {
      const cleaned = { ...data };
      
      // Clean 'images' array if exists
      if (Array.isArray(cleaned.images)) {
        cleaned.images = cleaned.images.map(img => {
          if (typeof img === 'string' && img.startsWith('data:image') && img.length > 50000) {
            return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150"; // placeholder
          }
          return img;
        });
      }

      // Clean single 'image' field if exists
      if (typeof cleaned.image === 'string' && cleaned.image.startsWith('data:image') && cleaned.image.length > 50000) {
        cleaned.image = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150";
      }

      // Recursively clean any other nested properties if needed
      for (const key in cleaned) {
        if (typeof cleaned[key] === 'object' && cleaned[key] !== null) {
          cleaned[key] = this.cleanData(cleaned[key]);
        }
      }

      return cleaned;
    }

    return data;
  },

  setItem(key, value) {
    try {
      const cleaned = this.cleanData(value);
      localStorage.setItem(key, JSON.stringify(cleaned));
    } catch (e) {
      console.error(`Failed to save key "${key}" to localStorage:`, e);
      // Fallback: If still failing, store a completely minimized version (e.g. only critical fields)
      try {
        if (Array.isArray(value)) {
          const minimal = value.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            images: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150"]
          }));
          localStorage.setItem(key, JSON.stringify(minimal));
        } else if (typeof value === 'object' && value !== null) {
          const minimal = {
            id: value.id,
            title: value.title,
            price: value.price,
            images: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150"]
          };
          localStorage.setItem(key, JSON.stringify(minimal));
        }
      } catch (fallbackError) {
        console.error(`Fallback failed for key "${key}":`, fallbackError);
      }
    }
  },

  getItem(key, fallback = null) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      console.error(`Failed to parse key "${key}" from localStorage:`, e);
      return fallback;
    }
  }
};
