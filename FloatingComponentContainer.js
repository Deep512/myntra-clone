import React, {forwardRef, useRef, useImperativeHandle} from 'react';
import {View, StyleSheet} from 'react-native';
import {getArray} from './src/utils';
import FloatingComponent from './FloatingComponent';
import {
  FOOTER_HEIGHT,
  HEADER_HEIGHT,
  IS_DRAGGABLE,
  POSITION_FIXED,
  POSITION_RELATIVE,
} from './src/constants';
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

const FloatingComponentContainer = forwardRef(
  ({headerHeight, footerHeight, scrollBehaviourOffsetAnimatedValue}, ref) => {
    const floatingComponentRef = useRef([]);

    useImperativeHandle(ref, () => ({
      startDragDrop: () => {
        floatingComponentRef.current?.forEach(floatingCompRef => {
          floatingCompRef.startDragDrop();
        });
      },
      stopDragDrop: () => {
        floatingComponentRef.current?.forEach(floatingCompRef => {
          floatingCompRef.stopDragDrop();
        });
      },
      updateAnimatedValue: (
        headerHeightAnimationOffset,
        footerHeightAnimationOffset,
      ) => {
        floatingComponentRef.current?.forEach(floatingCompRef => {
          floatingCompRef.updateAnimatedValue(
            headerHeightAnimationOffset,
            footerHeightAnimationOffset,
          );
        });
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
          positionData={POSITION_RELATIVE[idx]}
          // onDrop={handleDrop}
          // updatePositions={updatePositions}
          headerHeight={headerHeight}
          footerHeight={footerHeight}
          scrollBehaviourOffsetAnimatedValue={
            scrollBehaviourOffsetAnimatedValue
          }
        />
      </View>
    ));
  },
);

export default FloatingComponentContainer;
