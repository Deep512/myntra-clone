export const getArray = cnt => {
  return Array(cnt)
    .fill(0)
    .map((val, idx) => idx);
};
export const getContentInsetValue = (contentDimension, widgetDimension) => {
  switch (contentDimension) {
    case 'start':
      return widgetDimension;
    case 'middle':
      return widgetDimension / 2;
    case 'end':
      return 0;
    default:
      return 0;
  }
};
