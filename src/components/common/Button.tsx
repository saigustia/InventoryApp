import React from 'react';
import { Button as PaperButton, ButtonProps } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface CustomButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export const Button: React.FC<CustomButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  style,
  ...props
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    style,
  ];

  return (
    <PaperButton
      style={buttonStyle}
      contentStyle={styles.content}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
  },
  primary: {
    backgroundColor: '#1976D2',
  },
  secondary: {
    backgroundColor: '#FF6B35',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  text: {
    backgroundColor: 'transparent',
  },
  small: {
    minHeight: 36,
  },
  medium: {
    minHeight: 44,
  },
  large: {
    minHeight: 52,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    paddingVertical: 8,
  },
});
