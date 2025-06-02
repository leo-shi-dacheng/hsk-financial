import { useState, useEffect } from "react";

import { Breadcrumbs, HeadingText } from "@ui";

import { NewsApiService, type NewsItem } from "../../services/newsApi";

interface NewsDetailProps {
  newsId: string;
}

const NewsDetail: React.FC<NewsDetailProps> = ({ newsId }) => {
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const loadNewsDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const newsData = await NewsApiService.fetchNewsById(newsId);
        if (!newsData) {
          setError('News not found');
          return;
        }
        
        setNews(newsData);
        
        // 加载相关新闻（同分类的其他新闻）
        const { news: allNews } = await NewsApiService.fetchNews({
          category: newsData.category,
          limit: 5
        });
        const related = allNews.filter(item => item.id !== newsId);
        setRelatedNews(related);
        
      } catch (err) {
        console.error('Error loading news detail:', err);
        setError(err instanceof Error ? err.message : 'Failed to load news details');
      } finally {
        setLoading(false);
      }
    };

    loadNewsDetail();
  }, [newsId]);

  const formatFullDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShare = () => {
    if (!news) return;
    
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.summary,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${news.title}\n${window.location.href}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <span className="ml-4 text-lg">Loading news details...</span>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
        <Breadcrumbs links={["Platform", "News", "Detail"]} />
        
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-red-400 mb-4">
            <p className="text-xl font-semibold">Error loading news</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-accent-800 hover:bg-accent-700 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
      <Breadcrumbs links={["Platform", "News", news.title.substring(0, 30) + "..."]} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 主要内容 */}
        <div className="lg:col-span-2">
          {/* 文章头部 */}
          <div className="bg-accent-950 rounded-[24px] p-8 mb-6">
            {/* 分类和热门标签 */}
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-accent-700 text-neutral-300 text-sm rounded-lg">
                {news.category}
              </span>
              {news.isHot && (
                <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full">
                  热门
                </span>
              )}
            </div>
            
            {/* 标题 */}
            <HeadingText text={news.title} scale={1} />
            
            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-neutral-400">
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>{formatFullDate(news.timestamp)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📰</span>
                <span>{news.source}</span>
              </div>
              {news.author && (
                <div className="flex items-center gap-2">
                  <span>✍️</span>
                  <span>{news.author}</span>
                </div>
              )}
              {news.readTime && (
                <div className="flex items-center gap-2">
                  <span>⏱️</span>
                  <span>{news.readTime} 分钟阅读</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span>👁️</span>
                <span>{news.viewCount?.toLocaleString()} 次阅读</span>
              </div>
            </div>
            
            {/* 分享按钮 */}
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-accent-800">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-accent-800 hover:bg-accent-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span>分享</span>
              </button>
              
              {news.url && (
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-accent-800 hover:bg-accent-700 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>原文链接</span>
                </a>
              )}
            </div>
          </div>
          
          {/* 文章内容 */}
          <div className="bg-accent-950 rounded-[24px] p-8">
            <div className="prose prose-invert max-w-none">
              <div className="text-neutral-300 leading-relaxed text-lg whitespace-pre-wrap">
                {news.content}
              </div>
            </div>
            
            {/* 标签 */}
            <div className="mt-8 pt-6 border-t border-accent-800">
              <h4 className="text-lg font-semibold mb-4">相关标签</h4>
              <div className="flex flex-wrap gap-2">
                {news.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-accent-700 text-neutral-300 text-sm rounded-lg hover:bg-accent-600 cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* 侧边栏 */}
        <div className="lg:col-span-1">
          {/* 相关新闻 */}
          {relatedNews.length > 0 && (
            <div className="bg-accent-950 rounded-[24px] p-6">
              <h3 className="text-xl font-semibold mb-6">相关新闻</h3>
              <div className="space-y-4">
                {relatedNews.map((relatedItem) => (
                  <div key={relatedItem.id} className="group">
                    <a 
                      href={`/news/${relatedItem.id}`}
                      className="block p-4 bg-accent-900 rounded-lg hover:bg-accent-800 transition-colors"
                    >
                      <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors mb-2 line-clamp-2">
                        {relatedItem.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-neutral-500">
                        <span>{relatedItem.source}</span>
                        <span>{new Date(relatedItem.timestamp).toLocaleDateString()}</span>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 统计信息 */}
          <div className="bg-accent-950 rounded-[24px] p-6 mt-6">
            <h3 className="text-xl font-semibold mb-6">文章统计</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">阅读次数</span>
                <span className="font-semibold">{news.viewCount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">点赞数</span>
                <span className="font-semibold">{news.likeCount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">发布时间</span>
                <span className="font-semibold">{new Date(news.timestamp).toLocaleDateString()}</span>
              </div>
              {news.readTime && (
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">预计阅读</span>
                  <span className="font-semibold">{news.readTime} 分钟</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { NewsDetail }; 