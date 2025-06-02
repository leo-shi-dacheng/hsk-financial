// API service for Web3 news data
// This file abstracts the data source and can be easily switched from mock to real API

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary?: string;
  category: string;
  source: string;
  author?: string;
  timestamp: number;
  readTime?: number; // 阅读时长（分钟）
  tags: string[];
  isHot?: boolean; // 是否热门
  image?: string;
  url?: string; // 原文链接
  viewCount?: number;
  likeCount?: number;
}

export interface NewsCategory {
  id: string;
  name: string;
  count: number;
  active: boolean;
}

// 生成模拟新闻数据
const generateMockNewsData = (): NewsItem[] => {
  const categories = ['Market', 'DeFi', 'NFT', 'Blockchain', 'Regulation', 'Technology'];
  const sources = ['CoinDesk', 'The Block', 'Decrypt', 'CoinTelegraph', 'BlockBeats'];
  
  const newsTemplates = [
    {
      title: "CZ: 现在可能是开发者发展{crypto}生态系统的最佳时机",
      content: "币安创始人赵长鹏(CZ)在最新采访中表示，当前的市场环境为开发者提供了绝佳的机会来构建和完善区块链生态系统。他强调，熊市往往是创新的最佳时期。",
      tags: ["Binance", "CZ", "Development"]
    },
    {
      title: "Vitalik表示，Ethereum将在一年内扩展能增强{defi}的功能",
      content: "以太坊创始人Vitalik Buterin在最新的技术路线图中详细阐述了以太坊的扩展计划，预计将在未来12个月内实现重大突破，特别是在DeFi领域的性能提升。",
      tags: ["Ethereum", "Vitalik", "DeFi", "Scaling"]
    },
    {
      title: "TON主网智约停止了区块生产，官方团队正着手分析并修复了问题",
      content: "The Open Network (TON) 主网今日凌晨出现技术故障，导致区块生产暂停。官方技术团队已经确认问题原因并正在进行紧急修复。",
      tags: ["TON", "Network", "Technical Issue"]
    },
    {
      title: "COOKIE完成约{amount}美元，24小时涨幅{percent}%",
      content: "去中心化预测市场协议COOKIE在过去24小时内表现强劲，交易量达到新高。该项目专注于为用户提供透明、去中心化的预测市场服务。",
      tags: ["COOKIE", "DeFi", "Trading"]
    },
    {
      title: "诺贝尔{nobel}: 稳定币没有明显有用的功能，可能引发类似2008年的金融危机",
      content: "诺贝尔经济学奖得主在最新研究中对稳定币的系统性风险提出警告，认为其可能引发类似2008年金融危机的系统性风险。",
      tags: ["Stablecoin", "Regulation", "Risk"]
    },
    {
      title: "以太坊与{layer2}生态取得重大突破，Solana链上活动与生产级应用",
      content: "最新数据显示，以太坊Layer 2生态系统在交易吞吐量和用户体验方面取得重大进展，同时Solana网络的日活跃用户数创下新高。",
      tags: ["Ethereum", "Layer2", "Solana", "Scaling"]
    },
    {
      title: "韩国央行行长：韩国引入韩元稳定币的条件更加明确",
      content: "韩国银行行长在最新声明中表示，政府正在制定更加明确的数字货币监管框架，为韩元稳定币的推出创造条件。",
      tags: ["CBDC", "Korea", "Regulation"]
    },
    {
      title: "美联储理事沃尔：美联储正以安全的方式积极探索AI技术",
      content: "美联储理事在最新讲话中透露，美联储正在积极探索人工智能技术在金融监管和货币政策中的应用，但会确保安全性。",
      tags: ["Fed", "AI", "Technology"]
    },
    {
      title: "本周ENA、TAIKO等代币解锁大额解锁",
      content: "本周将迎来多个主要代币的大额解锁，包括ENA、TAIKO等项目，预计将对市场流动性产生影响。",
      tags: ["Unlock", "ENA", "TAIKO"]
    },
    {
      title: "Vitalik：以太坊在一年内扩容到{number}倍交易容量",
      content: "以太坊创始人Vitalik Buterin在最新技术博客中详细阐述了以太坊的扩容路线图，预计在一年内实现交易容量的大幅提升。",
      tags: ["Ethereum", "Scaling", "Vitalik"]
    }
  ];

  const mockNews: NewsItem[] = [];
  const now = Date.now();

  for (let i = 0; i < 30; i++) {
    const template = newsTemplates[i % newsTemplates.length];
    const hoursAgo = Math.floor(Math.random() * 72); // 过去3天内的新闻
    const timestamp = now - (hoursAgo * 60 * 60 * 1000);
    
    // 替换模板中的占位符
    let title = template.title;
    let content = template.content;
    
    title = title.replace('{crypto}', 'Web3');
    title = title.replace('{defi}', 'DeFi');
    title = title.replace('{amount}', Math.floor(Math.random() * 50 + 10).toString());
    title = title.replace('{percent}', (Math.random() * 20 + 5).toFixed(1));
    title = title.replace('{nobel}', '经济学家Paul Krugman');
    title = title.replace('{layer2}', 'Layer 2');
    title = title.replace('{number}', Math.floor(Math.random() * 90 + 10).toString());
    
    mockNews.push({
      id: `news-${i + 1}`,
      title,
      content,
      summary: content.substring(0, 100) + '...',
      category: categories[Math.floor(Math.random() * categories.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      timestamp,
      readTime: Math.floor(Math.random() * 5) + 1,
      tags: template.tags,
      isHot: Math.random() > 0.7, // 30% 的新闻是热门
      viewCount: Math.floor(Math.random() * 10000) + 100,
      likeCount: Math.floor(Math.random() * 500) + 10,
      url: `https://example.com/news/${i + 1}`
    });
  }

  // 按时间排序
  return mockNews.sort((a, b) => b.timestamp - a.timestamp);
};

export class NewsApiService {
  private static baseUrl = '/api/news'; // Future API endpoint

  /**
   * 获取新闻列表
   */
  static async fetchNews(filters?: {
    category?: string;
    limit?: number;
    offset?: number;
    isHot?: boolean;
  }): Promise<{ news: NewsItem[]; total: number }> {
    try {
      // TODO: Uncomment when real API is available
      // const params = new URLSearchParams();
      // if (filters?.category) params.append('category', filters.category);
      // if (filters?.limit) params.append('limit', filters.limit.toString());
      // if (filters?.offset) params.append('offset', filters.offset.toString());
      // if (filters?.isHot) params.append('isHot', 'true');
      // 
      // const response = await fetch(`${this.baseUrl}?${params}`);
      // if (!response.ok) {
      //   throw new Error(`API request failed: ${response.status}`);
      // }
      // return await response.json();

      // Mock implementation
      await this.simulateNetworkDelay();
      
      let allNews = generateMockNewsData();
      
      // 应用筛选条件
      if (filters?.category && filters.category !== 'all') {
        allNews = allNews.filter(news => 
          news.category.toLowerCase() === filters.category?.toLowerCase()
        );
      }
      
      if (filters?.isHot) {
        allNews = allNews.filter(news => news.isHot);
      }
      
      const total = allNews.length;
      const offset = filters?.offset || 0;
      const limit = filters?.limit || 20;
      
      const news = allNews.slice(offset, offset + limit);
      
      return { news, total };
    } catch (error) {
      console.error('Failed to fetch news:', error);
      throw new Error('Unable to load news data');
    }
  }

  /**
   * 获取单篇新闻详情
   */
  static async fetchNewsById(newsId: string): Promise<NewsItem | null> {
    try {
      // TODO: Uncomment when real API is available
      // const response = await fetch(`${this.baseUrl}/${newsId}`);
      // if (!response.ok) {
      //   if (response.status === 404) return null;
      //   throw new Error(`API request failed: ${response.status}`);
      // }
      // return await response.json();

      // Mock implementation
      await this.simulateNetworkDelay();
      
      const allNews = generateMockNewsData();
      return allNews.find(news => news.id === newsId) || null;
    } catch (error) {
      console.error('Failed to fetch news details:', error);
      throw new Error('Unable to load news details');
    }
  }

  /**
   * 获取新闻分类
   */
  static async fetchNewsCategories(): Promise<NewsCategory[]> {
    try {
      // Mock implementation
      await this.simulateNetworkDelay();
      
      const { news } = await this.fetchNews();
      const categoryCount: Record<string, number> = {};
      
      news.forEach(item => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      });
      
      const categories: NewsCategory[] = [
        { id: 'all', name: 'All', count: news.length, active: true },
        { id: 'hot', name: 'Hot', count: news.filter(n => n.isHot).length, active: false }
      ];
      
      Object.entries(categoryCount).forEach(([category, count]) => {
        categories.push({
          id: category.toLowerCase(),
          name: category,
          count,
          active: false
        });
      });
      
      return categories;
    } catch (error) {
      console.error('Failed to fetch news categories:', error);
      throw new Error('Unable to load news categories');
    }
  }

  /**
   * 搜索新闻
   */
  static async searchNews(query: string): Promise<NewsItem[]> {
    try {
      // TODO: Real API implementation
      
      const { news } = await this.fetchNews();
      return news.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.content.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    } catch (error) {
      console.error('Failed to search news:', error);
      throw new Error('Unable to search news');
    }
  }

  /**
   * 获取热门新闻
   */
  static async fetchHotNews(limit: number = 10): Promise<NewsItem[]> {
    try {
      const { news } = await this.fetchNews({ isHot: true, limit });
      return news;
    } catch (error) {
      console.error('Failed to fetch hot news:', error);
      throw new Error('Unable to load hot news');
    }
  }

  /**
   * 模拟网络延迟
   */
  private static simulateNetworkDelay(): Promise<void> {
    const delay = Math.random() * 300 + 100; // 100-400ms delay
    return new Promise(resolve => setTimeout(resolve, delay));
  }
} 