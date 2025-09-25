export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  timestamp: string;
}

export interface WeatherService {
  getCurrentWeather: (latitude?: number, longitude?: number) => Promise<WeatherData>;
  getWeatherForecast: (days: number) => Promise<WeatherData[]>;
}

// Mock weather service - replace with actual API integration
export const weatherService: WeatherService = {
  async getCurrentWeather(latitude?: number, longitude?: number): Promise<WeatherData> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data - replace with actual weather API
    return {
      temperature: 24,
      condition: 'Sunny',
      humidity: 65,
      windSpeed: 12,
      location: 'New York, NY',
      timestamp: new Date().toISOString(),
    };
  },

  async getWeatherForecast(days: number): Promise<WeatherData[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock forecast data
    const forecast: WeatherData[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecast.push({
        temperature: 20 + Math.random() * 10,
        condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
        humidity: 60 + Math.random() * 20,
        windSpeed: 5 + Math.random() * 15,
        location: 'New York, NY',
        timestamp: date.toISOString(),
      });
    }
    
    return forecast;
  },
};
