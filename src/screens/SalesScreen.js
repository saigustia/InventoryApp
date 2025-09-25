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
  SegmentedButtons,
  Divider
} from 'react-native-paper';

const SalesScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const categories = ['All', 'Ice Cream', 'Toppings', 'Fruits', 'Supplies'];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    // Mock data for demonstration
    const mockProducts = [
      { id: 1, name: 'Vanilla Ice Cream', category: 'Ice Cream', stock: 25, price: 3.50, image: '🍦' },
      { id: 2, name: 'Chocolate Ice Cream', category: 'Ice Cream', stock: 8, price: 3.50, image: '🍫' },
      { id: 3, name: 'Strawberry Ice Cream', category: 'Ice Cream', stock: 15, price: 3.50, image: '🍓' },
      { id: 4, name: 'Mint Chocolate Chip', category: 'Ice Cream', stock: 12, price: 3.75, image: '🌿' },
      { id: 5, name: 'Chocolate Chips', category: 'Toppings', stock: 5, price: 2.00, image: '🍫' },
      { id: 6, name: 'Sprinkles', category: 'Toppings', stock: 3, price: 1.50, image: '✨' },
      { id: 7, name: 'Whipped Cream', category: 'Toppings', stock: 18, price: 2.25, image: '☁️' },
      { id: 8, name: 'Fresh Strawberries', category: 'Fruits', stock: 2, price: 4.00, image: '🍓' },
      { id: 9, name: 'Bananas', category: 'Fruits', stock: 7, price: 1.50, image: '🍌' },
      { id: 10, name: 'Waffle Cones', category: 'Supplies', stock: 45, price: 0.50, image: '🧇' },
      { id: 11, name: 'Paper Cups', category: 'Supplies', stock: 12, price: 0.25, image: '🥤' },
      { id: 12, name: 'Plastic Spoons', category: 'Supplies', stock: 8, price: 0.10, image: '🥄' },
    ];
    
    setProducts(mockProducts);
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && product.stock > 0;
  });

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        Alert.alert('Error', 'Not enough stock available');
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (newQuantity > product.stock) {
      Alert.alert('Error', 'Not enough stock available');
      return;
    }

    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTax = () => {
    return getTotal() * 0.08; // 8% tax
  };

  const getGrandTotal = () => {
    return getTotal() + getTax();
  };

  const processSale = async () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Please add items to cart');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update stock levels
      setProducts(prevProducts =>
        prevProducts.map(product => {
          const cartItem = cart.find(item => item.id === product.id);
          if (cartItem) {
            return { ...product, stock: product.stock - cartItem.quantity };
          }
          return product;
        })
      );

      // Clear cart
      setCart([]);
      setCustomerName('');

      Alert.alert(
        'Sale Complete!',
        `Total: $${getGrandTotal().toFixed(2)}\nPayment: ${paymentMethod.toUpperCase()}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process sale. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const ProductCard = ({ product }) => (
    <Card style={styles.productCard} elevation={2}>
      <Card.Content style={styles.productContent}>
        <View style={styles.productImage}>
          <Text style={styles.productEmoji}>{product.image}</Text>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          <Text style={styles.stockText}>Stock: {product.stock}</Text>
        </View>
        <Button
          mode="contained"
          onPress={() => addToCart(product)}
          style={styles.addButton}
          compact
        >
          Add
        </Button>
      </Card.Content>
    </Card>
  );

  const CartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>${item.price.toFixed(2)} each</Text>
      </View>
      <View style={styles.cartItemControls}>
        <IconButton
          icon="minus"
          size={20}
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
        />
        <Text style={styles.cartItemQuantity}>{item.quantity}</Text>
        <IconButton
          icon="plus"
          size={20}
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
        />
        <IconButton
          icon="delete"
          size={20}
          iconColor="#F44336"
          onPress={() => removeFromCart(item.id)}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search and Category Filter */}
      <View style={styles.filterContainer}>
        <Searchbar
          placeholder="Search products..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
        >
          {categories.map((category) => (
            <Chip
              key={category}
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
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {/* Products Grid */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Products</Text>
          <ScrollView style={styles.productsContainer}>
            <View style={styles.productsGrid}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Cart Section */}
        <View style={styles.cartSection}>
          <Text style={styles.sectionTitle}>Cart ({cart.length})</Text>
          
          {cart.length === 0 ? (
            <Card style={styles.emptyCartCard}>
              <Card.Content style={styles.emptyCartContent}>
                <Text style={styles.emptyCartText}>No items in cart</Text>
                <Text style={styles.emptyCartSubtext}>Add products to get started</Text>
              </Card.Content>
            </Card>
          ) : (
            <ScrollView style={styles.cartContainer}>
              {cart.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </ScrollView>
          )}

          {/* Order Summary */}
          {cart.length > 0 && (
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text style={styles.summaryTitle}>Order Summary</Text>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal:</Text>
                  <Text style={styles.summaryValue}>${getTotal().toFixed(2)}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax (8%):</Text>
                  <Text style={styles.summaryValue}>${getTax().toFixed(2)}</Text>
                </View>
                
                <Divider style={styles.divider} />
                
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>${getGrandTotal().toFixed(2)}</Text>
                </View>

                <TextInput
                  label="Customer Name (Optional)"
                  value={customerName}
                  onChangeText={setCustomerName}
                  mode="outlined"
                  style={styles.customerInput}
                />

                <Text style={styles.paymentLabel}>Payment Method</Text>
                <SegmentedButtons
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  buttons={[
                    { value: 'cash', label: 'Cash' },
                    { value: 'card', label: 'Card' },
                    { value: 'mobile', label: 'Mobile' }
                  ]}
                  style={styles.paymentButtons}
                />

                <Button
                  mode="contained"
                  onPress={processSale}
                  style={styles.checkoutButton}
                  contentStyle={styles.checkoutButtonContent}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    `Complete Sale - $${getGrandTotal().toFixed(2)}`
                  )}
                </Button>
              </Card.Content>
            </Card>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 8,
    elevation: 2,
  },
  searchBar: {
    margin: 16,
    marginBottom: 8,
  },
  categoryContainer: {
    paddingHorizontal: 16,
  },
  chip: {
    marginRight: 8,
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
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  productsSection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
  },
  productsContainer: {
    flex: 1,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    marginBottom: 12,
    elevation: 2,
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
  cartSection: {
    width: 300,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
    padding: 16,
  },
  cartContainer: {
    flex: 1,
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  cartItemPrice: {
    fontSize: 12,
    color: '#666666',
  },
  cartItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartItemQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  emptyCartCard: {
    elevation: 2,
  },
  emptyCartContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#999999',
  },
  summaryCard: {
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  customerInput: {
    marginTop: 16,
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  paymentButtons: {
    marginBottom: 16,
  },
  checkoutButton: {
    minHeight: 48,
  },
  checkoutButtonContent: {
    paddingVertical: 8,
  },
});

export default SalesScreen;
