import React, {forwardRef, useRef, useImperativeHandle} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {
  getArray,
  getHorizontalBounds,
  getWidgetX,
  getWidgetY,
} from './src/utils';
import FloatingComponent from './FloatingComponent';
import {IS_DRAGGABLE, POSITION_FIXED, POSITION_RELATIVE} from './src/constants';
import {getVerticalBounds} from './src/utils';
import withDimensions from './src/withDimensions';
const NO_OF_FLOATING_COMPONENTS = 9;
const styles = StyleSheet.create({
  floatingComponentContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

const POSITION_DATA = POSITION_RELATIVE;

const FloatingComponentContainer = forwardRef(
  (
    {
      headerHeight,
      footerHeight,
      scrollBehaviourOffsetAnimatedValue,
      windowHeight,
      windowWidth,
      isScrolling,
    },
    ref,
  ) => {
    const floatingComponentRef = useRef([]);
    const headerHeightRef = useRef(headerHeight);
    const footerHeightRef = useRef(footerHeight);

    const floatingComponentData = useRef(
      Array.from({length: NO_OF_FLOATING_COMPONENTS}, () => ({
        isFirstLayout: true,
        layout: {x: 0, y: 0, height: 0, width: 0},
        animatedXY: new Animated.ValueXY({x: 0, y: 0}),
      })),
    );

    const updateFloatingComponentPosition = (idx, layout) => {
      floatingComponentData.current[idx] = {
        ...floatingComponentData.current[idx],
        layout: {
          ...floatingComponentData.current[idx].layout,
          ...layout,
        },
      };
    };

    const recalculateFloatingComponentPosition = idx => {
      const translateBounds =
        floatingComponentRef.current[idx]?.getTranslateBounds();
      const newAnimatedX = Math.max(
        translateBounds.horizontalBounds.minX,
        Math.min(
          floatingComponentData.current[idx].animatedXY.__getValue().x,
          translateBounds.horizontalBounds.maxX,
        ),
      );
      const newAnimatedY = Math.max(
        translateBounds.verticalBounds.minY,
        Math.min(
          floatingComponentData.current[idx].animatedXY.__getValue().y,
          translateBounds.verticalBounds.maxY,
        ),
      );

      floatingComponentData.current[idx].animatedXY.setValue({
        x: newAnimatedX,
        y: newAnimatedY,
      });
      updateFloatingComponentPosition(idx, {
        x: newAnimatedX,
        y: newAnimatedY,
      });
    };

    const handleLayoutChange = (idx, layout) => {
      const {width, height} = layout;
      if (floatingComponentData.current[idx].isFirstLayout) {
        floatingComponentData.current[idx].isFirstLayout = false;
        const {widgetX, horizontalBounds} = getWidgetX(
          POSITION_DATA[idx],
          width,
          windowWidth,
        );
        const {widgetY, verticalBounds} = getWidgetY(
          POSITION_DATA[idx],
          height,
          windowHeight,
          headerHeight,
          footerHeight,
        );
        floatingComponentData.current[idx].animatedXY.setValue({
          x: widgetX,
          y: widgetY,
        });
        floatingComponentRef.current[idx]?.setTranslateBounds({
          horizontalBounds,
          verticalBounds,
        });
        updateFloatingComponentPosition(idx, {
          ...layout,
          x: widgetX,
          y: widgetY,
        });
      } else {
        let translateBounds =
          floatingComponentRef.current[idx]?.getTranslateBounds();
        if (width !== floatingComponentData.current[idx].layout.width) {
          const horizontalBounds = getHorizontalBounds(width, windowWidth);
          translateBounds = {...translateBounds, horizontalBounds};
        }
        if (height !== floatingComponentData.current[idx].layout.height) {
          const verticalBounds = getVerticalBounds(
            POSITION_DATA[idx].isRelative,
            height,
            headerHeightRef.current,
            footerHeightRef.current,
            windowHeight,
          );
          translateBounds = {...translateBounds, verticalBounds};
        }
        floatingComponentRef.current[idx]?.setTranslateBounds(translateBounds);
        updateFloatingComponentPosition(idx, {
          width,
          height,
        });
        recalculateFloatingComponentPosition(idx);
      }
    };

    useImperativeHandle(ref, () => ({
      updateAnimatedValue: (
        headerHeightAnimationOffset,
        footerHeightAnimationOffset,
      ) => {
        POSITION_DATA === POSITION_RELATIVE &&
          floatingComponentRef.current.forEach((_, idx) => {
            const positionData = POSITION_DATA[idx];

            const newTranslateDiff = (() => {
              const headerOffset =
                headerHeightAnimationOffset.__getValue() -
                headerHeightRef.current;
              const footerOffset =
                footerHeightAnimationOffset.__getValue() -
                footerHeightRef.current;

              const normalizedY = positionData.y / 100;
              const interpolatedValue =
                headerOffset * (1 - normalizedY) - footerOffset * normalizedY;

              return interpolatedValue;
            })();

            const newVerticalBounds = getVerticalBounds(
              positionData.isRelative,
              floatingComponentData.current[idx].layout.height,
              headerHeightAnimationOffset.__getValue(),
              footerHeightAnimationOffset.__getValue(),
              windowHeight,
            );
            floatingComponentRef.current[idx]?.setTranslateBounds({
              verticalBounds: newVerticalBounds,
            });

            const newAnimatedY = Math.max(
              newVerticalBounds.minY,
              Math.min(
                floatingComponentData.current[idx].animatedXY.__getValue().y +
                  newTranslateDiff,
                newVerticalBounds.maxY,
              ),
            );

            floatingComponentData.current[idx].animatedXY.y.setValue(
              newAnimatedY,
            );

            updateFloatingComponentPosition(idx, {
              y: newAnimatedY,
            });
          });
        headerHeightRef.current = headerHeightAnimationOffset.__getValue();
        footerHeightRef.current = footerHeightAnimationOffset.__getValue();
      },
    }));

    return getArray(NO_OF_FLOATING_COMPONENTS).map((val, idx) => (
      <View
        key={idx}
        style={styles.floatingComponentContainer}
        pointerEvents={'box-none'}>
        <FloatingComponent
          ref={el => (floatingComponentRef.current[idx] = el)}
          key={val}
          val={val}
          isDraggable={IS_DRAGGABLE}
          isScrolling={isScrolling}
          positionData={POSITION_DATA[idx]}
          headerHeight={headerHeight}
          footerHeight={footerHeight}
          scrollBehaviourOffsetAnimatedValue={
            scrollBehaviourOffsetAnimatedValue
          }
          floatingComponentData={floatingComponentData.current[idx]}
          updateFloatingComponentPosition={updateFloatingComponentPosition}
          handleLayoutChange={handleLayoutChange}
          // onDrop={handleDrop}
        />
      </View>
    ));
  },
);

export default withDimensions(FloatingComponentContainer);
