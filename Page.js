import React, {useMemo} from 'react';
import {StyleSheet, View, ScrollView, Text, Animated} from 'react-native';
import {getArray} from './src/utils';

export default function Page({
  headerHeight,
  footerHeight,
  handleOnScroll,
  handleScrollEnd,
  headerAnimationOffset,
  footerAnimationOffset,
}) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        app: {
          flex: 1,
          color: 'lightgray',
        },
        contentContainer: {
          paddingTop: headerHeight,
          paddingBottom: footerHeight,
        },
        content: {
          height: 100,
          borderWidth: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        pageLevelComponents: {
          position: 'absolute',
          left: 0,
          right: 0,
          overflow: 'hidden',
          borderWidth: 1,
          backgroundColor: 'yellow',
          justifyContent: 'center',
          alignItems: 'center',
        },
        header: {
          top: 0,
          height: headerHeight,
        },
        footer: {
          bottom: 0,
          height: footerHeight,
        },
        headerText: {fontSize: 20, marginTop: 40},
        footerText: {
          fontSize: 20,
        },
      }),
    [footerHeight, headerHeight],
  );

  const contentContainerStyle = {
    paddingTop: headerHeight,
    paddingBottom: 0,
  };
  return (
    <View style={styles.app}>
      <ScrollView
        contentContainerStyle={contentContainerStyle}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        onScroll={handleOnScroll}>
        {getArray(20).map((val, idx) => (
          <View style={styles.content} key={idx}>
            <Text style={styles.text}>{`Container ${val}`}</Text>
          </View>
        ))}
      </ScrollView>

      <Animated.View
        style={[
          styles.pageLevelComponents,
          styles.header,
          {transform: [{translateY: headerAnimationOffset}]},
        ]}>
        <Text style={styles.headerText}>Header</Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.pageLevelComponents,
          styles.footer,
          {transform: [{translateY: footerAnimationOffset}]},
        ]}>
        <Text style={styles.footerText}>Footer</Text>
      </Animated.View>
    </View>
  );
}
