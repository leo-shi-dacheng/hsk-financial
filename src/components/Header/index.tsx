import { useState, useEffect } from "react";

import { Wallet } from "./Wallet";

import { WagmiLayout } from "@layouts";

import "./header.css";

// 市场数据组件
const MarketData = (): JSX.Element => {
  const [marketData, setMarketData] = useState({
    totalMarketCap: { value: 3559.81, change: -1.73 },
    volume24h: 117.22,
    btcFee: 1,
    ethGas: 2.87
  });

  // 模拟数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => ({
        ...prev,
        totalMarketCap: {
          value: prev.totalMarketCap.value + (Math.random() - 0.5) * 10,
          change: (Math.random() - 0.5) * 4
        },
        volume24h: prev.volume24h + (Math.random() - 0.5) * 5,
        btcFee: Math.max(1, prev.btcFee + (Math.random() - 0.5) * 0.2),
        ethGas: Math.max(1, prev.ethGas + (Math.random() - 0.5) * 0.5)
      }));
    }, 10000); // 每10秒更新一次

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black text-white text-xs py-1.5 px-4 flex items-center justify-between border-b border-gray-800">
      <div className="flex items-center space-x-6">
        {/* Market Cap */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">Total MarketCap:</span>
          <span className="font-semibold">${marketData.totalMarketCap.value.toFixed(2)}B</span>
          <span className={`text-xs ${marketData.totalMarketCap.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {marketData.totalMarketCap.change >= 0 ? '+' : ''}{marketData.totalMarketCap.change.toFixed(2)}%
          </span>
        </div>

        {/* 24H Volume */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">24H Vol:</span>
          <span className="font-semibold">${marketData.volume24h.toFixed(2)}B</span>
        </div>

        {/* BTC Fee */}
        <div className="flex items-center space-x-2">
          <img src="/gas.svg" alt="BTC" className="w-3 h-3" />
          <span className="text-orange-400">BTC:</span>
          <span className="font-semibold">{marketData.btcFee.toFixed(0)} sat/vB</span>
        </div>

        {/* ETH Gas */}
        <div className="flex items-center space-x-2">
          <img src="/gas.svg" alt="ETH" className="w-3 h-3" />
          <span className="text-blue-400">ETH:</span>
          <span className="font-semibold">{marketData.ethGas.toFixed(2)} Gwei</span>
        </div>
      </div>

      {/* 时间戳 */}
      <div className="text-gray-500 text-xs">
        Updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

const Header = (): JSX.Element => {
  const pathname = window.location.pathname;
  const currentPath = pathname.slice(1); // remove the first "/"

  const [menu, setMenu] = useState(false);

  const isVaults = currentPath.includes("vault");
  const isNews = currentPath === "news" || currentPath.includes("news");

  return (
    <WagmiLayout>
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* 市场数据条 */}
        <MarketData />
        
        {/* 主Header */}
        <header className="font-manrope bg-accent-950 md:bg-transparent rounded-b-[16px] relative px-5">
          <a data-testid="hashkey-logo" href="/" title="hashkey">
            <img
              className="w-[105px] h-[48px] md:w-[140px] md:h-[60px] ml-[15px]"
              src="/logo.svg"
              alt="hashkey logo"
            />
          </a>
          <div className="menu absolute left-1/2 transform -translate-x-1/2 text-[16px]">
            <a
              data-testid="vaults-link"
              className={isVaults ? "active" : ""}
              href="/vaults"
            >
              Vaults
            </a>
            <a
              className={
                currentPath === "assets" || currentPath.includes("contests")
                  ? "active"
                  : ""
              }
              href="/assets"
            >
              Assets
            </a>
            <a className={currentPath === "strategies" ? "active" : ""} href="/strategies">
              Strategies
            </a>
            <a className={isNews ? "active" : ""} href="/news">
              News
            </a>
            <a className={currentPath === "platform" ? "active" : ""} href="/platform">
              Platform
            </a>
          </div>
          <div className="flex justify-end mr-[15px] gap-3">
            <Wallet />
            <div className="burger-menu" onClick={() => setMenu((prev) => !prev)}>
              {menu ? (
                <img className="w-4 h-4" src="/close.svg" alt="close" />
              ) : (
                <img className="w-4 h-4" src="/menu.svg" alt="menu" />
              )}
            </div>
          </div>
          <nav className={`menu-nav text-center gap-3 ${menu && "active"}`}>
            <a
              className={`px-4 py-[10px] font-semibold ${isVaults ? "bg-accent-800 rounded-[16px]" : ""}`}
              href="/vaults"
            >
              Vaults
            </a>
            <a
              className={`px-4 py-[10px] font-semibold ${currentPath === "assets" || currentPath.includes("contests") ? "bg-accent-800 rounded-[16px]" : ""}`}
              href="/assets"
            >
              Assets
            </a>
            <a
              className={`px-4 py-[10px] font-semibold ${currentPath === "strategies" ? "bg-accent-800 rounded-[16px]" : ""}`}
              href="/strategies"
            >
              Strategies
            </a>
            <a
              className={`px-4 py-[10px] font-semibold ${isNews ? "bg-accent-800 rounded-[16px]" : ""}`}
              href="/news"
            >
              News
            </a>
            <a
              className={`px-4 py-[10px] font-semibold ${currentPath === "platform" ? "bg-accent-800 rounded-[16px]" : ""}`}
              href="/platform"
            >
              Platform
            </a>
          </nav>
        </header>
      </div>
      
      {/* 添加顶部间距以避免内容被固定header遮挡 */}
      <div className="h-[100px]"></div>
    </WagmiLayout>
  );
};

export { Header };
