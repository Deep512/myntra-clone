export const getArray = cnt => {
  return Array.from(Array(cnt).keys());
};

export const getWidgetX = (positionData, widgetWidth, windowWidth) => {
  const {x, contentX} = positionData;

  let value = (x / 100) * windowWidth - (contentX / 100) * widgetWidth;
  let minX = 0,
    maxX = windowWidth - widgetWidth;
  return {widgetX: value, horizontalBounds: {minX, maxX}};
};

export const getWidgetY = (
  positionData,
  widgetHeight,
  windowHeight,
  headerHeight,
  footerHeight,
) => {
  const {position, y, contentY} = positionData;
  const isFixed = position === 'fixed';
  let value = isFixed ? 0 : headerHeight;
  const effWindowHeight = isFixed
    ? windowHeight
    : windowHeight - headerHeight - footerHeight;
  value += effWindowHeight * (y / 100) - (contentY / 100) * widgetHeight;

  let minY = isFixed ? 0 : headerHeight,
    maxY = windowHeight - widgetHeight - (isFixed ? 0 : footerHeight);

  return {widgetY: value, verticalBounds: {minY, maxY}};
};

export const getVerticalBounds = (
  {isFixed},
  widgetHeight,
  headerHeight,
  footerHeight,
  windowHeight,
) => {
  let minY = isFixed ? 0 : headerHeight,
    maxY = windowHeight - widgetHeight - (isFixed ? 0 : footerHeight);
  return {minY, maxY};
};

export const getHorizontalBounds = (widgetWidth, windowWidth) => {
  let minX = 0,
    maxX = windowWidth - widgetWidth;
  return {minX, maxX};
};
