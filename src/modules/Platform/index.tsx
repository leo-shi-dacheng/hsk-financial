import { useEffect, useState, useRef } from "react";
import { useStore } from "@nanostores/react";
import {
  type ApiMainReply,
  assets,
  ChainStatus,
  chainStatusInfo,
  getChainsTotals,
  getStrategiesTotals,
  integrations,
} from "@stabilitydao/stability";
import { formatNumber } from "@utils";
import { CountersBlockCompact } from "@ui";
import { apiData, platformVersions } from "@store";
import { tokenlist } from "@constants";
import { CountUp } from "countup.js";

const platformIcons = [
  <svg className="w-12 h-12 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91 2.28.6 4.18 1.58 4.18 3.91 0 1.77-1.33 2.85-3.12 3.16z"/>
  </svg>,
  <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
  </svg>,
  <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M12,17A2,2 0 0,1 10,15A2,2 0 0,1 12,13A2,2 0 0,1 14,15A2,2 0 0,1 12,17M9,8V6A3,3 0 0,1 12,3A3,3 0 0,1 15,6V8H9Z"/>
  </svg>
];

const platformBg = [
  "bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 hover:from-yellow-100 hover:to-yellow-150",
  "bg-gradient-to-br from-green-50 to-green-100 border border-green-200 hover:from-green-100 hover:to-green-150",
  "bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 hover:from-blue-100 hover:to-blue-150"
];

const Platform = (): JSX.Element => {
  const $currentChainID = "146";
  const $platformVersions = useStore(platformVersions);
  const $apiData: ApiMainReply | undefined = useStore(apiData);

  const chainsTotals = getChainsTotals();
  const strategiesTotals = getStrategiesTotals();

  const [platformData, setPlatformData] = useState([
    {
      name: "HSK",
      content: "",
    },
    {
      name: "Users earned",
      content: "",
    },
    { name: "Vaults", content: "" },
  ]);
  let protocolsTotal = 0;
  for (const defiOrgCode of Object.keys(integrations)) {
    protocolsTotal += Object.keys(integrations[defiOrgCode].protocols).length;
  }

  const strategiesInfo = [
    { name: "Live", value: strategiesTotals.LIVE.toString(), color: "#4FAE2D" },
    {
      name: "Development",
      value: strategiesTotals.DEVELOPMENT.toString(),
      color: "#2D67FB",
    },
    {
      name: "Blocked",
      value: strategiesTotals.BLOCKED.toString(),
      color: "#E01A1A",
    },
    {
      name: "Proposal",
      value: strategiesTotals.PROPOSAL.toString(),
      color: "#FB8B13",
    },
  ];

  const chainsInfo = Object.keys(chainStatusInfo).map((status) => ({
    color: chainStatusInfo[status as ChainStatus].color,
    name: chainStatusInfo[status as ChainStatus].title,
    value: chainsTotals[status as ChainStatus].toString(),
  }));

  const integrationInfo = [
    {
      name: "Organizations",
      value: Object.keys(integrations).length.toString(),
      color: "#612FFB",
    },
    { name: "Protocols", value: protocolsTotal.toString(), color: "#05B5E1" },
  ];

  const assetsInfo = [
    { name: "Assets", value: assets.length.toString(), color: "#E1E114" },
    {
      name: "Tokenlist items",
      value: tokenlist.tokens.length.toString(),
      color: "#2D67FB",
    },
  ];
  //todo: get value from backend
  const swapperInfo = [
    {
      name: "Pools",
      value: "50",
      color: "#2D67FB",
    },
    {
      name: "Blue Chip Pools",
      value: "4",
      color: "#4FAE2D",
    },
  ];

  const countUpRefs = [useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (
      $apiData?.total?.tvl &&
      $apiData?.total.usersEarned &&
      $apiData?.total.activeVaults
    ) {
      setPlatformData([
        {
          name: "HSK",
          content: `\$${formatNumber(69255967, "withSpaces")}`,
        },
        {
          name: "Users earned",
          content: `\$${formatNumber(354657, "withSpaces")}`,
        },
        { name: "Vaults", content: String(108) },
      ]);
    }
  }, [$apiData]);

  useEffect(() => {
    platformData.forEach((item, idx) => {
      if (countUpRefs[idx].current) {
        const num = Number(String(item.content).replace(/[^\d.]/g, "")) || 0;
        new CountUp(countUpRefs[idx].current, num, { duration: 1.2 }).start();
      }
    });
  }, [platformData]);

  return (
    <div className="flex flex-col max-w-[1200px] w-full gap-[24px]">
      <div className="flex flex-wrap justify-center p-[20px] px-0">
        {platformData.map(({ name, content }, idx) => (
          <div
            key={name}
            className={`flex w-full sm:w-6/12 md:w-4/12 lg:w-3/12 min-[1440px]:w-4/12 h-[160px] mx-[8px] mb-[16px] px-[24px] py-[20px] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 items-center justify-center flex-col cursor-pointer ${platformBg[idx]}`}
          >
            <div className="mt-4 transform transition-transform duration-300 hover:scale-110">{platformIcons[idx]}</div>
            <div
              ref={countUpRefs[idx]}
              className="text-[36px] font-black text-gray-800 mb-2"
            >
            </div>
            <div className="flex self-center justify-center text-[16px] font-bold text-gray-700 uppercase tracking-wide">
              {name}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap">
        <CountersBlockCompact
          title="Strategies"
          link="/strategies"
          linkTitle="Go to strategies"
          counters={strategiesInfo}
        />

        <CountersBlockCompact
          title="Assets"
          link=""
          linkTitle="View all assets"
          counters={assetsInfo}
        />

        <CountersBlockCompact
          title="Integrations"
          link=""
          linkTitle="View all organizations and protocols"
          counters={integrationInfo}
        />
      </div>
    </div>
  );
};

export { Platform };