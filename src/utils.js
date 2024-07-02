export const getArray = cnt => {
  return Array.from(Array(cnt).keys());
};

export const getWidgetX = (positionData, widgetWidth, windowWidth) => {
  const {x, contentX} = positionData;

  let value = (x / 100) * windowWidth - (contentX / 100) * widgetWidth;
  const horizontalBounds = getHorizontalBounds(widgetWidth, windowWidth);
  return {widgetX: value, horizontalBounds};
};

export const getWidgetY = (
  positionData,
  widgetHeight,
  windowHeight,
  headerHeight,
  footerHeight,
) => {
  const {isRelative, y, contentY} = positionData;
  let value = isRelative ? headerHeight : 0;
  const effWindowHeight = isRelative
    ? windowHeight - headerHeight - footerHeight
    : windowHeight;
  value += effWindowHeight * (y / 100) - (contentY / 100) * widgetHeight;

  const verticalBounds = getVerticalBounds(
    isRelative,
    widgetHeight,
    headerHeight,
    footerHeight,
    windowHeight,
  );

  return {widgetY: value, verticalBounds};
};

export const getVerticalBounds = (
  isRelative,
  widgetHeight,
  headerHeight,
  footerHeight,
  windowHeight,
) => {
  let minY = isRelative ? headerHeight : 0,
    maxY = windowHeight - widgetHeight - (isRelative ? footerHeight : 0);
  return {minY, maxY};
};

export const getHorizontalBounds = (widgetWidth, windowWidth) => {
  let minX = 0,
    maxX = windowWidth - widgetWidth;
  return {minX, maxX};
};
