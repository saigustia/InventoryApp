import React from 'react';
import { Card as PaperCard, CardProps } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface CustomCardProps extends CardProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CustomCardProps> = ({
  variant = 'elevated',
  padding = 'medium',
  style,
  children,
  ...props
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
    style,
  ];

  return (
    <PaperCard style={cardStyle} {...props}>
      {children}
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
  },
  elevated: {
    elevation: 4,
  },
  outlined: {
    elevation: 0,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filled: {
    elevation: 0,
    backgroundColor: '#F5F5F5',
  },
  paddingNone: {
    // No additional padding
  },
  paddingSmall: {
    padding: 8,
  },
  paddingMedium: {
    padding: 16,
  },
  paddingLarge: {
    padding: 24,
  },
});
