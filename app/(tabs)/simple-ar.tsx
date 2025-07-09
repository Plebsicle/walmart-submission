import SimpleARNavigation from '@/components/SimpleARNavigation';
import SimpleDropdown from '@/components/SimpleDropdown';
import {
    PickerItem,
    SimpleItem,
    simpleStoreService
} from '@/services/SimpleStoreService';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function SimpleARScreen() {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SimpleItem | null>(null);
  const [pickerItems, setPickerItems] = useState<PickerItem[]>([]);

  useEffect(() => {
    // Initialize picker items
    const items = simpleStoreService.getPickerItems();
    setPickerItems(items);
  }, []);

  useEffect(() => {
    // Update selected item when selection changes
    if (selectedItemId) {
      const item = simpleStoreService.getItemById(selectedItemId);
      setSelectedItem(item);
    } else {
      setSelectedItem(null);
    }
  }, [selectedItemId]);

  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header with Dropdown */}
      <View style={styles.header}>
        <Text style={styles.title}>AR Store Navigation</Text>
        <Text style={styles.subtitle}>Select an item to find</Text>
        
        <View style={styles.dropdownContainer}>
          <SimpleDropdown
            items={pickerItems}
            selectedValue={selectedItemId}
            onValueChange={handleItemSelect}
            placeholder="Choose an item to find..."
          />
        </View>
      </View>

      {/* AR Navigation View */}
      <View style={styles.arContainer}>
        <SimpleARNavigation selectedItem={selectedItem} />
      </View>

      {/* Instructions */}
      {!selectedItem && (
        <View style={styles.instructionsOverlay}>
          <Text style={styles.instructionsTitle}>How to use:</Text>
          <Text style={styles.instructionsText}>
            1. Select an item from the dropdown above{'\n'}
            2. Point your camera forward{'\n'}
            3. Follow the AR arrow to find the item
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  dropdownContainer: {
    marginBottom: 8,
  },
  arContainer: {
    flex: 1,
  },
  instructionsOverlay: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 12,
  },
  instructionsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionsText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
}); 