import {useMemo, useRef} from 'react';
import {Dimensions, Animated} from 'react-native';
import {getContentInsetValue} from './utils';

export default function usePositionHook(
  positionData,
  widgetWidth,
  widgetHeight,
  headerHeight,
  footerHeight,
) {
  const horizontalTranslateBounds = useRef({});
  const verticalTranslateBounds = useRef({});
  const animatedXY = useRef(new Animated.ValueXY({x: 0, y: 0})).current;
  const {width: windowWidth, height: windowHeight} = Dimensions.get('window');
  const {
    x,
    y,
    contentX,
    contentY,
    offsetX = 0,
    offsetY = 0,
    position,
  } = positionData || {};
  const isFixed = position === 'fixed';
  const widgetX = useMemo(() => {
    let value = 0;
    switch (x) {
      case 'center':
        value += windowWidth / 2;
        break;
      case 'right':
        value += windowWidth;
        break;
      default:
        break;
    }
    value -= getContentInsetValue(contentX, widgetWidth);
    value += offsetX;
    return value;
  }, [contentX, widgetWidth, x, offsetX, windowWidth]);

  horizontalTranslateBounds.current = useMemo(() => {
    let minX = -widgetX + (offsetX > 0 ? offsetX : 0),
      maxX = windowWidth - widgetX - widgetWidth + (offsetX < 0 ? offsetX : 0);
    return {minX, maxX};
  }, [windowWidth, widgetWidth, widgetX, offsetX]);

  const widgetY = useMemo(() => {
    let value = isFixed ? 0 : headerHeight;
    const effWindowHeight = isFixed
      ? windowHeight
      : windowHeight - headerHeight - footerHeight;
    switch (y) {
      case 'center':
        value += effWindowHeight / 2;
        break;
      case 'bottom':
        value += effWindowHeight;
        break;
      default:
        break;
    }
    value -= getContentInsetValue(contentY, widgetHeight);
    value += offsetY;
    return value;
  }, [
    contentY,
    widgetHeight,
    y,
    isFixed,
    offsetY,
    windowHeight,
    headerHeight,
    footerHeight,
  ]);

  verticalTranslateBounds.current = useMemo(() => {
    let minY =
        -widgetY + (isFixed ? 0 : headerHeight) + (offsetY > 0 ? offsetY : 0),
      maxY =
        windowHeight -
        widgetHeight -
        widgetY -
        (isFixed ? 0 : footerHeight) +
        (offsetY < 0 ? offsetY : 0);

    animatedXY.y.setValue(
      Math.max(minY, Math.min(animatedXY.y.__getValue(), maxY)),
    );
    return {minY, maxY};
  }, [
    windowHeight,
    widgetHeight,
    widgetY,
    headerHeight,
    footerHeight,
    offsetY,
    isFixed,
    animatedXY.y,
  ]);

  return [
    widgetX,
    widgetY,
    horizontalTranslateBounds,
    verticalTranslateBounds,
    animatedXY,
  ];
}
