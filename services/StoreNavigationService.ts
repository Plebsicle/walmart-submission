export interface Product {
  id: string;
  name: string;
  category: string;
  location: {
    x: number;
    y: number;
    z: number;
    latitude: number;
    longitude: number;
    aisle?: string;
    shelf?: string;
  };
  description?: string;
  price?: number;
  inStock: boolean;
}

export interface StoreLayout {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  layout: {
    width: number;
    height: number;
    floors: number;
  };
  products: Product[];
}

export interface NavigationRequest {
  productId: string;
  userLocation: {
    latitude: number;
    longitude: number;
  };
}

export interface NavigationResponse {
  target: Product;
  route: {
    distance: number;
    estimatedTime: number;
    instructions: string[];
  };
  alternativeProducts?: Product[];
}

class StoreNavigationService {
  private baseUrl: string = 'https://api.example-store.com'; // Replace with actual API
  private currentStore: StoreLayout | null = null;

  // Mock store data for demonstration
  private mockStoreData: StoreLayout = {
    id: 'store-001',
    name: 'SuperMart Downtown',
    address: '123 Main Street, Downtown',
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060,
    },
    layout: {
      width: 200,
      height: 100,
      floors: 1,
    },
    products: [
      {
        id: 'milk-001',
        name: 'Organic Milk',
        category: 'Dairy',
        location: {
          x: 50,
          y: 20,
          z: 0,
          latitude: 40.7129,
          longitude: -74.0059,
          aisle: 'A3',
          shelf: 'Left-2',
        },
        description: '1 Gallon Organic Whole Milk',
        price: 4.99,
        inStock: true,
      },
      {
        id: 'bread-001',
        name: 'Whole Wheat Bread',
        category: 'Bakery',
        location: {
          x: 150,
          y: 30,
          z: 0,
          latitude: 40.7130,
          longitude: -74.0058,
          aisle: 'B5',
          shelf: 'Center-3',
        },
        description: 'Fresh Whole Wheat Bread',
        price: 2.49,
        inStock: true,
      },
      {
        id: 'apple-001',
        name: 'Red Apples',
        category: 'Produce',
        location: {
          x: 80,
          y: 70,
          z: 0,
          latitude: 40.7127,
          longitude: -74.0061,
          aisle: 'Produce Section',
          shelf: 'Display-1',
        },
        description: 'Fresh Red Apples - per lb',
        price: 1.99,
        inStock: true,
      },
      {
        id: 'cereal-001',
        name: 'Oat Cereal',
        category: 'Breakfast',
        location: {
          x: 120,
          y: 50,
          z: 0,
          latitude: 40.7131,
          longitude: -74.0057,
          aisle: 'C7',
          shelf: 'Top-4',
        },
        description: 'Healthy Oat Cereal',
        price: 5.99,
        inStock: true,
      },
    ],
  };

  /**
   * Initialize the service with a specific store
   */
  async initializeStore(storeId: string): Promise<void> {
    try {
      // In a real app, this would fetch from API
      // const response = await fetch(`${this.baseUrl}/stores/${storeId}`);
      // this.currentStore = await response.json();
      
      // For demo, use mock data
      this.currentStore = this.mockStoreData;
      console.log('Store initialized:', this.currentStore.name);
    } catch (error) {
      console.error('Failed to initialize store:', error);
      throw new Error('Could not initialize store data');
    }
  }

  /**
   * Get all products in the current store
   */
  getProducts(): Product[] {
    if (!this.currentStore) {
      throw new Error('Store not initialized');
    }
    return this.currentStore.products;
  }

  /**
   * Search for products by name or category
   */
  searchProducts(query: string): Product[] {
    if (!this.currentStore) {
      throw new Error('Store not initialized');
    }

    const lowercaseQuery = query.toLowerCase();
    return this.currentStore.products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.category.toLowerCase().includes(lowercaseQuery) ||
        product.description?.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get navigation instructions to a specific product
   */
  async getNavigationToProduct(
    productId: string,
    userLocation: { latitude: number; longitude: number }
  ): Promise<NavigationResponse> {
    if (!this.currentStore) {
      throw new Error('Store not initialized');
    }

    const product = this.currentStore.products.find((p) => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (!product.inStock) {
      // Find alternative products in the same category
      const alternatives = this.currentStore.products.filter(
        (p) => p.category === product.category && p.inStock && p.id !== productId
      );
      
      throw new Error(`Product out of stock. ${alternatives.length} alternatives available.`);
    }

    // Calculate distance (simplified calculation)
    const distance = this.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      product.location.latitude,
      product.location.longitude
    );

    // Generate navigation instructions
    const instructions = this.generateInstructions(product);

    return {
      target: product,
      route: {
        distance,
        estimatedTime: Math.ceil(distance / 1.4), // Assume 1.4 m/s walking speed
        instructions,
      },
    };
  }

  /**
   * Get the nearest products to user's location
   */
  getNearbyProducts(
    userLocation: { latitude: number; longitude: number },
    radius: number = 50
  ): Product[] {
    if (!this.currentStore) {
      throw new Error('Store not initialized');
    }

    return this.currentStore.products
      .filter((product) => {
        const distance = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          product.location.latitude,
          product.location.longitude
        );
        return distance <= radius && product.inStock;
      })
      .sort((a, b) => {
        const distanceA = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.location.latitude,
          a.location.longitude
        );
        const distanceB = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.location.latitude,
          b.location.longitude
        );
        return distanceA - distanceB;
      });
  }

  /**
   * Calculate distance between two coordinates
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Generate turn-by-turn instructions
   */
  private generateInstructions(product: Product): string[] {
    const instructions = [];
    
    if (product.location.aisle) {
      instructions.push(`Head to aisle ${product.location.aisle}`);
    }
    
    if (product.location.shelf) {
      instructions.push(`Look for ${product.name} on ${product.location.shelf}`);
    }
    
    instructions.push(`You have arrived at ${product.name}`);
    
    return instructions;
  }

  /**
   * Update product stock status (for real-time inventory)
   */
  async updateProductStock(productId: string, inStock: boolean): Promise<void> {
    if (!this.currentStore) {
      throw new Error('Store not initialized');
    }

    const product = this.currentStore.products.find((p) => p.id === productId);
    if (product) {
      product.inStock = inStock;
    }
  }

  /**
   * Get current store information
   */
  getCurrentStore(): StoreLayout | null {
    return this.currentStore;
  }
}

// Singleton instance
export const storeNavigationService = new StoreNavigationService(); 