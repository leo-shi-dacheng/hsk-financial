import React, { useState, useRef } from 'react';
import './FloatingTokens.css';

interface TokenData {
  symbol: string;
  name: string;
  logoUrl: string;
  price?: number;
  change24h?: number;
}

// 常见项目列表 - 扩展到30个
const POPULAR_TOKENS: TokenData[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    logoUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    logoUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    logoUrl: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    logoUrl: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
  },
  {
    symbol: 'BNB',
    name: 'BNB',
    logoUrl: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  },
  {
    symbol: 'ADA',
    name: 'Cardano',
    logoUrl: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
  },
  {
    symbol: 'MATIC',
    name: 'Polygon',
    logoUrl: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
  },
  {
    symbol: 'DOT',
    name: 'Polkadot',
    logoUrl: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
  },
  {
    symbol: 'AVAX',
    name: 'Avalanche',
    logoUrl: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
  },
  {
    symbol: 'UNI',
    name: 'Uniswap',
    logoUrl: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    logoUrl: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
  },
  {
    symbol: 'AAVE',
    name: 'Aave',
    logoUrl: 'https://assets.coingecko.com/coins/images/12645/large/AAVE.png',
  },
  {
    symbol: 'CRV',
    name: 'Curve DAO',
    logoUrl: 'https://assets.coingecko.com/coins/images/12124/large/Curve.png',
  },
  {
    symbol: 'COMP',
    name: 'Compound',
    logoUrl: 'https://assets.coingecko.com/coins/images/10775/large/COMP.png',
  },
  {
    symbol: 'SUSHI',
    name: 'SushiSwap',
    logoUrl: 'https://assets.coingecko.com/coins/images/12271/large/512x512_Logo_no_chop.png',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    logoUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  },
  {
    symbol: 'XRP',
    name: 'Ripple',
    logoUrl: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    logoUrl: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
  },
  {
    symbol: 'LTC',
    name: 'Litecoin',
    logoUrl: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
  },
  {
    symbol: 'ATOM',
    name: 'Cosmos',
    logoUrl: 'https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png',
  },
  {
    symbol: 'FTM',
    name: 'Fantom',
    logoUrl: 'https://assets.coingecko.com/coins/images/4001/large/Fantom.png',
  },
  {
    symbol: 'ALGO',
    name: 'Algorand',
    logoUrl: 'https://assets.coingecko.com/coins/images/4380/large/download.png',
  },
  {
    symbol: 'VET',
    name: 'VeChain',
    logoUrl: 'https://assets.coingecko.com/coins/images/1167/large/VET_Token_Icon.png',
  },
  {
    symbol: 'ICP',
    name: 'Internet Computer',
    logoUrl: 'https://assets.coingecko.com/coins/images/14495/large/Internet_Computer_logo.png',
  },
  {
    symbol: 'NEAR',
    name: 'NEAR Protocol',
    logoUrl: 'https://assets.coingecko.com/coins/images/10365/large/near_icon.png',
  },
  {
    symbol: 'APE',
    name: 'ApeCoin',
    logoUrl: 'https://assets.coingecko.com/coins/images/24383/large/apecoin.jpg',
  },
  {
    symbol: 'SAND',
    name: 'The Sandbox',
    logoUrl: 'https://assets.coingecko.com/coins/images/12129/large/sandbox_logo.jpg',
  },
  {
    symbol: 'MANA',
    name: 'Decentraland',
    logoUrl: 'https://assets.coingecko.com/coins/images/878/large/decentraland-mana.png',
  },
  {
    symbol: 'LDO',
    name: 'Lido DAO',
    logoUrl: 'https://assets.coingecko.com/coins/images/13573/large/Lido_DAO.png',
  },
  {
    symbol: 'MKR',
    name: 'Maker',
    logoUrl: 'https://assets.coingecko.com/coins/images/1364/large/Mark_Maker.png',
  },
];

interface FloatingTokenProps {
  token: TokenData;
  style: React.CSSProperties;
  isHighlighted: boolean;
  index: number;
}

const FloatingToken: React.FC<FloatingTokenProps> = ({ token, style, isHighlighted, index }) => {
  const tokenRef = useRef<HTMLDivElement>(null);
  const tokenData: TokenData = {
    ...token,
    // 立即设置模拟价格数据，避免等待
    price: Math.random() * 1000 + 1,
    change24h: (Math.random() - 0.5) * 20,
  };

  return (
    <div
      ref={tokenRef}
      className={`floating-token ${isHighlighted ? 'highlighted' : ''}`}
      style={style}
      data-index={index}
    >
      <div className="token-logo">
        <img src={token.logoUrl} alt={token.symbol} />
      </div>
      
      {isHighlighted && (
        <div className="token-tooltip">
          <div className="token-name">{token.name}</div>
          <div className="token-symbol">{token.symbol}</div>
          <div className="token-price">${tokenData.price?.toFixed(2)}</div>
          <div className={`token-change ${tokenData.change24h && tokenData.change24h >= 0 ? 'positive' : 'negative'}`}>
            {tokenData.change24h && tokenData.change24h >= 0 ? '+' : ''}
            {tokenData.change24h?.toFixed(2)}%
          </div>
        </div>
      )}
    </div>
  );
};

export const FloatingTokens: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightedToken, setHighlightedToken] = useState<number>(-1);

  // 为了确保屏幕上始终有足够的代币，我们需要复制代币列表
  const extendedTokens = [...POPULAR_TOKENS, ...POPULAR_TOKENS];

  // 生成循环滚动的位置
  const generateTokenStyle = (index: number): React.CSSProperties => {
    const size = Math.random() * 25 + 40; // 40-65px
    const animationDuration = Math.random() * 10 + 20; // 20-30s 持续时间
    
    // 分布在不同的列
    const cols = 8;
    const col = index % cols;
    
    // X位置：在列中添加随机偏移
    const baseX = (col / (cols - 1)) * 90 + 5; // 5% - 95%
    const offsetX = (Math.random() - 0.5) * 10; // ±5%
    
    // 动画延迟：确保连续效果
    const animationDelay = (index * 1.5) % animationDuration; // 错开时间
    
    return {
      width: `${size}px`,
      height: `${size}px`,
      left: `${Math.max(0, Math.min(95, baseX + offsetX))}%`,
      animationDelay: `${animationDelay}s`,
      animationDuration: `${animationDuration}s`,
    };
  };

  // 计算鼠标到代币的距离
  const calculateDistance = (mouseX: number, mouseY: number, tokenElement: HTMLElement) => {
    const rect = tokenElement.getBoundingClientRect();
    const tokenCenterX = rect.left + rect.width / 2;
    const tokenCenterY = rect.top + rect.height / 2;
    
    return Math.sqrt(
      Math.pow(mouseX - tokenCenterX, 2) + Math.pow(mouseY - tokenCenterY, 2)
    );
  };

  // 处理鼠标移动
  const handleMouseMove = (event: React.MouseEvent) => {
    const { clientX, clientY } = event;
    // console.log(`Mouse move: X=${clientX}, Y=${clientY}`); // 1. Is event firing?

    if (!containerRef.current) {
      console.error('Container ref is not available!'); // 2. Is ref available?
      return;
    }

    const tokenElements = containerRef.current.querySelectorAll('.floating-token');
    // console.log(`Found ${tokenElements.length} token elements.`); // 3. Are tokens being found?

    if (tokenElements.length === 0) return;

    let closestDistance = Infinity;
    let newHighlightedIndex = -1; // Use a different variable name to avoid confusion with state

    tokenElements.forEach((element, domIndex) => { // domIndex is the index in the NodeList
      const tokenElement = element as HTMLElement;
      const actualTokenIndex = parseInt(tokenElement.dataset.index || '-1', 10); // Get the original index

      // console.log('Token DOM Index:', domIndex, 'Actual data-index:', actualTokenIndex); // Check indices

      const rect = tokenElement.getBoundingClientRect();
      const tokenCenterX = rect.left + rect.width / 2;
      const tokenCenterY = rect.top + rect.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(clientX - tokenCenterX, 2) + Math.pow(mouseY - tokenCenterY, 2)
      );

      // console.log(`Token (data-index ${actualTokenIndex}): distance = ${distance.toFixed(2)}, rectTop = ${rect.top.toFixed(2)}`); // 4. Are distances calculated? Are tokens on screen?

      if (distance < closestDistance && distance < 120) { // 120px 范围内才高亮
        closestDistance = distance;
        newHighlightedIndex = actualTokenIndex; // Use the actual index from data-attribute
      }
    });

    // console.log(`Closest token index: ${newHighlightedIndex}, Distance: ${closestDistance.toFixed(2)}`); // 5. Is a closest token being selected?

    if (highlightedToken !== newHighlightedIndex) {
        // console.log(`Setting highlighted token to: ${newHighlightedIndex}`); // 6. Is state update being called?
        setHighlightedToken(newHighlightedIndex);
    }
  };

  // 处理鼠标离开
  const handleMouseLeave = () => {
    setHighlightedToken(-1);
  };

  return (
    <div 
      ref={containerRef}
      className="floating-tokens-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {extendedTokens.map((token, index) => (
        <FloatingToken
          key={`${token.symbol}-${index}`}
          token={token}
          style={generateTokenStyle(index)}
          isHighlighted={highlightedToken === index}
          index={index}
        />
      ))}
    </div>
  );
};

export default FloatingTokens; 