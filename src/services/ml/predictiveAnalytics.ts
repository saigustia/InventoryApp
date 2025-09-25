export interface SalesPrediction {
  date: string;
  predictedSales: number;
  confidence: number;
  factors: string[];
}

export interface StockRecommendation {
  productId: string;
  productName: string;
  currentStock: number;
  recommendedOrder: number;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface MLService {
  predictSales: (days: number) => Promise<SalesPrediction[]>;
  getStockRecommendations: () => Promise<StockRecommendation[]>;
  analyzeTrends: () => Promise<any>;
}

// Mock ML service - replace with actual ML model integration
export const mlService: MLService = {
  async predictSales(days: number): Promise<SalesPrediction[]> {
    // Simulate ML prediction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const predictions: SalesPrediction[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        predictedSales: 1000 + Math.random() * 500,
        confidence: 0.7 + Math.random() * 0.2,
        factors: ['Weather', 'Historical Data', 'Seasonal Trends'],
      });
    }
    
    return predictions;
  },

  async getStockRecommendations(): Promise<StockRecommendation[]> {
    // Simulate ML analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return [
      {
        productId: '1',
        productName: 'Vanilla Ice Cream',
        currentStock: 5,
        recommendedOrder: 20,
        reason: 'High demand predicted for next week',
        urgency: 'high',
      },
      {
        productId: '2',
        productName: 'Chocolate Chips',
        currentStock: 3,
        recommendedOrder: 10,
        reason: 'Seasonal increase in chocolate products',
        urgency: 'medium',
      },
    ];
  },

  async analyzeTrends(): Promise<any> {
    // Simulate trend analysis
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      topSellingProducts: ['Vanilla Ice Cream', 'Chocolate Ice Cream', 'Strawberry Ice Cream'],
      peakHours: ['2:00 PM', '7:00 PM', '8:00 PM'],
      seasonalTrends: {
        summer: 'Ice cream sales increase by 40%',
        winter: 'Hot beverages become popular',
      },
    };
  },
};
