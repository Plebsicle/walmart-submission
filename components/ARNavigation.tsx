import ArrowOverlay from '@/components/ArrowOverlay';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Magnetometer } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, PermissionsAndroid, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface TargetLocation {
  x: number;
  y: number;
  z: number;
  latitude: number;
  longitude: number;
}

interface Props {
  targetLocation: TargetLocation;
  onLocationUpdate?: (location: LocationData) => void;
}

const ARNavigation: React.FC<Props> = ({ targetLocation, onLocationUpdate }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [magnetometerData, setMagnetometerData] = useState({ x: 0, y: 0, z: 0 });
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  
  // Use hardcoded location for demo purposes to match store coordinates
  const demoLocation = {
    latitude: 40.7128,
    longitude: -74.0060,
    accuracy: 5,
  };

  // Animated values
  const arrowRotation = useSharedValue(0);
  const arrowOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  // Refs for sensor subscriptions
  const magnetometerSubscription = useRef<any>(null);
  const locationWatchId = useRef<number | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      await initializePermissions();
      await startSensorUpdates();
    };
    
    initializeApp();
    
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (currentLocation && targetLocation) {
      updateArrowDirection();
    }
  }, [currentLocation, targetLocation, magnetometerData]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to location for AR navigation',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
      } catch (err) {
        console.warn(err);
        return 'denied';
      }
    }
    return 'granted'; // iOS permissions are handled via Info.plist
  };

  const initializePermissions = async () => {
    // Request camera permission
    if (!permission?.granted) {
      await requestPermission();
    }

    // Request location permission
    try {
      const locationPermission = await requestLocationPermission();
      if (locationPermission === 'granted') {
        setIsLocationEnabled(true);
        startLocationTracking();
      } else {
        Alert.alert('Location Permission', 'Location access is required for AR navigation');
      }
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  const startSensorUpdates = async () => {
    try {
      // Check if magnetometer is available
      const isAvailable = await Magnetometer.isAvailableAsync();
      if (!isAvailable) {
        console.log('Magnetometer not available, using fallback heading');
        // Use a fallback heading (pointing north)
        setMagnetometerData({ x: 0, y: 1, z: 0 });
        return;
      }

      // Set magnetometer update interval
      Magnetometer.setUpdateInterval(100);
      
      // Subscribe to magnetometer
      magnetometerSubscription.current = Magnetometer.addListener((data) => {
        setMagnetometerData(data);
      });
    } catch (error) {
      console.log('Magnetometer error, using fallback:', error);
      // Use a fallback heading (pointing north)
      setMagnetometerData({ x: 0, y: 1, z: 0 });
    }
  };

  const startLocationTracking = () => {
    // For demo purposes, use hardcoded location instead of real GPS
    // This ensures consistent distance calculations with the mock store data
    setCurrentLocation(demoLocation);
    onLocationUpdate?.(demoLocation);
    
    // Simulate location updates for demo
    const interval = setInterval(() => {
      setCurrentLocation(demoLocation);
      onLocationUpdate?.(demoLocation);
    }, 1000);
    
    // Store interval ID for cleanup
    locationWatchId.current = interval as any;
    
    // Uncomment below for real GPS tracking:
    /*
    locationWatchId.current = Geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setCurrentLocation(location);
        onLocationUpdate?.(location);
      },
      (error) => {
        console.error('Location error:', error);
        Alert.alert('Location Error', 'Unable to get current location');
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 1, // Update every 1 meter
        interval: 1000, // Update every second
        fastestInterval: 500,
      }
    );
    */
  };

  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const lat1Rad = lat1 * (Math.PI / 180);
    const lat2Rad = lat2 * (Math.PI / 180);

    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

    let bearing = Math.atan2(y, x) * (180 / Math.PI);
    bearing = (bearing + 360) % 360;

    return bearing;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const updateArrowDirection = () => {
    if (!currentLocation || !targetLocation) return;

    // Calculate bearing to target
    const bearing = calculateBearing(
      currentLocation.latitude,
      currentLocation.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    );

    // Calculate device heading from magnetometer (or use fallback)
    let deviceHeading = 0; // Default to pointing north
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

    // Add pulse effect when close to target
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    );

    if (distance < 10) { // Within 10 meters
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
    if (locationWatchId.current !== null) {
      // Clear interval for demo location updates
      clearInterval(locationWatchId.current);
      // For real GPS tracking, use: Geolocation.clearWatch(locationWatchId.current);
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
        <Text>Requesting camera permissions...</Text>
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
          <View style={[styles.statusIndicator, { backgroundColor: currentLocation ? '#00ff00' : '#ff0000' }]} />
          <Text style={styles.statusText}>
            {currentLocation ? 'GPS Connected' : 'Searching for GPS...'}
          </Text>
        </View>

        {/* AR Arrow Overlay */}
        <Animated.View style={[styles.arrowContainer, animatedArrowStyle]}>
          <ArrowOverlay 
            direction={arrowRotation.value}
            distance={currentLocation && targetLocation ? 
              calculateDistance(
                currentLocation.latitude,
                currentLocation.longitude,
                targetLocation.latitude,
                targetLocation.longitude
              ) : 0
            }
          />
        </Animated.View>

        {/* Distance Information */}
        {currentLocation && targetLocation && (
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>
              {calculateDistance(
                currentLocation.latitude,
                currentLocation.longitude,
                targetLocation.latitude,
                targetLocation.longitude
              ).toFixed(0)}m away
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
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
  arrowContainer: {
    position: 'absolute',
    bottom: 100,
    left: screenWidth / 2 - 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceContainer: {
    position: 'absolute',
    bottom: 50,
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
});

export default ARNavigation; 