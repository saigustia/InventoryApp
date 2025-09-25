import React from 'react';
import { TextInput, TextInputProps } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface CustomInputProps extends TextInputProps {
  variant?: 'outlined' | 'filled' | 'flat';
  size?: 'small' | 'medium' | 'large';
  error?: boolean;
  helperText?: string;
}

export const Input: React.FC<CustomInputProps> = ({
  variant = 'outlined',
  size = 'medium',
  error = false,
  helperText,
  style,
  ...props
}) => {
  const inputStyle = [
    styles.base,
    styles[size],
    error && styles.error,
    style,
  ];

  return (
    <TextInput
      mode={variant}
      style={inputStyle}
      error={error}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#FFFFFF',
  },
  small: {
    minHeight: 40,
  },
  medium: {
    minHeight: 56,
  },
  large: {
    minHeight: 64,
  },
  error: {
    borderColor: '#F44336',
  },
});
