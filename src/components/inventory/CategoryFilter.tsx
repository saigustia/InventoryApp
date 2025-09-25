import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip, Badge } from 'react-native-paper';

export interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  categoryCounts?: Record<string, number>;
  lowStockCounts?: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  categoryCounts = {},
  lowStockCounts = {},
}) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {categories.map((category) => {
        const count = categoryCounts[category] || 0;
        const lowStockCount = lowStockCounts[category] || 0;
        
        return (
          <View key={category} style={styles.chipContainer}>
            <Chip
              selected={selectedCategory === category}
              onPress={() => onCategorySelect(category)}
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
              <Badge style={styles.badge}>
                {lowStockCount}
              </Badge>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  content: {
    paddingHorizontal: 16,
  },
  chipContainer: {
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
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#F44336',
  },
});
