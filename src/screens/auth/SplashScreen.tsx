import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { storage } from '@/utils/helpers/storage';

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthenticationStatus();
  }, []);

  const checkAuthenticationStatus = async () => {
    try {
      // Simulate loading time for smooth animation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if user is logged in
      const userToken = await storage.get<string>('userToken');
      
      if (userToken) {
        // User is authenticated, navigate to main app
        navigation.navigate('Main' as never);
      } else {
        // User not authenticated, navigate to login
        navigation.navigate('Login' as never);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      // On error, navigate to login
      navigation.navigate('Login' as never);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1976D2', '#42A5F5', '#90CAF9']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* App Logo with Animation */}
        <Animatable.View
          animation="bounceIn"
          duration={2000}
          style={styles.logoContainer}
        >
          <View style={styles.iceCreamCone}>
            <View style={styles.cone} />
            <View style={styles.scoop1} />
            <View style={styles.scoop2} />
            <View style={styles.scoop3} />
            <View style={styles.cherry} />
          </View>
        </Animatable.View>

        {/* App Title */}
        <Animatable.Text
          animation="fadeInUp"
          delay={1000}
          duration={1500}
          style={styles.appTitle}
        >
          Ice Cream Inventory
        </Animatable.Text>

        <Animatable.Text
          animation="fadeInUp"
          delay={1500}
          duration={1500}
          style={styles.appSubtitle}
        >
          Manage Your Sweet Business
        </Animatable.Text>

        {/* Loading Indicator */}
        <Animatable.View
          animation="fadeIn"
          delay={2000}
          duration={1000}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </Animatable.View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 30,
  },
  iceCreamCone: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cone: {
    width: 0,
    height: 0,
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderBottomWidth: 60,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#8B4513',
  },
  scoop1: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFB6C1',
    marginBottom: -10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  scoop2: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF8DC',
    marginBottom: -10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  scoop3: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#98FB98',
    marginBottom: -10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cherry: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D32F2F',
    marginBottom: 5,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#E3F2FD',
    textAlign: 'center',
    marginBottom: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default SplashScreen;
