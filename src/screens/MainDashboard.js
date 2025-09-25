import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  IconButton,
  Badge,
  ActivityIndicator 
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MainDashboard = ({ navigation }) => {
  const [weather, setWeather] = useState({ temperature: '24°C', condition: 'Sunny' });
  const [stats, setStats] = useState({
    productsInStock: 45,
    todayRevenue: 1250,
    lowStockItems: 3
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulate loading dashboard data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would fetch this data from your API
      setWeather({ temperature: '24°C', condition: 'Sunny' });
      setStats({
        productsInStock: 45,
        todayRevenue: 1250,
        lowStockItems: 3
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userToken');
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  const MainActionButton = ({ title, icon, onPress, color, badge }) => (
    <Card style={[styles.actionCard, { borderLeftColor: color }]}>
      <Card.Content style={styles.actionCardContent}>
        <View style={styles.actionHeader}>
          <IconButton
            icon={icon}
            size={40}
            iconColor={color}
            style={styles.actionIcon}
          />
          {badge > 0 && (
            <Badge style={[styles.badge, { backgroundColor: '#F44336' }]}>
              {badge}
            </Badge>
          )}
        </View>
        <Text style={styles.actionTitle}>{title}</Text>
        <Button
          mode="contained"
          onPress={onPress}
          style={[styles.actionButton, { backgroundColor: color }]}
          contentStyle={styles.actionButtonContent}
        >
          Open
        </Button>
      </Card.Content>
    </Card>
  );

  const StatCard = ({ title, value, icon, color }) => (
    <Card style={styles.statCard}>
      <Card.Content style={styles.statCardContent}>
        <IconButton
          icon={icon}
          size={24}
          iconColor={color}
          style={styles.statIcon}
        />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1976D2', '#42A5F5']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good Morning! 👋</Text>
            <Text style={styles.headerTitle}>Ice Cream Inventory</Text>
          </View>
          <IconButton
            icon="logout"
            size={24}
            iconColor="#FFFFFF"
            onPress={handleLogout}
          />
        </View>
      </LinearGradient>

      {/* Weather Widget */}
      <Card style={styles.weatherCard}>
        <Card.Content style={styles.weatherContent}>
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherIcon}>☀️</Text>
            <View>
              <Text style={styles.weatherTemp}>{weather.temperature}</Text>
              <Text style={styles.weatherCondition}>{weather.condition}</Text>
            </View>
          </View>
          <Text style={styles.weatherDate}>Today</Text>
        </Card.Content>
      </Card>

      {/* Main Action Buttons */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <MainActionButton
            title="Receive Stock"
            icon="package-variant"
            color="#4CAF50"
            onPress={() => navigation.navigate('Inventory')}
            badge={0}
          />
          <MainActionButton
            title="Sell Products"
            icon="cash-register"
            color="#FF6B35"
            onPress={() => navigation.navigate('Sales')}
            badge={0}
          />
          <MainActionButton
            title="View Stock"
            icon="view-list"
            color="#2196F3"
            onPress={() => navigation.navigate('Inventory')}
            badge={stats.lowStockItems}
          />
        </View>
      </View>

      {/* Daily Sales Summary */}
      <Card style={styles.salesCard}>
        <Card.Content>
          <Text style={styles.salesTitle}>Today's Sales Summary</Text>
          <View style={styles.salesContent}>
            <View style={styles.salesItem}>
              <Text style={styles.salesLabel}>Revenue</Text>
              <Text style={styles.salesValue}>${stats.todayRevenue}</Text>
            </View>
            <View style={styles.salesItem}>
              <Text style={styles.salesLabel}>Orders</Text>
              <Text style={styles.salesValue}>23</Text>
            </View>
            <View style={styles.salesItem}>
              <Text style={styles.salesLabel}>Avg. Order</Text>
              <Text style={styles.salesValue}>$54</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Products in Stock"
            value={stats.productsInStock}
            icon="package-variant-closed"
            color="#4CAF50"
          />
          <StatCard
            title="Low Stock Alerts"
            value={stats.lowStockItems}
            icon="alert-circle"
            color="#F44336"
          />
          <StatCard
            title="Categories"
            value="4"
            icon="format-list-bulleted"
            color="#FF9800"
          />
          <StatCard
            title="Today's Orders"
            value="23"
            icon="shopping"
            color="#9C27B0"
          />
        </View>
      </View>

      {/* Low Stock Alerts */}
      {stats.lowStockItems > 0 && (
        <Card style={styles.alertCard}>
          <Card.Content>
            <View style={styles.alertHeader}>
              <IconButton
                icon="alert-circle"
                size={24}
                iconColor="#F44336"
              />
              <Text style={styles.alertTitle}>Low Stock Alert</Text>
            </View>
            <Text style={styles.alertText}>
              {stats.lowStockItems} items are running low on stock. Tap to view details.
            </Text>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Inventory')}
              style={styles.alertButton}
            >
              View Details
            </Button>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 18,
    color: '#E3F2FD',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  weatherCard: {
    margin: 16,
    elevation: 4,
  },
  weatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  weatherCondition: {
    fontSize: 16,
    color: '#666666',
  },
  weatherDate: {
    fontSize: 14,
    color: '#999999',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 4,
    borderLeftWidth: 4,
  },
  actionCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionHeader: {
    position: 'relative',
    marginBottom: 8,
  },
  actionIcon: {
    margin: 0,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 20,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    color: '#212121',
  },
  actionButton: {
    minHeight: 36,
  },
  actionButtonContent: {
    paddingHorizontal: 16,
  },
  salesCard: {
    margin: 16,
    elevation: 4,
  },
  salesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 16,
  },
  salesContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  salesItem: {
    alignItems: 'center',
  },
  salesLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  salesValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    elevation: 2,
  },
  statCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statIcon: {
    margin: 0,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  alertCard: {
    margin: 16,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
  },
  alertText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  alertButton: {
    alignSelf: 'flex-start',
  },
});

export default MainDashboard;
