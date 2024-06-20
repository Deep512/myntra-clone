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
