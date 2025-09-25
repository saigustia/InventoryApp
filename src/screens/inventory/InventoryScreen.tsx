import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { StockItem, CategoryFilter } from '@/components';

const InventoryScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Inventory Screen - Implementation in progress</Text>
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

export default InventoryScreen;
