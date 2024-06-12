import React, {useCallback, useRef, useState} from 'react';

import Page from './Page.js';
import FloatingComponent from './FloatingComponent';
import {
  FOOTER_HEIGHT,
  HEADER_HEIGHT,
  IS_DRAGGABLE,
  POSITION_RELATIVE,
} from './src/constants';
import {getArray} from './src/utils';
import {Dimensions} from 'react-native';

const NO_OF_FLOATING_COMPONENTS = 3;

type PositionData = {
  val: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

function App() {
  const {width: windowWidth, height: windowHeight} = Dimensions.get('window');

  const [headerHeight] = useState(HEADER_HEIGHT);
  const [footerHeight] = useState(FOOTER_HEIGHT);

  // Simulating header footer height changes
  // useEffect(() => {
  //   let interval;
  //   if (headerHeight > 0 || footerHeight > 0) {
  //     interval = setInterval(() => {
  //       headerHeight > 0 && setHeaderHeight(headerHeight => headerHeight - 1);
  //       footerHeight > 0 && setFooterHeight(footerHeight => footerHeight - 1);
  //     }, 10);
  //   }
  //   return () => clearInterval(interval);
  // }, [headerHeight, footerHeight]);

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
      <Page />
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
        />
      ))}
    </>
  );
}

export default App;
