export const getArray = cnt => {
  return Array.from(Array(cnt).keys());
};
export const getContentInsetValue = (contentDimension, widgetDimension) => {
  switch (contentDimension) {
    case 'start':
      return 0;
    case 'middle':
      return widgetDimension / 2;
    case 'end':
      return widgetDimension;
    default:
      return 0;
  }
};

export const getWidgetX = (positionData, widgetWidth, windowWidth) => {
  const {x, contentX, offsetX = 0} = positionData;

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
  let minX = offsetX > 0 ? offsetX : 0,
    maxX = windowWidth - widgetWidth + (offsetX < 0 ? offsetX : 0);
  return {widgetX: value, horizontalBounds: {minX, maxX}};
};

export const getWidgetY = (
  positionData,
  widgetHeight,
  windowHeight,
  headerHeight,
  footerHeight,
) => {
  const {position, y, contentY, offsetY = 0} = positionData;
  const isFixed = position === 'fixed';
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
  let minY = (isFixed ? 0 : headerHeight) + (offsetY > 0 ? offsetY : 0),
    maxY =
      windowHeight -
      widgetHeight -
      (isFixed ? 0 : footerHeight) +
      (offsetY < 0 ? offsetY : 0);

  return {widgetY: value, verticalBounds: {minY, maxY}};
};

export const getVerticalBounds = (
  {isFixed, offsetY},
  widgetHeight,
  headerHeight,
  footerHeight,
  windowHeight,
) => {
  let minY = (isFixed ? 0 : headerHeight) + (offsetY > 0 ? offsetY : 0),
    maxY =
      windowHeight -
      widgetHeight -
      (isFixed ? 0 : footerHeight) +
      (offsetY < 0 ? offsetY : 0);
  return {minY, maxY};
};

export const getHorizontalBounds = ({offsetX}, widgetWidth, windowWidth) => {
  let minX = offsetX > 0 ? offsetX : 0,
    maxX = windowWidth - widgetWidth + (offsetX < 0 ? offsetX : 0);
  return {minX, maxX};
};
