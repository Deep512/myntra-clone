import React, {useCallback, useRef, useState, useEffect} from 'react';

import Page from './Page.js';
import FloatingComponent from './FloatingComponent';
import {
  FOOTER_HEIGHT,
  HEADER_HEIGHT,
  IS_DRAGGABLE,
  POSITION_FIXED,
  POSITION_RELATIVE,
} from './src/constants';
import {getArray} from './src/utils';
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';

const NO_OF_FLOATING_COMPONENTS = 9;

type PositionData = {
  val: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

function App() {
  const {width: windowWidth, height: windowHeight} = Dimensions.get('window');

  const [headerHeight, setHeaderHeight] = useState(HEADER_HEIGHT);
  const [footerHeight, setFooterHeight] = useState(FOOTER_HEIGHT);

  // // Simulating header footer height changes
  // const reduce = useRef(true);
  // useEffect(() => {
  //   let interval: NodeJS.Timeout;
  //   if (reduce.current && (headerHeight > 0 || footerHeight > 0)) {
  //     interval = setInterval(() => {
  //       headerHeight > 0 &&
  //         setHeaderHeight(prevHeaderHeight => prevHeaderHeight - 1);
  //       footerHeight > 0 &&
  //         setFooterHeight(prevFooterHeight => prevFooterHeight - 1);
  //       if (footerHeight === 1) {
  //         reduce.current = false;
  //       }
  //     }, 10);
  //   }
  //   return () => clearInterval(interval);
  // }, [headerHeight, footerHeight]);

  // useEffect(() => {
  //   let interval: NodeJS.Timeout;
  //   if (!reduce.current) {
  //     interval = setInterval(() => {
  //       headerHeight < HEADER_HEIGHT &&
  //         setHeaderHeight(prevHeaderHeight => prevHeaderHeight + 1);
  //       footerHeight < FOOTER_HEIGHT &&
  //         setFooterHeight(prevFooterHeight => prevFooterHeight + 1);
  //       if (footerHeight === FOOTER_HEIGHT - 1) {
  //         reduce.current = true;
  //       }
  //     }, 10);
  //   }
  //   return () => clearInterval(interval);
  // }, [headerHeight, footerHeight]);

  const _lastOffsetY = useRef(0);
  const _scrollDirection = useRef<string>();
  const _scrollBehaviourOffset = useRef(0);
  const _scrollBehaviourOffsetPrevious = useRef(0);
  const _scrollBehaviourOffsetAnimatedValue = useRef(
    new Animated.Value(0),
  ).current;

  const scrollBehvavioutOffsetInterpolation = useRef(
    _scrollBehaviourOffsetAnimatedValue,
  ).current.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerAnimationOffset = scrollBehvavioutOffsetInterpolation.interpolate(
    {
      inputRange: [0, 1],
      outputRange: [0, -HEADER_HEIGHT],
      extrapolate: 'clamp',
    },
  );
  const footerAnimationOffset = scrollBehvavioutOffsetInterpolation.interpolate(
    {
      inputRange: [0, 1],
      outputRange: [0, FOOTER_HEIGHT],
      extrapolate: 'clamp',
    },
  );

  const paddingTopAnimationOffset = headerAnimationOffset.interpolate({
    inputRange: [-HEADER_HEIGHT, 0],
    outputRange: [0, HEADER_HEIGHT],
    extrapolate: 'clamp',
  });

  const paddingBottomAnimationOffset = footerAnimationOffset.interpolate({
    inputRange: [0, FOOTER_HEIGHT],
    outputRange: [FOOTER_HEIGHT, 0],
    extrapolate: 'clamp',
  });

  const _notifyOffSetStateChange = (): void => {
    if (
      _scrollBehaviourOffset.current === 0 ||
      _scrollBehaviourOffset.current === 1
    ) {
      if (
        _scrollBehaviourOffsetPrevious.current !==
        _scrollBehaviourOffset.current
      ) {
        _scrollBehaviourOffsetPrevious.current = _scrollBehaviourOffset.current;
      }
    }
  };

  const _setBehaviourOffset = (nextOffset: number): void => {
    _scrollBehaviourOffset.current =
      nextOffset > 1 ? 1 : nextOffset < 0 ? 0 : nextOffset;
    _scrollBehaviourOffsetAnimatedValue.setValue(
      _scrollBehaviourOffset.current,
    );
    _notifyOffSetStateChange();
  };

  const handleOnScroll = (
    event?: NativeSyntheticEvent<NativeScrollEvent>,
  ): void => {
    if (event) {
      const nextY: number = event.nativeEvent.contentOffset.y;
      const delta =
        (nextY - _lastOffsetY.current) / (FOOTER_HEIGHT + HEADER_HEIGHT);
      _scrollDirection.current =
        delta > 0 ? 'down' : delta < 0 ? 'up' : _scrollDirection.current;
      const nextOffset = _scrollBehaviourOffset.current + delta;
      _setBehaviourOffset(nextOffset);
      _lastOffsetY.current = nextY;
    }
  };

  const positionsRef = useRef<PositionData[]>(
    getArray(NO_OF_FLOATING_COMPONENTS).map(val => ({
      val,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
    })),
  );

  const updatePositions = useCallback((layout: PositionData, val: number) => {
    positionsRef.current = positionsRef.current.map(pos =>
      pos.val === val ? {...pos, ...layout} : pos,
    );
  }, []);

  const checkIntersection = useCallback(
    ({val, x, y, width: widgetWidth, height: widgetHeight}: PositionData) => {
      for (let pos of positionsRef.current) {
        if (
          pos.val !== val &&
          x < pos.x + pos.width &&
          x + widgetWidth > pos.x &&
          y < pos.y + pos.height &&
          y + widgetHeight > pos.y
        ) {
          return true;
        }
      }
      return false;
    },
    [positionsRef],
  );

  const findNearestNonIntersectingPosition = useCallback(
    ({val, x, y, width: widgetWidth, height: widgetHeight}: PositionData) => {
      let newX = x;
      let newY = y;

      while (
        checkIntersection({
          val,
          x: newX,
          y: newY,
          width: widgetWidth,
          height: widgetHeight,
        })
      ) {
        newX += 10; // Adjust the step size as needed
        if (newX + widgetWidth > windowWidth) {
          newX = 0;
          newY += 10;
        }
        if (newY + widgetHeight > windowHeight) {
          break; // Fallback to avoid infinite loop
        }
      }

      return {x: newX, y: newY};
    },
    [checkIntersection, windowHeight, windowWidth],
  );

  const handleDrop = useCallback(
    ({val, x, y, width, height}: PositionData) => {
      if (checkIntersection({val, x, y, width, height})) {
        const newPos = findNearestNonIntersectingPosition({
          val,
          x,
          y,
          width,
          height,
        });
        const newPosArray = positionsRef.current.map(pos =>
          pos.val === val ? {...pos, x: newPos.x, y: newPos.y} : pos,
        );
        positionsRef.current = newPosArray;
      } else {
        const newPosArray = positionsRef.current.map(pos =>
          pos.val === val ? {...pos, x, y} : pos,
        );
        positionsRef.current = newPosArray;
      }
    },
    [checkIntersection, findNearestNonIntersectingPosition, positionsRef],
  );
  return (
    <>
      <Page
        headerHeight={headerHeight}
        footerHeight={footerHeight}
        headerAnimationOffset={headerAnimationOffset}
        footerAnimationOffset={footerAnimationOffset}
        paddingTopAnimationOffset={paddingTopAnimationOffset}
        paddingBottomAnimationOffset={paddingBottomAnimationOffset}
        handleOnScroll={handleOnScroll}
      />
      {getArray(NO_OF_FLOATING_COMPONENTS).map((val, idx) => (
        <FloatingComponent
          key={val}
          val={val}
          isDraggable={IS_DRAGGABLE}
          positionData={POSITION_RELATIVE[idx]}
          onDrop={handleDrop}
          updatePositions={updatePositions}
          headerHeight={headerHeight}
          footerHeight={footerHeight}
          paddingTopAnimationOffset={paddingTopAnimationOffset}
          paddingBottomAnimationOffset={paddingBottomAnimationOffset}
        />
      ))}
    </>
  );
}

export default App;
