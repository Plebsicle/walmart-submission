# AR Store Navigation System

A React Native mobile application that provides AR-style navigation inside stores using live camera feed and real-time location tracking.

## 🚀 Features

### Core Functionality
- **Live Camera Feed**: Real-time camera view as background for AR overlay
- **Smart Arrow Navigation**: Dynamic arrow overlay that points toward target products
- **Multiple Arrow Types**: 
  - Straight arrows for direct navigation
  - Curved arrows for left/right turns
  - Turn-around indicators for complete direction changes
- **Real-time Location Tracking**: GPS and compass integration for accurate positioning
- **Product Search**: Search and browse store inventory
- **Distance Indicators**: Real-time distance and estimated time to target

### AR Navigation Features
- **Smooth Animations**: Fluid arrow rotation using `react-native-reanimated`
- **Color-coded Guidance**: 
  - Blue: Normal navigation
  - Yellow: Close to target (< 20m)
  - Green: Very close to target (< 5m)
- **Pulse Effects**: Visual feedback when approaching the target
- **Status Indicators**: GPS connection and navigation status
- **Permission Handling**: Automatic camera and location permission requests

## 📱 Screenshots

The app includes three main screens:
1. **Product Search**: Browse and search for products in the store
2. **AR Navigation**: Live camera feed with AR arrow overlay
3. **Navigation Overlay**: Target information and route details

## 🛠 Technical Implementation

### Architecture
```
├── components/
│   ├── ARNavigation.tsx      # Main AR camera + overlay component
│   └── ArrowOverlay.tsx      # SVG arrow with multiple styles
├── services/
│   └── StoreNavigationService.ts  # Backend API integration & store data
├── app/(tabs)/
│   └── ar-navigation.tsx     # Main navigation screen
└── app.json                  # Expo configuration with permissions
```

### Key Technologies
- **Expo Camera**: Live camera feed with proper permissions
- **Expo Sensors**: Magnetometer for device orientation/compass
- **React Native Geolocation**: GPS positioning and location tracking
- **React Native SVG**: Custom arrow graphics with gradients
- **React Native Reanimated**: Smooth animations and transitions
- **TypeScript**: Full type safety and developer experience

### Core Components

#### ARNavigation Component
- Manages camera permissions and live feed
- Handles location tracking and sensor data
- Calculates bearing and distance to target
- Renders arrow overlay with real-time updates
- Provides cleanup for sensors and location services

#### ArrowOverlay Component
- Renders different arrow types using SVG paths
- Implements color-coded distance indicators
- Supports smooth rotation and scaling animations
- Includes glow effects and visual enhancements

#### StoreNavigationService
- Mock backend API for store and product data
- Product search and filtering capabilities
- Navigation route calculation
- Real-time inventory management
- Distance and bearing calculations

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or Android Emulator
- Physical device for testing camera/GPS features

### Installation

1. **Clone and Install Dependencies**
```bash
cd store-ar-navigation
npm install
```

2. **Start Development Server**
```bash
npx expo start
```

3. **Run on Device/Simulator**
- iOS: Press `i` to open iOS Simulator
- Android: Press `a` to open Android Emulator
- Physical Device: Scan QR code with Expo Go app

### Required Permissions
The app automatically requests:
- **Camera Access**: For AR live feed
- **Location Access**: For GPS positioning
- **Device Orientation**: For compass readings

## 📋 Usage Instructions

### 1. Product Search
1. Open the app and navigate to "AR Navigate" tab
2. Use the search bar to find products by name or category
3. Browse the product list or use "Nearby" to find products near your location
4. Tap on any product to start AR navigation

### 2. AR Navigation
1. Once a product is selected, the camera view opens
2. Hold your device up and point the camera forward
3. An arrow overlay appears pointing toward the target product
4. Follow the arrow directions:
   - **Straight Arrow**: Walk straight ahead
   - **Curved Arrow**: Turn left or right as indicated
   - **Turn Around Arrow**: Complete 180° turn required
5. The arrow color indicates your proximity to the target
6. Distance and estimated time are shown at the bottom

### 3. Navigation Controls
- **Stop Navigation**: Tap the X button in the top-left corner
- **View Product Info**: Target product name and aisle displayed at top
- **Distance Updates**: Real-time distance and time estimates

## 🔧 Configuration

### Store Data Configuration
Edit `services/StoreNavigationService.ts` to customize:
```typescript
private mockStoreData: StoreLayout = {
  id: 'your-store-id',
  name: 'Your Store Name',
  coordinates: {
    latitude: YOUR_STORE_LAT,
    longitude: YOUR_STORE_LONG,
  },
  products: [
    // Add your products here
  ],
};
```

### API Integration
Replace mock data with real API calls:
```typescript
async initializeStore(storeId: string): Promise<void> {
  // Replace with actual API call
  const response = await fetch(`${this.baseUrl}/stores/${storeId}`);
  this.currentStore = await response.json();
}
```

### Customization Options
- **Arrow Appearance**: Modify SVG paths in `ArrowOverlay.tsx`
- **Animation Settings**: Adjust spring/timing configs in `ARNavigation.tsx`
- **Distance Thresholds**: Change color/behavior thresholds in components
- **UI Styling**: Update StyleSheet objects for custom appearance

## 🎯 Features in Detail

### Smart Direction Calculation
The app calculates the optimal direction using:
1. **GPS Coordinates**: User's current location vs target location
2. **Compass Data**: Device orientation from magnetometer
3. **Bearing Calculation**: Mathematical bearing to target
4. **Relative Direction**: Device heading vs target bearing

### Arrow Types & Behavior
- **Straight (±15°)**: Direct path ahead
- **Curved Right (15° - 90°)**: Gentle right turn
- **Curved Left (-15° to -90°)**: Gentle left turn  
- **Turn Around (>90°)**: Complete direction change

### Real-time Updates
- **Location**: Updates every 1 meter of movement
- **Orientation**: 100ms magnetometer refresh rate
- **Animations**: 60fps smooth transitions
- **Distance**: Continuous haversine formula calculations

## 🐛 Troubleshooting

### Common Issues

**Camera Not Working**
- Ensure camera permissions are granted
- Check if device has a working camera
- Restart the app if camera view is black

**Location Not Updating**
- Verify location permissions are enabled
- Ensure GPS is turned on
- Test outdoors for better GPS signal
- Check location services in device settings

**Arrow Not Pointing Correctly**
- Calibrate device compass in settings
- Avoid magnetic interference (speakers, metal objects)
- Hold device flat and level for best compass readings
- Try restarting the app to reset sensor data

**Performance Issues**
- Close other camera apps running in background
- Restart device if sensors seem unresponsive
- Ensure sufficient device storage space

### Development Debug Tips
```typescript
// Enable debug logging
console.log('Location:', currentLocation);
console.log('Magnetometer:', magnetometerData);
console.log('Arrow Direction:', arrowRotation.value);
```

## 🔮 Future Enhancements

### Planned Features
- **Indoor Maps**: 2D store layout integration
- **Multi-floor Support**: Elevator/stairs navigation
- **Product Recognition**: Camera-based product identification
- **Voice Guidance**: Audio navigation instructions
- **Offline Mode**: Cached store data for no-internet usage
- **Shopping Lists**: Multi-product navigation routes
- **Social Features**: Share locations with others
- **Analytics**: Navigation success metrics

### Technical Improvements
- **ARKit/ARCore Integration**: Native AR frameworks
- **3D Models**: 3D store visualization
- **Machine Learning**: Improved product recognition
- **Bluetooth Beacons**: Enhanced indoor positioning
- **Real-time Inventory**: Live stock level updates

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review Expo documentation for platform-specific issues

---

**Built with ❤️ using React Native, Expo, and AR technologies** 