import React, {useRef, forwardRef, useImperativeHandle} from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  PanResponder,
  View,
  Dimensions,
} from 'react-native';
import {getVerticalBounds, getWidgetX, getWidgetY} from './src/utils';
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
      positionData,
      isDraggable,
      onDrop,
      updatePositions,
      headerHeight,
      footerHeight,
      scrollBehaviourOffsetAnimatedValue,
    },
    ref,
  ) => {
    const horizontalTranslateBounds = useRef({minX: 0, maxY: 0});
    const verticalTranslateBounds = useRef({minX: 0, maxY: 0});
    const widgetLayoutRef = useRef({width: 0, height: 0});
    const isFirstRef = useRef(true);

    const {width: windowWidth, height: windowHeight} = Dimensions.get('window');
    const animatedXY = useRef(new Animated.ValueXY({x: 0, y: 0})).current;
    const animatedWidth = useRef(
      scrollBehaviourOffsetAnimatedValue,
    ).current.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 50],
      extrapolate: 'clamp',
    });

    const headerHeightRef = useRef(headerHeight);
    const footerHeightRef = useRef(footerHeight);
    const dragDropRef = useRef(isDraggable);

    useImperativeHandle(ref, () => ({
      startDragDrop: () => {
        dragDropRef.current = true;
      },
      stopDragDrop: () => {
        dragDropRef.current = false;
      },
      updateAnimatedValue: (
        headerHeightAnimatedValue,
        footerHeightAnimatedValue,
      ) => {
        const newTranslateDiff =
          positionData.y === 'top'
            ? headerHeightAnimatedValue.__getValue() - headerHeightRef.current
            : positionData.y === 'center'
            ? headerHeightAnimatedValue.__getValue() -
              headerHeightRef.current -
              (footerHeightAnimatedValue.__getValue() - footerHeightRef.current)
            : -(
                footerHeightAnimatedValue.__getValue() - footerHeightRef.current
              );

        headerHeightRef.current = headerHeightAnimatedValue.__getValue();
        footerHeightRef.current = footerHeightAnimatedValue.__getValue();

        verticalTranslateBounds.current = getVerticalBounds(
          positionData,
          widgetLayoutRef.current.height,
          headerHeightRef.current,
          footerHeightRef.current,
          windowHeight,
        );
        const newAnimatedY = Math.max(
          verticalTranslateBounds.current.minY,
          Math.min(
            animatedXY.__getValue().y + newTranslateDiff,
            verticalTranslateBounds.current.maxY,
          ),
        );

        animatedXY.y.setValue(newAnimatedY);
      },
    }));

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) =>
          isDraggable && dragDropRef.current,
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
      <Animated.View
        style={styles.absoluteFloatingComponent}
        {...panResponder.panHandlers}>
        <Animated.View
          key={val}
          style={[
            styles.floatingComponentContent,

            {
              transform: animatedXY.getTranslateTransform(),
              width: animatedWidth,
            },
          ]}
          onLayout={({nativeEvent}) => {
            if (!isFirstRef.current) return;
            const {width, height} = nativeEvent.layout;
            const {widgetX, horizontalBounds} = getWidgetX(
              positionData,
              width,
              windowWidth,
            );
            const {widgetY, verticalBounds} = getWidgetY(
              positionData,
              height,
              windowHeight,
              headerHeight,
              footerHeight,
            );
            animatedXY.x.setValue(widgetX);
            animatedXY.y.setValue(widgetY);

            widgetLayoutRef.current = {width, height};

            horizontalTranslateBounds.current = horizontalBounds;
            verticalTranslateBounds.current = verticalBounds;
            isFirstRef.current = false;
          }}>
          <Text>Floating Component {val}</Text>
        </Animated.View>
      </Animated.View>
    );
  },
);

export default FloatingComponent;
