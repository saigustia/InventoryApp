import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Input, Button, Card } from '@/components';
import { validation } from '@/utils';

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async () => {
    if (!validation.required(email)) {
      setError('Please enter your email address');
      return;
    }

    if (!validation.email(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setEmailSent(true);
      Alert.alert(
        'Email Sent', 
        'Password reset instructions have been sent to your email address.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login' as never) }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <LinearGradient
        colors={['#1976D2', '#42A5F5']}
        style={styles.container}
      >
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>📧</Text>
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successText}>
            We've sent password reset instructions to {email}
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Login' as never)}
            style={styles.backButton}
          >
            Back to Login
          </Button>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#1976D2', '#42A5F5']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🔒</Text>
          <Text style={styles.appTitle}>Reset Password</Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.welcomeText}>Forgot Your Password?</Text>
            <Text style={styles.subtitleText}>
              No worries! Enter your email address and we'll send you instructions to reset your password.
            </Text>

            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!error}
              helperText={error}
              left={<Input.Icon icon="email" />}
              placeholder="Enter your email address"
            />

            <Button
              mode="contained"
              onPress={handleResetPassword}
              style={styles.resetButton}
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                'Send Reset Instructions'
              )}
            </Button>

            <View style={styles.divider}>
              <Text style={styles.dividerText}>Remember your password?</Text>
            </View>

            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Login' as never)}
              style={styles.loginButton}
              fullWidth
            >
              Back to Login
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
    lineHeight: 22,
  },
  resetButton: {
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
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  successText: {
    fontSize: 16,
    color: '#E3F2FD',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  backButton: {
    minWidth: 120,
  },
});

export default ForgotPasswordScreen;
