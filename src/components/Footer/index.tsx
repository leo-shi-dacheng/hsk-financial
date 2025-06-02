// 模拟理财产品数据 (包括博时基金等)
const mockFinancialProducts = [
  { name: "博时主题行业", code: "160505", price: 2.845, change: "+1.24%", type: "fund" },
  { name: "博时价值增长", code: "050001", price: 0.7820, change: "-0.32%", type: "fund" },
  { name: "博时新兴增长", code: "050009", price: 0.6140, change: "+0.65%", type: "fund" },
  { name: "博时精选混合", code: "050004", price: 1.2340, change: "+0.88%", type: "fund" },
  { name: "上证指数", code: "000001", price: 3021.34, change: "+0.58%", type: "index" },
  { name: "深证成指", code: "399001", price: 10234.56, change: "+0.75%", type: "index" },
  { name: "恒生指数", code: "HSI", price: 19832.45, change: "-0.21%", type: "index" },
  { name: "纳斯达克", code: "NASDAQ", price: 14758.67, change: "+1.15%", type: "index" },
  { name: "标普500", code: "SPX", price: 4567.89, change: "+0.88%", type: "index" },
  { name: "易方达蓝筹", code: "005827", price: 1.6523, change: "+0.45%", type: "fund" },
  { name: "华夏回报", code: "002001", price: 1.4280, change: "-0.18%", type: "fund" },
  { name: "招商白酒", code: "161725", price: 0.8456, change: "+2.34%", type: "fund" },
  { name: "天弘余额宝", code: "000198", price: 1.0000, change: "+0.01%", type: "fund" },
  { name: "中证500", code: "000905", price: 6234.12, change: "+0.58%", type: "index" },
];

const PriceTicker = (): JSX.Element => {
  return (
    <div className="bg-black text-white text-xs py-1.5 px-4 overflow-hidden border-t border-gray-800">
      <div className="flex">
        <div className="flex whitespace-nowrap space-x-8 animate-marquee-slow">
          {/* 复制数组以确保无缝滚动 */}
          {mockFinancialProducts.concat(mockFinancialProducts).map((product, index) => (
            <div 
              key={index} 
              className="flex items-center space-x-2 min-w-fit"
            >
              <span className="text-gray-400">{product.name}:</span>
              <span className="font-semibold">${product.price}</span>
              <span 
                className={`text-xs ${
                  product.change.startsWith('+') 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}
              >
                {product.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Footer = (): JSX.Element => {
  return (
    <footer className="shrink-0">
    
      
      {/* 原有的社交媒体链接 */}
      <div className="flex items-center justify-end py-5 px-8">
        <a
          className="px-3 py-2"
          target="_blank"
          href="https://github.com/HashkeyHSK"
          title="GitHub"
        >
          <img src="/socials/github.svg" alt="GitHub" className="w-4 h-4" />
        </a>
        <a
          className="px-3 py-2"
          target="_blank"
          href="https://x.com/HSKChain"
          title="X"
        >
          <img src="/socials/x.svg" alt="X" className="w-4 h-4" />
        </a>
        <a
          className="px-3 py-2"
          target="_blank"
          href="https://t.me/HashKeyChainHSK"
          title="Telegram"
        >
          <img src="/socials/telegram.svg" alt="Telegram" className="w-4 h-4" />
        </a>
        <a
          className="px-3 py-2"
          target="_blank"
          href="https://discord.com/invite/qvPkbrYY"
          title="Discord"
        >
          <img src="/socials/discord.svg" alt="Discord" className="w-4 h-4" />
        </a>
        {/* <a
          className="px-3 py-2"
          target="_blank"
          href="https://stabilitydao.gitbook.io/"
          title="Stability Book"
        >
          <img src="/socials/gitbook.svg" alt="GitBook" className="w-4 h-4" />
        </a> */}
      </div>

        {/* 价格滚动条 */}
        <PriceTicker />
    </footer>
  );
};

export { Footer };
