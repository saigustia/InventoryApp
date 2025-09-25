import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, IconButton, Divider } from 'react-native-paper';
import { Card } from '../common/Card';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  subtotal: number;
  tax: number;
  total: number;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  subtotal,
  tax,
  total,
}) => {
  const CartItemComponent = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>${item.price.toFixed(2)} each</Text>
      </View>
      <View style={styles.cartItemControls}>
        <IconButton
          icon="minus"
          size={20}
          onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
        />
        <Text style={styles.cartItemQuantity}>{item.quantity}</Text>
        <IconButton
          icon="plus"
          size={20}
          onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
        />
        <IconButton
          icon="delete"
          size={20}
          iconColor="#F44336"
          onPress={() => onRemoveItem(item.id)}
        />
      </View>
    </View>
  );

  if (items.length === 0) {
    return (
      <Card style={styles.emptyCartCard}>
        <View style={styles.emptyCartContent}>
          <Text style={styles.emptyCartText}>No items in cart</Text>
          <Text style={styles.emptyCartSubtext}>Add products to get started</Text>
        </View>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.cartContainer}>
        {items.map((item) => (
          <CartItemComponent key={item.id} item={item} />
        ))}
      </ScrollView>

      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax (8%):</Text>
          <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});
