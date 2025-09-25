import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { ProductGrid, ShoppingCart } from '@/components';

const SalesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Sales Screen - Implementation in progress</Text>
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

export default SalesScreen;
