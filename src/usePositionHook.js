import {useMemo} from 'react';
import {Dimensions} from 'react-native';
// import {HEADER_HEIGHT, FOOTER_HEIGHT} from './constants';
import {getContentInsetValue} from './utils';

export default function usePositionHook(
  positionData,
  widgetWidth,
  widgetHeight,
  headerHeight,
  footerHeight,
) {
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
  return [widgetX, widgetY];
}
