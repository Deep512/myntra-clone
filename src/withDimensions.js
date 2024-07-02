import React, {forwardRef} from 'react';
import {Dimensions} from 'react-native';

export default function withDimensions(WrappedComponent) {
  const {width, height} = Dimensions.get('window');
  const dimensionProps = {windowWidth: width, windowHeight: height};
  function WithDimensions(props, ref) {
    return <WrappedComponent ref={ref} {...props} {...dimensionProps} />;
  }
  const displayName = WrappedComponent.displayName || WrappedComponent.name;
  WithDimensions.displayName = `withDimensions(${displayName})`;
  return forwardRef(WithDimensions);
}
