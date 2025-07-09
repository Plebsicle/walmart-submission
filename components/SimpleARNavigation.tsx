import ArrowOverlay from '@/components/ArrowOverlay';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { SimpleItem, simpleStoreService } from '../services/SimpleStoreService';

const { width: screenWidth } = Dimensions.get('window');

interface Props {
  selectedItem: SimpleItem | null;
}

const SimpleARNavigation: React.FC<Props> = ({ selectedItem }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [magnetometerData, setMagnetometerData] = useState({ x: 0, y: 0, z: 0 });
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [magnetometerAvailable, setMagnetometerAvailable] = useState<boolean>(false);
  const [currentDistance, setCurrentDistance] = useState<number>(0);
  const [arrowDirection, setArrowDirection] = useState<number>(0);

  // Use hardcoded demo location for consistent distance calculations
  const demoLocation = {
    latitude: 40.7128,
    longitude: -74.0060,
  };

  // Animated values
  const arrowRotation = useSharedValue(0);
  const arrowOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  // Refs for sensor subscriptions
  const magnetometerSubscription = useRef<any>(null);
  const locationSubscription = useRef<any>(null);

  useEffect(() => {
    initializeServices();
    
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (selectedItem) {
      // Use demo location instead of real GPS for consistent distance calculations
      setCurrentLocation(demoLocation);
      updateArrowDirection();
    } else if (!selectedItem) {
      // Hide arrow when no item selected
      arrowOpacity.value = withTiming(0, { duration: 300 });
      setCurrentDistance(0);
    }
  }, [selectedItem, magnetometerData]);

  // Use derived value to track arrow rotation and update state
  useDerivedValue(() => {
    runOnJS(setArrowDirection)(arrowRotation.value);
  });

  const initializeServices = async () => {
    // Request camera permission
    if (!permission?.granted) {
      await requestPermission();
    }

    // Set demo location immediately for consistent experience
    setCurrentLocation(demoLocation);

    // Request location permission (but we'll use demo location)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    } catch (error) {
      console.error('Location permission error:', error);
    }

    // Start magnetometer
    await startMagnetometer();
  };

  const startLocationTracking = async () => {
    // Use demo location for consistent distance calculations
    setCurrentLocation(demoLocation);
    
    // For real GPS tracking, uncomment below:
    /*
    try {
      if (locationPermission) {
        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (location) => {
            setCurrentLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          }
        );
      }
    } catch (error) {
      console.error('Location tracking error:', error);
    }
    */
  };

  const startMagnetometer = async () => {
    try {
      const isAvailable = await Magnetometer.isAvailableAsync();
      setMagnetometerAvailable(isAvailable);
      
      if (!isAvailable) {
        console.log('Magnetometer not available, using fallback heading');
        setMagnetometerData({ x: 0, y: 1, z: 0 });
        return;
      }

      Magnetometer.setUpdateInterval(100);
      
      magnetometerSubscription.current = Magnetometer.addListener((data) => {
        setMagnetometerData(data);
      });
    } catch (error) {
      console.log('Magnetometer error, using fallback:', error);
      setMagnetometerAvailable(false);
      setMagnetometerData({ x: 0, y: 1, z: 0 });
    }
  };

  const updateArrowDirection = () => {
    if (!currentLocation || !selectedItem) return;

    // Calculate bearing to target
    const bearing = simpleStoreService.calculateBearing(
      currentLocation.latitude,
      currentLocation.longitude,
      selectedItem.latitude,
      selectedItem.longitude
    );

    // Calculate device heading from magnetometer (or use fallback)
    let deviceHeading = 0;
    if (magnetometerData.x !== 0 || magnetometerData.y !== 0) {
      deviceHeading = Math.atan2(magnetometerData.y, magnetometerData.x) * (180 / Math.PI);
    }
    const normalizedHeading = (deviceHeading + 360) % 360;

    // Calculate relative direction
    let relativeDirection = bearing - normalizedHeading;
    if (relativeDirection > 180) relativeDirection -= 360;
    if (relativeDirection < -180) relativeDirection += 360;

    // Update arrow rotation with smooth animation
    arrowRotation.value = withSpring(relativeDirection, {
      damping: 15,
      stiffness: 100,
    });

    // Show arrow with fade-in animation
    if (arrowOpacity.value === 0) {
      arrowOpacity.value = withTiming(1, { duration: 500 });
    }

    // Calculate and update distance
    const distance = simpleStoreService.calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      selectedItem.latitude,
      selectedItem.longitude
    );
    setCurrentDistance(distance);

    // Add pulse effect when close to target
    if (distance < 10) {
      pulseScale.value = withSpring(1.2, { damping: 3 });
      setTimeout(() => {
        pulseScale.value = withSpring(1, { damping: 3 });
      }, 300);
    }
  };

  const cleanup = () => {
    if (magnetometerSubscription.current) {
      magnetometerSubscription.current.remove();
    }
    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }
  };

  const animatedArrowStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${arrowRotation.value}deg` },
        { scale: pulseScale.value },
      ],
      opacity: arrowOpacity.value,
    };
  });

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.statusText}>Requesting camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera access is required for AR navigation</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera Feed */}
      <CameraView style={styles.camera} facing="back">
        {/* Status Indicators */}
        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusIndicator, 
              { backgroundColor: currentLocation ? '#00ff00' : '#ff6b6b' }
            ]} />
            <Text style={styles.statusText}>
              {currentLocation ? 'GPS Connected' : 'Searching GPS...'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusIndicator, 
              { backgroundColor: magnetometerAvailable ? '#00ff00' : '#ffa500' }
            ]} />
            <Text style={styles.statusText}>
              {magnetometerAvailable ? 'Compass Active' : 'Compass Fallback'}
            </Text>
          </View>
        </View>

        {/* Selected Item Info */}
        {selectedItem && (
          <View style={styles.itemContainer}>
            <Text style={styles.itemName}>{selectedItem.name}</Text>
            <Text style={styles.itemAisle}>{selectedItem.aisle}</Text>
          </View>
        )}

        {/* AR Arrow Overlay */}
        {selectedItem && (
          <Animated.View style={[styles.arrowContainer, animatedArrowStyle]}>
            <ArrowOverlay 
              direction={arrowDirection}
              distance={currentDistance}
            />
          </Animated.View>
        )}

        {/* Distance Information */}
        {selectedItem && currentLocation && (
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>
              {currentDistance.toFixed(0)}m away
            </Text>
          </View>
        )}

        {/* No Selection Message */}
        {!selectedItem && (
          <View style={styles.noSelectionContainer}>
            <Text style={styles.noSelectionText}>
              Select an item from the dropdown above
            </Text>
          </View>
        )}
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  permissionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  statusContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
  },
  itemContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
  },
  itemName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemAisle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 120,
    left: screenWidth / 2 - 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceContainer: {
    position: 'absolute',
    bottom: 70,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  distanceText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noSelectionContainer: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
  },
  noSelectionText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SimpleARNavigation; 