import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  TextInput,
  SegmentedButtons,
  ActivityIndicator
} from 'react-native-paper';

const AddProductScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Ice Cream',
    stock: '',
    minStock: '',
    price: '',
    unit: 'pints'
  });
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { value: 'Ice Cream', label: 'Ice Cream' },
    { value: 'Toppings', label: 'Toppings' },
    { value: 'Fruits', label: 'Fruits' },
    { value: 'Supplies', label: 'Supplies' }
  ];

  const units = {
    'Ice Cream': 'pints',
    'Toppings': 'bags',
    'Fruits': 'lbs',
    'Supplies': 'pieces'
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-update unit based on category
    if (field === 'category' && units[value]) {
      setFormData(prev => ({ ...prev, unit: units[value] }));
    }
  };

  const validateForm = () => {
    const { name, stock, minStock, price } = formData;
    
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a product name');
      return false;
    }

    if (!stock || isNaN(stock) || parseFloat(stock) < 0) {
      Alert.alert('Error', 'Please enter a valid stock quantity');
      return false;
    }

    if (!minStock || isNaN(minStock) || parseFloat(minStock) < 0) {
      Alert.alert('Error', 'Please enter a valid minimum stock level');
      return false;
    }

    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Success', 
        'Product added successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text style={styles.title}>Add New Product</Text>
          <Text style={styles.subtitle}>Enter the product details below</Text>

          <TextInput
            label="Product Name"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Vanilla Ice Cream"
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <SegmentedButtons
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
              buttons={categories}
              style={styles.segmentedButtons}
            />
          </View>

          <View style={styles.row}>
            <TextInput
              label="Current Stock"
              value={formData.stock}
              onChangeText={(value) => handleInputChange('stock', value)}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              placeholder="0"
            />
            <TextInput
              label="Min Stock Level"
              value={formData.minStock}
              onChangeText={(value) => handleInputChange('minStock', value)}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              placeholder="0"
            />
          </View>

          <View style={styles.row}>
            <TextInput
              label="Price"
              value={formData.price}
              onChangeText={(value) => handleInputChange('price', value)}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              placeholder="0.00"
              left={<TextInput.Icon icon="currency-usd" />}
            />
            <TextInput
              label="Unit"
              value={formData.unit}
              onChangeText={(value) => handleInputChange('unit', value)}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              placeholder="pints"
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
              contentStyle={styles.buttonContent}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveButton}
              contentStyle={styles.buttonContent}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                'Save Product'
              )}
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  cardContent: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    minHeight: 56,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 0.45,
    minHeight: 48,
  },
  saveButton: {
    flex: 0.45,
    minHeight: 48,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default AddProductScreen;
