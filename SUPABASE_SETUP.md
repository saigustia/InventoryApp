# Supabase Backend Setup Guide

This guide will help you set up the Supabase backend for the Ice Cream Inventory App.

## 🚀 Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `ice-cream-inventory`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"

### 2. Get Project Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon Key** (public key)

### 3. Configure Environment Variables

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 4. Run Database Migrations

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Run migrations:
   ```bash
   supabase db push
   ```

### 5. Deploy Edge Functions

1. Deploy all edge functions:
   ```bash
   supabase functions deploy
   ```

## 📊 Database Schema

The database includes the following tables:

### Core Tables
- **profiles** - User profiles and roles
- **categories** - Product categories (Ice Cream, Toppings, etc.)
- **suppliers** - Vendor information
- **products** - Inventory items with pricing and stock info
- **inventory_levels** - Current stock levels
- **stock_movements** - All stock in/out transactions
- **sales** - Daily sales records
- **sale_items** - Individual items in each sale

### Key Features
- **Row Level Security (RLS)** - Data protection based on user roles
- **Real-time subscriptions** - Live updates for inventory changes
- **Automatic triggers** - Stock level updates on movements
- **Audit trails** - Complete history of all changes

## 🔐 Authentication Setup

### 1. Configure Email Authentication

1. Go to **Authentication** → **Settings**
2. Enable **Email** provider
3. Configure email templates if needed
4. Set up email redirect URLs:
   - **Site URL**: `icecream://`
   - **Redirect URLs**: `icecream://reset-password`

### 2. User Roles

The app supports the following user roles:
- **admin** - Full access to all features
- **manager** - Can manage inventory and view reports
- **cashier** - Can process sales and view inventory
- **viewer** - Read-only access

## 📁 Storage Setup

### 1. Storage Buckets

The following buckets are automatically created:
- **product-images** - Product photos (public)
- **profile-images** - User profile pictures (public)
- **receipts** - Sales receipts (private)

### 2. Storage Policies

- Product images are publicly accessible
- Users can upload their own profile images
- Receipts are private to users and managers

## 🔧 Edge Functions

### 1. calculate-inventory-analytics

**Purpose**: Calculate inventory analytics and reports

**Usage**:
```typescript
const { data, error } = await supabase.functions.invoke('calculate-inventory-analytics', {
  body: { period: '30d', category_id: 'optional-category-id' }
});
```

**Returns**:
- Summary statistics
- Top selling products
- Category breakdown
- Stock movement analytics

### 2. process-sale

**Purpose**: Process complete sales transactions

**Usage**:
```typescript
const { data, error } = await supabase.functions.invoke('process-sale', {
  body: {
    sale_data: {
      items: [...],
      customer_info: {...},
      payment_info: {...},
      notes: '...'
    }
  }
});
```

**Features**:
- Stock validation
- Automatic inventory updates
- Sale number generation
- Receipt creation

### 3. sync-offline-data

**Purpose**: Sync offline data when connection is restored

**Usage**:
```typescript
const { data, error } = await supabase.functions.invoke('sync-offline-data', {
  body: {
    sync_data: {
      sales: [...],
      stock_movements: [...],
      last_sync_time: '...'
    }
  }
});
```

**Features**:
- Conflict resolution
- Batch processing
- Error handling
- Data validation

## 🔄 Real-time Features

### 1. Inventory Updates

Subscribe to real-time inventory changes:
```typescript
const subscription = supabase
  .channel('inventory-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'inventory_levels'
  }, (payload) => {
    console.log('Inventory updated:', payload);
  })
  .subscribe();
```

### 2. Sales Updates

Subscribe to new sales:
```typescript
const subscription = supabase
  .channel('sales-updates')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'sales'
  }, (payload) => {
    console.log('New sale:', payload);
  })
  .subscribe();
```

## 📱 Offline Support

### 1. Local SQLite Database

The app uses SQLite for offline storage:
- Products and inventory levels
- Pending sales and stock movements
- Sync queue for pending operations

### 2. Sync Queue

When offline, operations are queued and synced when online:
- Automatic sync on network reconnection
- Background sync when app comes to foreground
- Conflict resolution for concurrent updates

### 3. Offline Indicators

The app shows offline status and pending sync operations.

## 🛡️ Security Features

### 1. Row Level Security (RLS)

All tables have RLS policies:
- Users can only see their own data
- Role-based access control
- Secure data isolation

### 2. API Security

- JWT-based authentication
- Rate limiting on edge functions
- Input validation and sanitization
- SQL injection protection

### 3. Data Validation

- Server-side validation
- Type checking with TypeScript
- Business rule enforcement

## 📊 Analytics & Reporting

### 1. Built-in Analytics

- Inventory turnover rates
- Sales performance metrics
- Stock level analysis
- Category performance

### 2. Custom Reports

Use the analytics edge function to generate custom reports:
- Date range filtering
- Category-specific analysis
- Product performance metrics
- Sales trends

## 🔧 Development Tools

### 1. Database Management

Use Supabase Dashboard for:
- Table management
- Data inspection
- Query execution
- Performance monitoring

### 2. API Testing

Test edge functions using:
- Supabase Dashboard
- Postman/Insomnia
- Built-in function testing

### 3. Real-time Testing

Use Supabase Dashboard to:
- Monitor real-time connections
- Test subscriptions
- Debug data flow

## 🚀 Production Deployment

### 1. Environment Setup

1. Create production environment variables
2. Update API URLs for production
3. Configure production email settings
4. Set up monitoring and alerts

### 2. Performance Optimization

- Enable database indexes
- Configure connection pooling
- Set up CDN for images
- Monitor query performance

### 3. Backup & Recovery

- Enable automatic backups
- Set up point-in-time recovery
- Test backup restoration
- Document recovery procedures

## 📞 Support

### 1. Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [React Native Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)

### 2. Community

- [Supabase Discord](https://discord.supabase.com)
- [GitHub Discussions](https://github.com/supabase/supabase/discussions)

### 3. Troubleshooting

Common issues and solutions:
- **Connection errors**: Check API keys and URLs
- **RLS errors**: Verify user permissions
- **Sync issues**: Check network connectivity
- **Performance**: Monitor query execution times

## 🔄 Updates & Maintenance

### 1. Database Migrations

When updating the schema:
```bash
# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db push
```

### 2. Edge Function Updates

When updating functions:
```bash
# Deploy specific function
supabase functions deploy function-name

# Deploy all functions
supabase functions deploy
```

### 3. Monitoring

Set up monitoring for:
- Database performance
- API response times
- Error rates
- User activity

---

## 🎉 You're All Set!

Your Supabase backend is now ready for the Ice Cream Inventory App. The database is configured with all necessary tables, security policies, and edge functions for a production-ready inventory management system.

For any questions or issues, refer to the troubleshooting section or reach out to the Supabase community.
