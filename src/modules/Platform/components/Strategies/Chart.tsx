import React, { useEffect, useRef, useState } from 'react';

interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartProps {
  data: CandlestickData[];
  width?: number;
  height?: number;
  className?: string;
}

// 生成模拟 K 线数据
const generateMockCandlestickData = (days: number = 30): CandlestickData[] => {
  const data: CandlestickData[] = [];
  const now = Date.now();
  let lastClose = 100; // 起始价格

  for (let i = days - 1; i >= 0; i--) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000); // 每日数据
    
    // 模拟价格波动
    const volatility = 0.02; // 2% 波动率
    const trend = (Math.random() - 0.5) * 0.01; // 轻微趋势
    
    const open = lastClose * (1 + (Math.random() - 0.5) * volatility);
    const close = open * (1 + trend + (Math.random() - 0.5) * volatility);
    
    const high = Math.max(open, close) * (1 + Math.random() * volatility);
    const low = Math.min(open, close) * (1 - Math.random() * volatility);
    
    const volume = Math.random() * 1000000 + 500000;
    
    data.push({
      timestamp,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(volume)
    });
    
    lastClose = close;
  }
  
  return data;
};

const CandlestickChart: React.FC<ChartProps> = ({ 
  data, 
  width = 800, 
  height = 400, 
  className = "" 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCandle, setHoveredCandle] = useState<CandlestickData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除画布
    ctx.clearRect(0, 0, width, height);

    // 计算价格范围
    const prices = data.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // 设置边距
    const margin = { top: 20, right: 60, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // 计算每根蜡烛的宽度
    const candleWidth = chartWidth / data.length;
    const candleBodyWidth = candleWidth * 0.7;

    // 价格到像素的转换函数
    const priceToY = (price: number) => 
      margin.top + (maxPrice - price) / priceRange * chartHeight;

    // 绘制网格线
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    
    // 水平网格线
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange / 5) * i;
      const y = priceToY(price);
      
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(width - margin.right, y);
      ctx.stroke();
      
      // 价格标签
      ctx.fillStyle = '#888';
      ctx.font = '12px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(2), margin.left - 10, y + 4);
    }

    // 垂直网格线（时间）
    for (let i = 0; i < data.length; i += Math.ceil(data.length / 6)) {
      const x = margin.left + i * candleWidth + candleWidth / 2;
      
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, height - margin.bottom);
      ctx.stroke();
      
      // 时间标签
      const date = new Date(data[i].timestamp);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      ctx.fillStyle = '#888';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(dateStr, x, height - margin.bottom + 20);
    }

    // 绘制蜡烛图
    data.forEach((candle, index) => {
      const x = margin.left + index * candleWidth + candleWidth / 2;
      const openY = priceToY(candle.open);
      const closeY = priceToY(candle.close);
      const highY = priceToY(candle.high);
      const lowY = priceToY(candle.low);
      
      const isGreen = candle.close > candle.open;
      
      // 设置颜色
      const bodyColor = isGreen ? '#00ff88' : '#ff4757';
      const wickColor = '#888';
      
      // 绘制影线（上下影线）
      ctx.strokeStyle = wickColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();
      
      // 绘制实体
      ctx.fillStyle = bodyColor;
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 1;
      
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY);
      
      if (bodyHeight < 1) {
        // 十字星或者很小的实体，画线
        ctx.beginPath();
        ctx.moveTo(x - candleBodyWidth / 2, openY);
        ctx.lineTo(x + candleBodyWidth / 2, openY);
        ctx.stroke();
      } else {
        // 正常实体
        ctx.fillRect(
          x - candleBodyWidth / 2, 
          bodyTop, 
          candleBodyWidth, 
          bodyHeight
        );
      }
    });

  }, [data, width, height]);

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;

    setMousePosition({ x: event.clientX, y: event.clientY });

    // 计算鼠标悬停的蜡烛
    const margin = { top: 20, right: 60, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const candleWidth = chartWidth / data.length;
    
    const candleIndex = Math.floor((x - margin.left) / candleWidth);
    
    if (candleIndex >= 0 && candleIndex < data.length) {
      setHoveredCandle(data[candleIndex]);
    } else {
      setHoveredCandle(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCandle(null);
  };

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-accent-800 rounded-lg bg-accent-950 cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      
      {/* 悬停信息提示 */}
      {hoveredCandle && (
        <div 
          className="absolute z-10 bg-accent-900 border border-accent-700 rounded-lg p-3 text-sm pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 120,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="font-semibold mb-2">
            {new Date(hoveredCandle.timestamp).toLocaleDateString()}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <span className="text-neutral-400">Open:</span>
            <span>${hoveredCandle.open.toFixed(2)}</span>
            <span className="text-neutral-400">High:</span>
            <span className="text-green-400">${hoveredCandle.high.toFixed(2)}</span>
            <span className="text-neutral-400">Low:</span>
            <span className="text-red-400">${hoveredCandle.low.toFixed(2)}</span>
            <span className="text-neutral-400">Close:</span>
            <span className={hoveredCandle.close > hoveredCandle.open ? 'text-green-400' : 'text-red-400'}>
              ${hoveredCandle.close.toFixed(2)}
            </span>
            <span className="text-neutral-400">Volume:</span>
            <span>{hoveredCandle.volume.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const StrategyChart: React.FC<{ strategyId: string }> = ({ strategyId }) => {
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M'>('1M');

  useEffect(() => {
    // 根据时间框架生成不同的数据
    const days = {
      '1D': 1,
      '1W': 7,
      '1M': 30,
      '3M': 90
    }[timeframe];

    const data = generateMockCandlestickData(days);
    setChartData(data);
  }, [timeframe, strategyId]);

  return (
    <div className="bg-accent-950 rounded-[24px] p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-xl font-semibold">Price Chart</h3>
        
        {/* 时间框架选择器 */}
        <div className="flex gap-2">
          {(['1D', '1W', '1M', '3M'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-accent-700 text-white'
                  : 'bg-accent-800 text-neutral-400 hover:bg-accent-700 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <CandlestickChart 
          data={chartData} 
          width={800} 
          height={400}
          className="min-w-[800px]"
        />
      </div>

      {/* 图表说明 */}
      <div className="mt-4 text-sm text-neutral-400 flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded"></div>
          <span>Bullish (Close &gt; Open)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-400 rounded"></div>
          <span>Bearish (Close &lt; Open)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-gray-400"></div>
          <span>High/Low Wicks</span>
        </div>
      </div>
    </div>
  );
};

export { StrategyChart, CandlestickChart };
export type { CandlestickData }; 