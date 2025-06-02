// API service for strategies data
// This file abstracts the data source and can be easily switched from mock to real API

import { strategies } from "@stabilitydao/stability";

export interface StrategyApiData {
  id: string;
  shortId: string;
  state: string;
  contractGithubId: number;
  color: string;
  bgColor: string;
  protocols?: string[];
  description?: string;
  baseStrategies?: string[];
  // Extended fields that would come from API
  tvl?: number;
  apy?: string;
  dailyVolume?: number;
  totalUsers?: number;
  riskLevel?: string;
  website?: string;
  documentation?: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  audit?: string;
  fees?: {
    management: string;
    performance: string;
    withdrawal: string;
  };
  riskMetrics?: {
    volatility: string;
    maxDrawdown: string;
    sharpeRatio: string;
  };
  performance?: {
    '24h': string;
    '7d': string;
    '30d': string;
    '1y': string;
  };
}

// Mock data generator for additional fields
const generateMockApiData = (strategy: any): StrategyApiData => {
  const seed = strategy.id?.length || 1; // Use ID length as seed for consistent mock data
  const random = (min: number, max: number, seed: number) => {
    const x = Math.sin(seed) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };

  return {
    ...strategy,
    tvl: Math.floor(random(1000000, 50000000, seed)),
    apy: random(1, 25, seed).toFixed(2),
    dailyVolume: Math.floor(random(100000, 5000000, seed * 2)),
    totalUsers: Math.floor(random(500, 10000, seed * 3)),
    riskLevel: ['Low', 'Medium', 'High'][Math.floor(random(0, 2.99, seed * 4))],
    website: `https://${(strategy.id || 'example').toLowerCase()}.finance`,
    documentation: `https://docs.${(strategy.id || 'example').toLowerCase()}.finance`,
    twitter: `https://twitter.com/${(strategy.id || 'example').toLowerCase()}`,
    discord: `https://discord.gg/${(strategy.id || 'example').toLowerCase()}`,
    telegram: `https://t.me/${(strategy.id || 'example').toLowerCase()}`,
    audit: `https://audit.${(strategy.id || 'example').toLowerCase()}.com`,
    fees: {
      management: random(0.1, 1.5, seed * 5).toFixed(1) + '%',
      performance: Math.floor(random(5, 20, seed * 6)) + '%',
      withdrawal: random(0.05, 0.5, seed * 7).toFixed(2) + '%'
    },
    riskMetrics: {
      volatility: random(10, 100, seed * 8).toFixed(1) + '%',
      maxDrawdown: random(5, 50, seed * 9).toFixed(1) + '%',
      sharpeRatio: random(0.5, 3, seed * 10).toFixed(2)
    },
    performance: {
      '24h': (random(-5, 10, seed * 11) > 0 ? '+' : '') + random(-5, 10, seed * 11).toFixed(2) + '%',
      '7d': (random(-10, 20, seed * 12) > 0 ? '+' : '') + random(-10, 20, seed * 12).toFixed(2) + '%',
      '30d': (random(-15, 30, seed * 13) > 0 ? '+' : '') + random(-15, 30, seed * 13).toFixed(2) + '%',
      '1y': (random(-20, 100, seed * 14) > 0 ? '+' : '') + random(-20, 100, seed * 14).toFixed(2) + '%'
    }
  };
};

export class StrategiesApiService {
  private static baseUrl = '/api/strategies'; // Future API endpoint

  /**
   * Fetch all strategies data
   * Currently uses mock data, but structured to easily switch to real API
   */
  static async fetchStrategies(): Promise<StrategyApiData[]> {
    try {
      // TODO: Uncomment when real API is available
      // const response = await fetch(this.baseUrl);
      // if (!response.ok) {
      //   throw new Error(`API request failed: ${response.status}`);
      // }
      // return await response.json();

      // Mock implementation
      await this.simulateNetworkDelay();
      
      return Object.values(strategies).map((strategy) => 
        generateMockApiData(strategy)
      );
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
      throw new Error('Unable to load strategies data');
    }
  }

  /**
   * Fetch single strategy details
   */
  static async fetchStrategyById(strategyId: string): Promise<StrategyApiData | null> {
    try {
      // TODO: Uncomment when real API is available
      // const response = await fetch(`${this.baseUrl}/${strategyId}`);
      // if (!response.ok) {
      //   if (response.status === 404) return null;
      //   throw new Error(`API request failed: ${response.status}`);
      // }
      // return await response.json();

      // Mock implementation
      await this.simulateNetworkDelay();
      
      const strategy = strategies[strategyId.toUpperCase() as keyof typeof strategies];
      if (!strategy) return null;
      
      return generateMockApiData(strategy);
    } catch (error) {
      console.error('Failed to fetch strategy details:', error);
      throw new Error('Unable to load strategy details');
    }
  }

  /**
   * Search strategies by filters
   */
  static async searchStrategies(filters: {
    status?: string[];
    riskLevel?: string[];
    minTvl?: number;
    maxTvl?: number;
  }): Promise<StrategyApiData[]> {
    try {
      // TODO: Implement real API call with query parameters
      // const params = new URLSearchParams();
      // if (filters.status) params.append('status', filters.status.join(','));
      // const response = await fetch(`${this.baseUrl}/search?${params}`);

      // Mock implementation
      const allStrategies = await this.fetchStrategies();
      
      return allStrategies.filter(strategy => {
        if (filters.status && filters.status.length > 0) {
          if (!filters.status.includes(strategy.state.toLowerCase())) {
            return false;
          }
        }
        
        if (filters.riskLevel && filters.riskLevel.length > 0) {
          if (!filters.riskLevel.includes(strategy.riskLevel || '')) {
            return false;
          }
        }
        
        if (filters.minTvl !== undefined && (strategy.tvl || 0) < filters.minTvl) {
          return false;
        }
        
        if (filters.maxTvl !== undefined && (strategy.tvl || 0) > filters.maxTvl) {
          return false;
        }
        
        return true;
      });
    } catch (error) {
      console.error('Failed to search strategies:', error);
      throw new Error('Unable to search strategies');
    }
  }

  /**
   * Get strategy statistics/metrics
   */
  static async getStrategyStats(): Promise<{
    totalTvl: number;
    totalStrategies: number;
    averageApy: number;
    statusBreakdown: Record<string, number>;
  }> {
    try {
      // TODO: Real API implementation
      
      const strategies = await this.fetchStrategies();
      
      const totalTvl = strategies.reduce((sum, s) => sum + (s.tvl || 0), 0);
      const totalStrategies = strategies.length;
      const averageApy = strategies.reduce((sum, s) => sum + parseFloat(s.apy || '0'), 0) / totalStrategies;
      
      const statusBreakdown = strategies.reduce((acc, s) => {
        acc[s.state] = (acc[s.state] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        totalTvl,
        totalStrategies,
        averageApy,
        statusBreakdown
      };
    } catch (error) {
      console.error('Failed to fetch strategy stats:', error);
      throw new Error('Unable to load strategy statistics');
    }
  }

  /**
   * Simulate network delay for more realistic mock behavior
   */
  private static simulateNetworkDelay(): Promise<void> {
    const delay = Math.random() * 500 + 200; // 200-700ms delay
    return new Promise(resolve => setTimeout(resolve, delay));
  }
} 