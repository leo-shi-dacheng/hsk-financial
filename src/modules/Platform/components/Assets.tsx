import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import {getAsset} from "@stabilitydao/stability";

import { sortTable, formatNumber } from "@utils";

import { Breadcrumbs, TableColumnSort, HeadingText, Checkbox } from "@ui";

import {assetsPrices} from "@store";

import { ASSETS_TABLE } from "@constants";

import tokenlist from "./tokenlist.json";

import type { TTableColumn, TAssetData } from "@types";

import clsx from "clsx";

// tag 颜色映射
const TAG_COLORS: Record<string, string> = {
  Stablecoin: "bg-blue-100 text-blue-800",
  Bridged: "bg-green-100 text-green-800",
  USD: "bg-yellow-100 text-yellow-800",
  ETH: "bg-purple-100 text-purple-800",
  // 其他tag...
  default: "bg-gray-200 text-gray-800"
};


const assets = [
  {
    "addresses": {
        "1": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "10": "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        "56": "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        "137": [
            "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359"
        ],
        "146": "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
        "8453": [
            "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
            "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
        ],
        "42161": [
            "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
            "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"
        ],
        "42420": "0x2B7C1342Cc64add10B2a79C8f9767d2667DE64B2",
        "43114": "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        "111188": "0xc518A88c67CECA8B3f24c4562CB71deeB2AF86B7",
        "534352": "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4"
    },
    "symbol": "USDC",
    "description": "USDC is a fully-reserved stablecoin, which is a type of cryptocurrency, or digital asset.",
    "website": "https://www.circle.com/en/usdc",
    "color": "#3b87df"
  },
  {
      "addresses": {
          "1": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
          "10": "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
          "56": "0x55d398326f99059fF775485246999027B3197955",
          "137": "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
          "8453": "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
          "42161": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
          "42420": "0x26E490d30e73c36800788DC6d6315946C4BbEa24",
          "43114": "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
          "534352": "0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df"
      },
      "symbol": "USDT",
      "description": "Tether (USDT) is a cryptocurrency with a value meant to mirror the value of the U.S. dollar.",
      "website": "https://tether.to/en/",
      "color": "#5bc7af"
  },
  {
      "addresses": {
          "1": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          "10": "0x4200000000000000000000000000000000000006",
          "56": "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
          "137": "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
          "146": "0x50c42dEAcD8Fc9773493ED674b675bE577f2634b",
          "8453": "0x4200000000000000000000000000000000000006",
          "42161": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
          "42420": "0xbe231A8492487aAe6096278A97050FAe6B9d5BEc",
          "43114": "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
          "81457": "0x4300000000000000000000000000000000000004",
          "534352": "0x5300000000000000000000000000000000000004"
      },
      "symbol": "WETH",
      "description": "WETH is an ERC-20 token that represents 1 Ether (ETH)",
      "website": "https://ethereum.org",
      "color": "#6372a2"
  }
]
const Assets = (): JSX.Element => {
  const $assetsPrices = useStore(assetsPrices);

  const [tableStates, setTableStates] = useState(ASSETS_TABLE);
  const [tableData, setTableData] = useState<TAssetData[]>([]);
  const [filteredTableData, setFilteredTableData] = useState<TAssetData[]>([]);

  const [isStablecoins, setIsStablecoins] = useState<boolean>(false);

  const tableHandler = () => {
    let data = tableData;

    if (isStablecoins) {
      data = filteredTableData.filter((asset) =>
        tokenlist.tokens
          .find((token) => token.symbol === asset.symbol)
          ?.tags?.includes("stablecoin")
      );
    }

    sortTable({
      table: tableStates,
      setTable: setTableStates,
      tableData: data,
      setTableData: setFilteredTableData,
    });
  };

  const initTableData = async () => {
    console.log(assets, 'assets');
    console.log($assetsPrices, '$assetsPrices');
    if (assets && $assetsPrices) {
      const allPrices = Object.values($assetsPrices).reduce((acc, cur) => {
        return { ...acc, ...cur };
      }, {});

      // sonic tokenlist
      // todo get chainId from web3 state

      const tokenlistItems = tokenlist.tokens
        .filter(token => token.chainId.toString() == '146')

      const assetsData: TAssetData[] = tokenlistItems.map(item => {
        const assetPrice = allPrices[item.address.toLowerCase() as string]?.price || "0";
        const asset = getAsset(item.chainId.toString(), item.address as `0x${string}`)
        return {
          symbol: item.symbol,
          website: asset?.website || '',
          price: Number(assetPrice),
          // @ts-ignore
          tags: (item.tags as string[])?.map(tag => tokenlist.tags[tag]?.name),
          img: item.logoURI,
        };
      })

      setTableData(assetsData);
      setFilteredTableData(assetsData);
    }
  };

  useEffect(() => {
    tableHandler();
  }, [isStablecoins]);

  useEffect(() => {
    initTableData();
  }, [$assetsPrices]);

  return (
    <div className="max-w-[1200px] w-full xl:min-w-[1200px] px-6 py-6">
      <div className="hidden">
        <Breadcrumbs links={["Platform", "Assets"]} />

        <HeadingText text="Hashkey Assets" scale={1} styles="mb-0" />
      </div>
      

      {/* <div className="mb-4 flex justify-center">
        {tokenlist.name} {`${tokenlist.version.major}.${tokenlist.version.minor}.${tokenlist.version.patch}`} from {(new Date(Date.parse(tokenlist.timestamp)).toLocaleDateString())}
      </div> */}

      <div className="flex items-center justify-start mb-3 select-none font-manrope text-[14px] font-semibold">
        <label className="inline-flex items-center cursor-pointer bg-accent-900 h-10 rounded-2xl">
          <div className="flex items-center gap-[10px] py-[10px] px-4">
            <Checkbox
              checked={isStablecoins}
              onChange={() => setIsStablecoins((prev) => !prev)}
            />
            <span className="text-neutral-50">Stablecoins</span>
          </div>
        </label>
      </div>

      <table className="font-sora w-full border-separate border-spacing-y-2">
        <thead className="bg-accent-950 text-neutral-600 h-[44px]">
          <tr className="text-[13px] uppercase">
            {tableStates.map((value: TTableColumn, index: number) => (
              <TableColumnSort
                key={value.name + index}
                index={index}
                value={value.name}
                sort={sortTable}
                table={tableStates}
                setTable={setTableStates}
                tableData={filteredTableData}
                setTableData={setFilteredTableData}
             />
            ))}
          </tr>
        </thead>
        <tbody className="text-[15px]">
          {!!filteredTableData.length &&
            filteredTableData.map(({ symbol, price, website, tags, img }) => (
              <tr
                className="h-[56px] hover:bg-accent-950 rounded-xl"
                key={symbol}
              >
                <td className="pl-6 py-4 w-[260px]">
                  <div className="flex items-center gap-3">
                    <img src={img} className="w-[28px] h-[28px] rounded-full" alt={symbol} />
                    <span className="font-bold">{symbol}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-end min-w-[80px]" style={price == 0 ? { color: 'red' } : {}}>
                  <span className="mr-[10px]">${formatNumber(price, price < 1 ? "smallNumbers" : "format")}</span>
                </td>
                <td className="px-4 py-4">
                  {tags?.map(tag => (
                    <span
                      key={tag}
                      className={clsx(
                        "inline-block text-[13px] font-bold px-3 py-[2px] rounded-2xl mx-1",
                        TAG_COLORS[tag] || TAG_COLORS.default
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-4">
                  <a
                    className="flex items-center justify-start"
                    href={website}
                    target="_blank"
                    title="Go to asset website"
                  >
                    <img
                      src="/icons/web.svg"
                      alt="Website"
                      className="w-[20px] mr-1"
                    />
                    {website
                      .replace(/^https:\/\//, '')
                      .replace(/\/$/, '')
                      || ''}
                  </a>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export {Assets};
