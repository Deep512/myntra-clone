import React, {useState, useRef} from 'react';
import {View, Animated, Text, StyleSheet, PanResponder} from 'react-native';
import usePositionHook from './src/usePositionHook';
const styles = StyleSheet.create({
  floatingComponent: {
    position: 'absolute',
    top: 0,
  },
  relativeFloatingComponent: {
    position: 'absolute',
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
}) {
  const [widgetLayout, setWidgetLayout] = useState({width: 0, height: 0});
  const widgetLayoutRef = useRef({width: 0, height: 0});
  const animatedXY = useRef(new Animated.ValueXY({x: 0, y: 0})).current;
  const [widgetX, widgetY] = usePositionHook(
    positionData,
    widgetLayout.width,
    widgetLayout.height,
    headerHeight,
    footerHeight,
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
      onPanResponderMove: Animated.event(
        [null, {dx: animatedXY.x, dy: animatedXY.y}],
        {useNativeDriver: false},
      ),
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
    <View
      style={styles.floatingComponent}
      pointerEvents={'box-none'}
      {...panResponder.panHandlers}>
      <Animated.View
        key={val}
        style={[
          styles.relativeFloatingComponent,
          {
            top: widgetY,
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
    </View>
  );
}
