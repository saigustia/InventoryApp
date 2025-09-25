import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton, Badge } from 'react-native-paper';
import { Card } from '../common/Card';

export interface StockItemProps {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  unit: string;
  onAdjustStock: (id: string, adjustment: number) => void;
  onEdit?: (id: string) => void;
}

export const StockItem: React.FC<StockItemProps> = ({
  id,
  name,
  category,
  stock,
  minStock,
  price,
  unit,
  onAdjustStock,
  onEdit,
}) => {
  const getStockStatus = (currentStock: number, minimumStock: number) => {
    if (currentStock <= minimumStock) return 'low';
    if (currentStock <= minimumStock * 1.5) return 'medium';
    return 'high';
  };

  const getStockColor = (status: string) => {
    switch (status) {
      case 'low': return '#F44336';
      case 'medium': return '#FF9800';
      case 'high': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const stockStatus = getStockStatus(stock, minStock);
  const stockColor = getStockColor(stockStatus);

  return (
    <Card style={[styles.card, { borderLeftColor: stockColor }]}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.category}>{category}</Text>
        </View>
        <View style={styles.stockIndicator}>
          <View style={[styles.stockBar, { backgroundColor: stockColor }]} />
          <Text style={[styles.stockText, { color: stockColor }]}>
            {stock} {unit}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.price}>${price.toFixed(2)}</Text>
        <Text style={styles.minStock}>Min: {minStock}</Text>
      </View>

      <View style={styles.controls}>
        <IconButton
          icon="minus"
          size={20}
          iconColor="#F44336"
          onPress={() => onAdjustStock(id, -1)}
        />
        <Text style={styles.stockValue}>{stock}</Text>
        <IconButton
          icon="plus"
          size={20}
          iconColor="#4CAF50"
          onPress={() => onAdjustStock(id, 1)}
        />
        {onEdit && (
          <IconButton
            icon="pencil"
            size={20}
            iconColor="#1976D2"
            onPress={() => onEdit(id)}
          />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  category: {
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
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  minStock: {
    fontSize: 12,
    color: '#666666',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
});
