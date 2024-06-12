import React from 'react';
import {StyleSheet, View, ScrollView, Text} from 'react-native';
import {HEADER_HEIGHT, FOOTER_HEIGHT} from './src/constants';

export default function Page() {
  return (
    <View style={styles.app}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((val, idx) => (
          <View style={styles.content} key={idx}>
            <Text style={styles.text}>{`Container ${val}`}</Text>
          </View>
        ))}
      </ScrollView>
      <Text style={[styles.pageLevelComponents, styles.header]}>Header</Text>
      <Text style={[styles.pageLevelComponents, styles.footer]}>Footer</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    color: 'white',
  },
  contentContainer: {
    paddingTop: HEADER_HEIGHT,
    paddingBottom: FOOTER_HEIGHT,
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
  },
  header: {
    top: 0,
    height: HEADER_HEIGHT,
  },
  footer: {
    bottom: 0,
    height: FOOTER_HEIGHT,
  },
});
