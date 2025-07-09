import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';

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
    return '#2196F3'; // Blue for normal navigation
  };

  const renderStraightArrow = () => {
    const centerX = size / 2;
    const arrowWidth = 12;
    const arrowHeadWidth = 20;
    const arrowHeadHeight = 16;
    
    return (
      <>
        {/* Arrow shaft */}
        <Polygon
          points={`
            ${centerX - arrowWidth/2},${size - 10}
            ${centerX + arrowWidth/2},${size - 10}
            ${centerX + arrowWidth/2},${arrowHeadHeight + 5}
            ${centerX - arrowWidth/2},${arrowHeadHeight + 5}
          `}
          fill={getArrowColor()}
          stroke="#ffffff"
          strokeWidth="2"
        />
        
        {/* Arrow head */}
        <Polygon
          points={`
            ${centerX - arrowHeadWidth/2},${arrowHeadHeight + 5}
            ${centerX + arrowHeadWidth/2},${arrowHeadHeight + 5}
            ${centerX},5
          `}
          fill={getArrowColor()}
          stroke="#ffffff"
          strokeWidth="2"
        />
      </>
    );
  };

  const renderCurvedArrow = (isRight: boolean) => {
    const centerX = size / 2;
    const curveRadius = 25;
    const arrowWidth = 10;
    
    const direction = isRight ? 1 : -1;
    const startX = centerX;
    const endX = centerX + (direction * curveRadius);
    
    return (
      <>
        {/* Curved path */}
        <Path
          d={`
            M ${startX} ${size - 10}
            Q ${startX + (direction * curveRadius/2)} ${size - 30}
              ${endX} ${size/2}
            Q ${endX + (direction * 10)} ${size/2 - 15}
              ${endX + (direction * 15)} ${size/2 - 5}
          `}
          fill="none"
          stroke={getArrowColor()}
          strokeWidth={arrowWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Arrow head at end */}
        <Polygon
          points={`
            ${endX + (direction * 5)},${size/2 - 15}
            ${endX + (direction * 25)},${size/2 - 5}
            ${endX + (direction * 5)},${size/2 + 5}
          `}
          fill={getArrowColor()}
          stroke="#ffffff"
          strokeWidth="1"
        />
      </>
    );
  };

  const renderTurnAroundArrow = () => {
    const centerX = size / 2;
    const radius = 20;
    
    return (
      <>
        {/* U-turn path */}
        <Path
          d={`
            M ${centerX} ${size - 10}
            L ${centerX} ${centerX + 10}
            Q ${centerX} ${centerX - radius} ${centerX + radius} ${centerX - radius}
            Q ${centerX + radius*2} ${centerX - radius} ${centerX + radius*2} ${centerX + 10}
            L ${centerX + radius*2} ${size - 20}
          `}
          fill="none"
          stroke={getArrowColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Arrow head */}
        <Polygon
          points={`
            ${centerX + radius*2 - 8},${size - 25}
            ${centerX + radius*2 + 8},${size - 25}
            ${centerX + radius*2},${size - 10}
          `}
          fill={getArrowColor()}
          stroke="#ffffff"
          strokeWidth="1"
        />
        
        {/* Turn indicator dots */}
        <View style={styles.turnDots}>
          <View style={[styles.dot, { backgroundColor: getArrowColor() }]} />
          <View style={[styles.dot, { backgroundColor: getArrowColor() }]} />
          <View style={[styles.dot, { backgroundColor: getArrowColor() }]} />
        </View>
      </>
    );
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arrowType === 'straight' && renderStraightArrow()}
        {arrowType === 'curved-right' && renderCurvedArrow(true)}
        {arrowType === 'curved-left' && renderCurvedArrow(false)}
        {arrowType === 'turn-around' && renderTurnAroundArrow()}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    // Remove shadow effects that can cause blurriness
  },
  turnDots: {
    position: 'absolute',
    top: 5,
    left: '50%',
    marginLeft: -15,
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default ArrowOverlay; 