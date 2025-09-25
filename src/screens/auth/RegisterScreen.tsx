import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Input, Button, Card } from '@/components';
import { validation } from '@/utils';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!validation.required(formData.firstName)) {
      newErrors.firstName = 'First name is required';
    }

    if (!validation.required(formData.lastName)) {
      newErrors.lastName = 'Last name is required';
    }

    if (!validation.required(formData.email)) {
      newErrors.email = 'Email is required';
    } else if (!validation.email(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!validation.required(formData.password)) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validation.password(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    if (!validation.required(formData.confirmPassword)) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success', 
        'Account created successfully! Please sign in.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login' as never) }]
      );
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1976D2', '#42A5F5']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🍦</Text>
          <Text style={styles.appTitle}>Create Account</Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.welcomeText}>Join Us Today!</Text>
            <Text style={styles.subtitleText}>
              Create your account to start managing your ice cream inventory
            </Text>

            <View style={styles.nameRow}>
              <Input
                label="First Name"
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                error={!!errors.firstName}
                helperText={errors.firstName}
                left={<Input.Icon icon="account" />}
                style={styles.halfInput}
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                error={!!errors.lastName}
                helperText={errors.lastName}
                style={styles.halfInput}
              />
            </View>

            <Input
              label="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.email}
              helperText={errors.email}
              left={<Input.Icon icon="email" />}
            />

            <Input
              label="Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry={!showPassword}
              error={!!errors.password}
              helperText={errors.password}
              left={<Input.Icon icon="lock" />}
              right={
                <Input.Icon 
                  icon={showPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <Input
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry={!showConfirmPassword}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              left={<Input.Icon icon="lock-check" />}
              right={
                <Input.Icon 
                  icon={showConfirmPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.registerButton}
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                'Create Account'
              )}
            </Button>

            <View style={styles.divider}>
              <Text style={styles.dividerText}>Already have an account?</Text>
            </View>

            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Login' as never)}
              style={styles.loginButton}
              fullWidth
            >
              Sign In
            </Button>
          </View>
        </Card>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 60,
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  card: {
    elevation: 8,
    borderRadius: 16,
  },
  cardContent: {
    padding: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1976D2',
  },
  subtitleText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666666',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  divider: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerText: {
    color: '#666666',
    fontSize: 14,
  },
  loginButton: {
    marginTop: 8,
  },
});

export default RegisterScreen;
