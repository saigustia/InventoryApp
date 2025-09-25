import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const ReceiptScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Receipt Screen - Implementation in progress</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReceiptScreen;
