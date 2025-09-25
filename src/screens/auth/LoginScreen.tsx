import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Checkbox,
  ActivityIndicator 
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Input, Button, Card } from '@/components';
import { validation, storage } from '@/utils';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!validation.required(formData.email)) {
      newErrors.email = 'Email is required';
    } else if (!validation.email(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!validation.required(formData.password)) {
      newErrors.password = 'Password is required';
    } else if (!validation.minLength(formData.password, 6)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, accept any email/password combination
      if (formData.email.includes('@') && formData.password.length >= 6) {
        // Store authentication token
        await storage.set('userToken', 'demo-token-123');
        if (rememberMe) {
          await storage.set('rememberMe', 'true');
        }
        
        navigation.navigate('Main' as never);
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
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
          <Text style={styles.appTitle}>Ice Cream Inventory</Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitleText}>Sign in to manage your inventory</Text>

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

            <View style={styles.checkboxContainer}>
              <Checkbox
                status={rememberMe ? 'checked' : 'unchecked'}
                onPress={() => setRememberMe(!rememberMe)}
              />
              <Text style={styles.checkboxText}>Remember me</Text>
            </View>

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                'Sign In'
              )}
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('ForgotPassword' as never)}
              style={styles.forgotButton}
            >
              Forgot Password?
            </Button>

            <View style={styles.divider}>
              <Text style={styles.dividerText}>Don't have an account?</Text>
            </View>

            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Register' as never)}
              style={styles.registerButton}
              fullWidth
            >
              Create Account
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxText: {
    marginLeft: 8,
    fontSize: 16,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  forgotButton: {
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
  registerButton: {
    marginTop: 8,
  },
});

export default LoginScreen;
