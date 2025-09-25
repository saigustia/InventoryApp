export const formatting = {
  currency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  date: (date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      case 'long':
        return dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'time':
        return dateObj.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
      default:
        return dateObj.toLocaleDateString();
    }
  },

  number: (num: number, decimals: number = 2): string => {
    return num.toFixed(decimals);
  },

  percentage: (value: number, decimals: number = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  truncate: (str: string, length: number): string => {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  },

  phone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  },

  stockStatus: (current: number, minimum: number): 'low' | 'medium' | 'high' => {
    if (current <= minimum) return 'low';
    if (current <= minimum * 1.5) return 'medium';
    return 'high';
  },

  stockColor: (status: 'low' | 'medium' | 'high'): string => {
    switch (status) {
      case 'low': return '#F44336';
      case 'medium': return '#FF9800';
      case 'high': return '#4CAF50';
      default: return '#9E9E9E';
    }
  },
};
