import { useState, useEffect } from "react";

import { Breadcrumbs, HeadingText } from "@ui";

import { NewsApiService, type NewsItem, type NewsCategory } from "../../services/newsApi";

// 新闻条目组件
const NewsListItem: React.FC<{ 
  news: NewsItem; 
  index: number;
  onShare: (news: NewsItem) => void;
}> = ({ news, index, onShare }) => {
  const formatTime = (timestamp: number) => {
    const now = new Date();
    const newsDate = new Date(timestamp);
    const diffHours = Math.floor((now.getTime() - newsDate.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return "刚刚";
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else {
      const days = Math.floor(diffHours / 24);
      return `${days}天前`;
    }
  };

  return (
    <div className="flex items-start gap-4 py-4 px-6 hover:bg-accent-950 transition-colors border-b border-accent-800 last:border-b-0">
      {/* 序号 */}
      <div className="flex-shrink-0 w-8 h-8 bg-accent-800 rounded-full flex items-center justify-center text-sm font-medium">
        {index}
      </div>
      
      {/* 新闻内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* 标题和热门标签 */}
            <div className="flex items-start gap-2 mb-2">
              <a 
                href={`/news/${news.id}`}
                className="flex-1"
              >
                <h3 className="text-white font-medium leading-relaxed hover:text-blue-400 cursor-pointer transition-colors">
                  {news.title}
                </h3>
              </a>
              {news.isHot && (
                <span className="flex-shrink-0 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  热门
                </span>
              )}
            </div>
            
            {/* 摘要 */}
            {news.summary && (
              <p className="text-neutral-400 text-sm mb-2 line-clamp-2">
                {news.summary}
              </p>
            )}
            
            {/* 标签 */}
            <div className="flex flex-wrap gap-2 mb-2">
              {news.tags.slice(0, 3).map((tag, tagIndex) => (
                <span 
                  key={tagIndex}
                  className="px-2 py-1 bg-accent-700 text-neutral-300 text-xs rounded-lg"
                >
                  #{tag}
                </span>
              ))}
            </div>
            
            {/* 元信息 */}
            <div className="flex items-center gap-4 text-xs text-neutral-500">
              <span>{news.source}</span>
              <span>{formatTime(news.timestamp)}</span>
              {news.readTime && <span>{news.readTime}分钟阅读</span>}
              <span>{news.viewCount?.toLocaleString()} 次阅读</span>
            </div>
          </div>
          
          {/* 分享按钮 */}
          <button
            onClick={() => onShare(news)}
            className="flex-shrink-0 p-2 text-neutral-400 hover:text-white hover:bg-accent-800 rounded-lg transition-colors"
            title="分享"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// 分类筛选组件
const CategoryFilter: React.FC<{
  categories: NewsCategory[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}> = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="bg-accent-950 rounded-[24px] p-6 mb-6">
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === category.id
                ? 'bg-blue-500 text-white'
                : 'bg-accent-800 text-neutral-300 hover:bg-accent-700 hover:text-white'
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>
    </div>
  );
};

// 主新闻页面组件
const News = (): JSX.Element => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // 加载新闻数据
  const loadNews = async (categoryId: string = 'all', offset: number = 0, append: boolean = false) => {
    try {
      if (!append) setLoading(true);
      setError(null);
      
      const filters: any = {
        limit: 20,
        offset
      };
      
      if (categoryId === 'hot') {
        filters.isHot = true;
      } else if (categoryId !== 'all') {
        filters.category = categoryId;
      }
      
      const { news: newNews, total } = await NewsApiService.fetchNews(filters);
      
      if (append) {
        setNews(prev => [...prev, ...newNews]);
      } else {
        setNews(newNews);
      }
      
      setHasMore(offset + newNews.length < total);
    } catch (err) {
      console.error('Error loading news:', err);
      setError(err instanceof Error ? err.message : 'Failed to load news');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 加载分类
  const loadCategories = async () => {
    try {
      const categoriesData = await NewsApiService.fetchNewsCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  // 初始化
  useEffect(() => {
    loadCategories();
    loadNews();
  }, []);

  // 切换分类
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    loadNews(categoryId);
  };

  // 加载更多
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      loadNews(activeCategory, news.length, true);
    }
  };

  // 分享新闻
  const handleShare = (newsItem: NewsItem) => {
    if (navigator.share) {
      navigator.share({
        title: newsItem.title,
        text: newsItem.summary,
        url: window.location.href
      });
    } else {
      // fallback: 复制到剪贴板
      navigator.clipboard.writeText(`${newsItem.title}\n${window.location.href}`);
      // 这里可以添加一个提示消息
    }
  };

  // 获取当前时间显示
  const getCurrentTimeDisplay = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    };
    return now.toLocaleDateString('zh-CN', options);
  };

  if (loading && news.length === 0) {
    return (
      <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
        <div className="hidden">
          <Breadcrumbs links={["Platform", "News"]} />
          <HeadingText text="Web3 News" scale={1} />
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <span className="ml-4 text-lg">Loading news...</span>
        </div>
      </div>
    );
  }

  if (error && news.length === 0) {
    return (
      <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
        <div className="hidden">
          <Breadcrumbs links={["Platform", "News"]} />
          <HeadingText text="Web3 News" scale={1} />
        </div>
        
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-red-400 mb-4">
            <p className="text-xl font-semibold">Error loading news</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <button 
            onClick={() => loadNews(activeCategory)}
            className="px-4 py-2 bg-accent-800 hover:bg-accent-700 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
      <div className="hidden">
        <Breadcrumbs links={["Platform", "News"]} />
        <HeadingText text="Web3 News" scale={1} />
      </div>

      {/* 页面标题 */}
      <div className="bg-accent-950 rounded-[24px] p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Web3 资讯市场</h1>
            <p className="text-neutral-400 text-lg">{getCurrentTimeDisplay()}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm rounded-full font-medium">
              🤖 AI 热点总结
            </span>
            <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full font-medium">
              实时更新
            </span>
          </div>
        </div>
      </div>

      {/* 分类筛选 */}
      <CategoryFilter 
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* 新闻列表 */}
      <div className="bg-accent-950 rounded-[24px] overflow-hidden">
        {news.length > 0 ? (
          <>
            {news.map((newsItem, index) => (
              <NewsListItem
                key={newsItem.id}
                news={newsItem}
                index={index + 1}
                onShare={handleShare}
              />
            ))}
            
            {/* 加载更多按钮 */}
            {hasMore && (
              <div className="p-6 text-center border-t border-accent-800">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-accent-800 hover:bg-accent-700 disabled:opacity-50 rounded-lg transition-colors"
                >
                  {loadingMore ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-neutral-400">
            <p className="text-lg">No news found</p>
            <p className="text-sm mt-2">Try adjusting your filters or check back later</p>
          </div>
        )}
      </div>
    </div>
  );
};

export { News }; 