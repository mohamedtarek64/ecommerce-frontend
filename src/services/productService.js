import api from './api';

class ProductService {
  // Get all products
  async getProducts(params = {}) {
    try {
      const response = await api.get('/products', { params });
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch products'
      };
    }
  }

  // Get product by ID
  async getProduct(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch product'
      };
    }
  }

  // Get featured products
  async getFeaturedProducts() {
    try {
      const response = await api.get('/products/featured');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch featured products'
      };
    }
  }

  // Get products by category
  async getProductsByCategory(categoryId, params = {}) {
    try {
      const response = await api.get(`/products/category/${categoryId}`, { params });
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch category products'
      };
    }
  }

  // Search products
  async searchProducts(query, params = {}) {
    try {
      const response = await api.get('/products/search', { params: { q: query, ...params } });
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Search failed'
      };
    }
  }

  // Get product reviews
  async getProductReviews(productId, params = {}) {
    try {
      const response = await productsAPI.getProductReviews(productId, params);
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch reviews'
      };
    }
  }

  // Add product review
  async addProductReview(productId, reviewData) {
    try {
      const response = await productsAPI.addProductReview(productId, reviewData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add review'
      };
    }
  }

  // Get product recommendations
  async getProductRecommendations(productId) {
    try {
      const response = await productsAPI.getProductRecommendations(productId);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch recommendations'
      };
    }
  }

  // Get related products
  async getRelatedProducts(productId) {
    try {
      const response = await productsAPI.getRelatedProducts(productId);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch related products'
      };
    }
  }

  // Get product variants
  async getProductVariants(productId) {
    try {
      const response = await productsAPI.getProductVariants(productId);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch product variants'
      };
    }
  }

  // Check product availability
  async checkProductAvailability(productId, quantity = 1) {
    try {
      const response = await productsAPI.checkProductAvailability(productId, quantity);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to check availability'
      };
    }
  }
}

// Create singleton instance
const productService = new ProductService();

export default productService;