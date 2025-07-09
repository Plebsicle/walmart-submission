import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface Props {
  direction: number;
  distance: number;
  size?: number;
}

const ArrowOverlay: React.FC<Props> = ({ direction, distance, size = 80 }) => {
  const arrowType = useMemo(() => {
    const absDirection = Math.abs(direction);
    
    if (absDirection < 15) {
      return 'straight';
    } else if (direction > 15 && direction < 90) {
      return 'curved-right';
    } else if (direction < -15 && direction > -90) {
      return 'curved-left';
    } else if (absDirection > 90) {
      return 'turn-around';
    }
    
    return 'straight';
  }, [direction]);

  const getArrowColor = () => {
    if (distance < 5) return '#00ff00'; // Green when very close
    if (distance < 20) return '#ffff00'; // Yellow when close
    return '#0099ff'; // Blue for normal navigation
  };

  const getStraightArrowPath = () => {
    return `
      M ${size / 2} 10
      L ${size / 2 - 15} 25
      L ${size / 2 - 8} 25
      L ${size / 2 - 8} ${size - 10}
      L ${size / 2 + 8} ${size - 10}
      L ${size / 2 + 8} 25
      L ${size / 2 + 15} 25
      Z
    `;
  };

  const getCurvedRightArrowPath = () => {
    return `
      M ${size / 2} 10
      Q ${size - 10} 20 ${size - 15} ${size / 2}
      L ${size - 25} ${size / 2 - 8}
      L ${size - 25} ${size / 2 + 8}
      L ${size - 15} ${size / 2}
      Q ${size - 20} ${size - 20} ${size / 2 + 5} ${size - 15}
      L ${size / 2 - 5} ${size - 15}
      Q 20 ${size - 20} 15 ${size / 2}
      L 25 ${size / 2 - 8}
      L 25 ${size / 2 + 8}
      L 15 ${size / 2}
      Q 10 20 ${size / 2} 10
      Z
    `;
  };

  const getCurvedLeftArrowPath = () => {
    return `
      M ${size / 2} 10
      Q 10 20 15 ${size / 2}
      L 25 ${size / 2 - 8}
      L 25 ${size / 2 + 8}
      L 15 ${size / 2}
      Q 20 ${size - 20} ${size / 2 - 5} ${size - 15}
      L ${size / 2 + 5} ${size - 15}
      Q ${size - 20} ${size - 20} ${size - 15} ${size / 2}
      L ${size - 25} ${size / 2 - 8}
      L ${size - 25} ${size / 2 + 8}
      L ${size - 15} ${size / 2}
      Q ${size - 10} 20 ${size / 2} 10
      Z
    `;
  };

  const getTurnAroundArrowPath = () => {
    return `
      M ${size / 2} 15
      Q 20 15 20 ${size / 2}
      Q 20 ${size - 20} ${size / 2} ${size - 20}
      Q ${size - 20} ${size - 20} ${size - 20} ${size / 2}
      L ${size - 30} ${size / 2 - 10}
      L ${size - 10} ${size / 2}
      L ${size - 30} ${size / 2 + 10}
      L ${size - 20} ${size / 2}
      Q ${size - 30} ${size - 30} ${size / 2} ${size - 30}
      Q 30 ${size - 30} 30 ${size / 2}
      Q 30 25 ${size / 2} 25
      Z
    `;
  };

  const getArrowPath = () => {
    switch (arrowType) {
      case 'curved-right':
        return getCurvedRightArrowPath();
      case 'curved-left':
        return getCurvedLeftArrowPath();
      case 'turn-around':
        return getTurnAroundArrowPath();
      default:
        return getStraightArrowPath();
    }
  };

  const getArrowGlow = () => {
    const glowPath = getArrowPath();
    return (
      <Path
        d={glowPath}
        fill="none"
        stroke={getArrowColor()}
        strokeWidth="4"
        strokeOpacity="0.3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    );
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={getArrowColor()} stopOpacity="1" />
            <Stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
            <Stop offset="100%" stopColor={getArrowColor()} stopOpacity="0.6" />
          </LinearGradient>
        </Defs>
        
        {/* Glow effect */}
        {getArrowGlow()}
        
        {/* Main arrow */}
        <Path
          d={getArrowPath()}
          fill="url(#arrowGradient)"
          stroke={getArrowColor()}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        
        {/* Inner highlight */}
        <Path
          d={getArrowPath()}
          fill="none"
          stroke="#ffffff"
          strokeWidth="1"
          strokeOpacity="0.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
      
      {/* Instruction dots for turn around */}
      {arrowType === 'turn-around' && (
        <View style={styles.turnIndicator}>
          <View style={[styles.dot, { backgroundColor: getArrowColor() }]} />
          <View style={[styles.dot, { backgroundColor: getArrowColor() }]} />
          <View style={[styles.dot, { backgroundColor: getArrowColor() }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  turnIndicator: {
    position: 'absolute',
    top: -10,
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.8,
  },
});

export default ArrowOverlay; 