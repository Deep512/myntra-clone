import React, {useState, useRef} from 'react';
import {Animated, Text, StyleSheet, PanResponder} from 'react-native';
import usePositionHook from './src/usePositionHook';
const styles = StyleSheet.create({
  floatingComponent: {
    position: 'absolute',
    top: 0,
  },
  relativeFloatingComponent: {
    backgroundColor: 'red',
    width: 100,
    height: 100,
  },
});

export default function FloatingComponent({
  val,
  positionData,
  isDraggable,
  onDrop,
  updatePositions,
  headerHeight,
  footerHeight,
  paddingTopAnimationOffset,
  paddingBottomAnimationOffset,
}) {
  const [widgetLayout, setWidgetLayout] = useState({width: 0, height: 0});
  const widgetLayoutRef = useRef({width: 0, height: 0});

  const [
    widgetX,
    widgetY,
    horizontalTranslateBounds,
    verticalTranslateBounds,
    animatedXY,
  ] = usePositionHook(
    positionData,
    widgetLayout.width,
    widgetLayout.height,
    paddingTopAnimationOffset.__getValue(),
    paddingBottomAnimationOffset.__getValue(),
  );

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => isDraggable,
      onPanResponderGrant: (evt, gestureState) => {
        animatedXY.setOffset({
          x: animatedXY.x._value,
          y: animatedXY.y._value,
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        const {minX, maxX} = horizontalTranslateBounds.current;
        const {minY, maxY} = verticalTranslateBounds.current;

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
        onDrop(
          val,
          widgetX + animatedXY.x._value,
          widgetY + animatedXY.y._value,
          widgetLayoutRef.current,
        );
      },
    }),
  ).current;

  return (
    <Animated.View
      style={[
        styles.floatingComponent,
        positionData.position === 'relative'
          ? {
              paddingTop: paddingTopAnimationOffset,
              paddingBottom: paddingBottomAnimationOffset,
            }
          : {},
      ]}
      pointerEvents={'box-none'}
      {...panResponder.panHandlers}>
      <Animated.View
        key={val}
        style={[
          styles.relativeFloatingComponent,
          {
            top:
              widgetY -
              (positionData.position === 'relative'
                ? paddingTopAnimationOffset.__getValue()
                : 0),
            left: widgetX,
          },
          {
            transform: animatedXY.getTranslateTransform(),
          },
        ]}
        onLayout={({nativeEvent}) => {
          updatePositions(nativeEvent.layout, val);
          const {width, height} = nativeEvent.layout;
          widgetLayoutRef.current = {width, height};
          setWidgetLayout({width, height});
        }}>
        <Text>Floating Component {val}</Text>
      </Animated.View>
    </Animated.View>
  );
}
