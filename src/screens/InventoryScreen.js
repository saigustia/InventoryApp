import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  TextInput,
  IconButton,
  Chip,
  FAB,
  ActivityIndicator,
  Searchbar,
  Badge
} from 'react-native-paper';
import { theme } from '../theme/theme';

const InventoryScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['All', 'Ice Cream', 'Toppings', 'Fruits', 'Supplies'];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery]);

  const loadProducts = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      const mockProducts = [
        { id: 1, name: 'Vanilla Ice Cream', category: 'Ice Cream', stock: 25, minStock: 10, price: 3.50, unit: 'pints' },
        { id: 2, name: 'Chocolate Ice Cream', category: 'Ice Cream', stock: 8, minStock: 10, price: 3.50, unit: 'pints' },
        { id: 3, name: 'Strawberry Ice Cream', category: 'Ice Cream', stock: 15, minStock: 10, price: 3.50, unit: 'pints' },
        { id: 4, name: 'Mint Chocolate Chip', category: 'Ice Cream', stock: 12, minStock: 10, price: 3.75, unit: 'pints' },
        { id: 5, name: 'Chocolate Chips', category: 'Toppings', stock: 5, minStock: 8, price: 2.00, unit: 'bags' },
        { id: 6, name: 'Sprinkles', category: 'Toppings', stock: 3, minStock: 5, price: 1.50, unit: 'bottles' },
        { id: 7, name: 'Whipped Cream', category: 'Toppings', stock: 18, minStock: 10, price: 2.25, unit: 'cans' },
        { id: 8, name: 'Fresh Strawberries', category: 'Fruits', stock: 2, minStock: 5, price: 4.00, unit: 'lbs' },
        { id: 9, name: 'Bananas', category: 'Fruits', stock: 7, minStock: 5, price: 1.50, unit: 'lbs' },
        { id: 10, name: 'Waffle Cones', category: 'Supplies', stock: 45, minStock: 20, price: 0.50, unit: 'pieces' },
        { id: 11, name: 'Paper Cups', category: 'Supplies', stock: 12, minStock: 15, price: 0.25, unit: 'pieces' },
        { id: 12, name: 'Plastic Spoons', category: 'Supplies', stock: 8, minStock: 10, price: 0.10, unit: 'pieces' },
      ];
      
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const getStockStatus = (stock, minStock) => {
    if (stock <= minStock) return 'low';
    if (stock <= minStock * 1.5) return 'medium';
    return 'high';
  };

  const getStockColor = (status) => {
    switch (status) {
      case 'low': return '#F44336';
      case 'medium': return '#FF9800';
      case 'high': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const adjustStock = (productId, adjustment) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId
          ? { ...product, stock: Math.max(0, product.stock + adjustment) }
          : product
      )
    );
  };

  const ProductCard = ({ product }) => {
    const stockStatus = getStockStatus(product.stock, product.minStock);
    const stockColor = getStockColor(stockStatus);

    return (
      <Card style={[styles.productCard, { borderLeftColor: stockColor }]} elevation={2}>
        <Card.Content>
          <View style={styles.productHeader}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCategory}>{product.category}</Text>
            </View>
            <View style={styles.stockIndicator}>
              <View style={[styles.stockBar, { backgroundColor: stockColor }]} />
              <Text style={[styles.stockText, { color: stockColor }]}>
                {product.stock} {product.unit}
              </Text>
            </View>
          </View>

          <View style={styles.productDetails}>
            <Text style={styles.priceText}>${product.price.toFixed(2)}</Text>
            <Text style={styles.minStockText}>Min: {product.minStock}</Text>
          </View>

          <View style={styles.stockControls}>
            <IconButton
              icon="minus"
              size={20}
              iconColor="#F44336"
              onPress={() => adjustStock(product.id, -1)}
              style={styles.stockButton}
            />
            <Text style={styles.stockValue}>{product.stock}</Text>
            <IconButton
              icon="plus"
              size={20}
              iconColor="#4CAF50"
              onPress={() => adjustStock(product.id, 1)}
              style={styles.stockButton}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  const getCategoryCount = (category) => {
    if (category === 'All') return products.length;
    return products.filter(p => p.category === category).length;
  };

  const getLowStockCount = (category) => {
    const categoryProducts = category === 'All' 
      ? products 
      : products.filter(p => p.category === category);
    return categoryProducts.filter(p => p.stock <= p.minStock).length;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Loading Inventory...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <Searchbar
        placeholder="Search products..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => {
          const count = getCategoryCount(category);
          const lowStockCount = getLowStockCount(category);
          
          return (
            <View key={category} style={styles.categoryChip}>
              <Chip
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.chip,
                  selectedCategory === category && styles.selectedChip
                ]}
                textStyle={[
                  styles.chipText,
                  selectedCategory === category && styles.selectedChipText
                ]}
              >
                {category}
              </Chip>
              {lowStockCount > 0 && (
                <Badge style={styles.categoryBadge}>
                  {lowStockCount}
                </Badge>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Products List */}
      <ScrollView style={styles.productsContainer}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Add some products to get started'}
            </Text>
          </View>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddProduct')}
        label="Add Product"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryContent: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    position: 'relative',
    marginRight: 8,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedChip: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  chipText: {
    color: '#666666',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  categoryBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#F44336',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  productCard: {
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#666666',
  },
  stockIndicator: {
    alignItems: 'flex-end',
  },
  stockBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  minStockText: {
    fontSize: 12,
    color: '#666666',
  },
  stockControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockButton: {
    margin: 0,
  },
  stockValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976D2',
  },
});

export default InventoryScreen;
