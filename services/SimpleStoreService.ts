export interface SimpleItem {
  id: string;
  name: string;
  aisle: string;
  latitude: number;
  longitude: number;
}

export interface PickerItem {
  label: string;
  value: string;
}

class SimpleStoreService {
  // Default items around NYC (will be updated based on user location)
  private hardcodedItems: SimpleItem[] = [
    {
      id: 'feastables',
      name: 'Feastables',
      aisle: 'Aisle 2',
      latitude: 40.7129,
      longitude: -74.0059,
    },
    {
      id: 'toothpaste',
      name: 'Toothpaste',
      aisle: 'Aisle 3',
      latitude: 40.7127,
      longitude: -74.0061,
    },
    {
      id: 'soda',
      name: 'Soda',
      aisle: 'Aisle 1',
      latitude: 40.7130,
      longitude: -74.0058,
    },
  ];

  /**
   * Update item positions based on user's current location
   * This creates realistic distances (10-50 meters) for demo purposes
   */
  updateItemsNearLocation(userLat: number, userLon: number): void {
    // Create small offsets (in degrees) for realistic distances
    const offsetDistance = 0.0001; // Roughly 10-15 meters
    
    this.hardcodedItems = [
      {
        id: 'feastables',
        name: 'Feastables',
        aisle: 'Aisle 2',
        latitude: userLat + offsetDistance,
        longitude: userLon + offsetDistance * 0.5,
      },
      {
        id: 'toothpaste',
        name: 'Toothpaste',
        aisle: 'Aisle 3',
        latitude: userLat - offsetDistance * 0.8,
        longitude: userLon + offsetDistance * 1.2,
      },
      {
        id: 'soda',
        name: 'Soda',
        aisle: 'Aisle 1',
        latitude: userLat + offsetDistance * 1.5,
        longitude: userLon - offsetDistance * 0.7,
      },
    ];
  }

  /**
   * Get all available items for the dropdown
   */
  getPickerItems(): PickerItem[] {
    return this.hardcodedItems.map(item => ({
      label: `${item.name} - ${item.aisle}`,
      value: item.id,
    }));
  }

  /**
   * Get item details by ID
   */
  getItemById(id: string): SimpleItem | null {
    return this.hardcodedItems.find(item => item.id === id) || null;
  }

  /**
   * Get all items
   */
  getAllItems(): SimpleItem[] {
    return this.hardcodedItems;
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(
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
   * Calculate bearing from one point to another
   */
  calculateBearing(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const lat1Rad = lat1 * (Math.PI / 180);
    const lat2Rad = lat2 * (Math.PI / 180);

    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x =
      Math.cos(lat1Rad) * Math.sin(lat2Rad) -
      Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

    let bearing = Math.atan2(y, x) * (180 / Math.PI);
    bearing = (bearing + 360) % 360;

    return bearing;
  }
}

// Singleton instance
export const simpleStoreService = new SimpleStoreService(); 