import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Card } from '../common/Card';

export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  image: string;
}

export interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  numColumns?: number;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onAddToCart,
  numColumns = 2,
}) => {
  const renderProduct = ({ item }: { item: Product }) => (
    <Card style={styles.productCard}>
      <View style={styles.productContent}>
        <View style={styles.productImage}>
          <Text style={styles.productEmoji}>{item.image}</Text>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          <Text style={styles.stockText}>Stock: {item.stock}</Text>
        </View>
        <Button
          mode="contained"
          onPress={() => onAddToCart(item)}
          style={styles.addButton}
          compact
        >
          Add
        </Button>
      </View>
    </Card>
  );

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      key={numColumns} // Force re-render when numColumns changes
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    margin: 4,
    maxWidth: '48%',
  },
  productContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productEmoji: {
    fontSize: 30,
  },
  productInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  stockText: {
    fontSize: 12,
    color: '#999999',
  },
  addButton: {
    minHeight: 32,
  },
});
