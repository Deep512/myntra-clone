import React, {useRef, forwardRef, useImperativeHandle} from 'react';
import {Animated, Text, StyleSheet, PanResponder, View} from 'react-native';
import withDimensions from './src/withDimensions';
const styles = StyleSheet.create({
  absoluteFloatingComponent: {
    position: 'absolute',
  },
  floatingComponentContent: {
    backgroundColor: 'red',
    height: 100,
  },
});

const FloatingComponent = forwardRef(
  (
    {
      val,
      isDraggable,
      isScrolling,
      scrollBehaviourOffsetAnimatedValue,
      updateFloatingComponentPosition,
      handleLayoutChange,
      windowHeight,
      windowWidth,
      floatingComponentData,
      onDrop,
    },
    ref,
  ) => {
    const {animatedXY} = floatingComponentData;

    const translateBounds = useRef({
      horizontalBounds: {minX: 0, maxX: windowWidth},
      verticalBounds: {minY: 0, maxY: windowHeight},
    });

    // WIDGET LEVEL ANIMATIONS
    // const animatedWidth = useRef(isScrolling).current.interpolate({
    //   inputRange: [0, 1],
    //   outputRange: [100, 50],
    //   extrapolate: 'clamp',
    // });

    useImperativeHandle(ref, () => ({
      // DRAG AND DROP TRANSLATE BOUNDS (WIDGET and PARENT LEVEL)
      // WIDGET LEVEL: Drag and Drop
      // PARENT LEVEL: for scroll animation
      getTranslateBounds: () => {
        return translateBounds.current;
      },
      setTranslateBounds: newTranslateBounds => {
        translateBounds.current = {
          ...translateBounds.current,
          ...newTranslateBounds,
        };
      },
    }));

    // DRAG DROP PAN HANDLERS (WIDGET LEVEL)
    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) =>
          isDraggable && !isScrolling.__getValue(),
        onPanResponderGrant: (evt, gestureState) => {
          animatedXY.setOffset({
            x: animatedXY.x._value,
            y: animatedXY.y._value,
          });
        },
        onPanResponderMove: (evt, gestureState) => {
          const {horizontalBounds, verticalBounds} = translateBounds.current;
          const {minX, maxX} = horizontalBounds;
          const {minY, maxY} = verticalBounds;

          const {x, y} = animatedXY;
          let xDiff = gestureState.dx;
          let yDiff = gestureState.dy;
          const newX = x._offset + xDiff;
          const newY = y._offset + yDiff;

          if (newX < minX) {
            xDiff += minX - newX;
          } else if (newX > maxX) {
            xDiff -= newX - maxX;
          }

          if (newY < minY) {
            yDiff += minY - newY;
          } else if (newY > maxY) {
            yDiff -= newY - maxY;
          }

          animatedXY.x.setValue(xDiff);
          animatedXY.y.setValue(yDiff);
        },
        onPanResponderRelease: (evt, gestureState) => {
          animatedXY.flattenOffset();
          updateFloatingComponentPosition &&
            updateFloatingComponentPosition(val, animatedXY.__getValue());
          // onDrop &&
          //   onDrop(
          //     val,
          //     widgetX + animatedXY.x._value,
          //     widgetY + animatedXY.y._value,
          //     widgetLayoutRef.current,
          //   );
        },
      }),
    ).current;

    return (
      <View
        style={styles.absoluteFloatingComponent}
        onLayout={({nativeEvent}) => {
          handleLayoutChange && handleLayoutChange(val, nativeEvent.layout);
        }}
        {...panResponder.panHandlers}>
        <Animated.View
          key={val}
          style={[
            styles.floatingComponentContent,
            {
              transform: animatedXY.getTranslateTransform(),
              width: 100,
            },
          ]}>
          <Text>Floating Component {val}</Text>
        </Animated.View>
      </View>
    );
  },
);

export default withDimensions(FloatingComponent);
