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
  seeds,
} from "@stabilitydao/stability";

import { formatNumber } from "@utils";

import { CountersBlockCompact, Skeleton } from "@ui";

import { apiData, platformVersions } from "@store";

import tokenlist from "@stabilitydao/stability/out/stability.tokenlist.json";

import { CountUp } from 'countup.js';

const platformIcons = [
  <svg className="w-8 h-8 text-yellow-400" /* ... */ />, // HSK
  <svg className="w-8 h-8 text-green-400" /* ... */ />, // Users earned
  <svg className="w-8 h-8 text-blue-400" /* ... */ />, // Vaults
];
const platformBg = [
  "bg-yellow-50",
  "bg-green-50",
  "bg-blue-50"
];

const Platform = (): JSX.Element => {
  const $currentChainID = "146";
  // const $currentChainID = useStore(currentChainID);
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
    // {
    //   name: "Awaiting deployment",
    //   value: strategiesTotals.DEPLOYMENT.toString(),
    //   color: "#612FFB",
    // },
    {
      name: "Development",
      value: strategiesTotals.DEVELOPMENT.toString(),
      color: "#2D67FB",
    },
    // {
    //   name: "Awaiting developer",
    //   value: strategiesTotals.AWAITING.toString(),
    //   color: "#E1E114",
    // },
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

  // 用ref存储数字动画
  const countUpRefs = [useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (
      $apiData?.total?.tvl &&
      $apiData?.total.usersEarned &&
      $apiData?.total.activeVaults
    ) {
      setPlatformData([
        {
          name: "AUM",
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
    <div className="flex flex-col max-w-[1200px] w-full gap-[36px]">
      {/* <h1 className="mb-0 text-[40px] font-bold">Platform</h1> */}

      <div className="flex flex-wrap justify-center p-[36px] px-0">
        {platformData.map(({ name, content }, idx) => (
          <div
            key={name}
            className="flex w-full sm:w-6/12 md:w-4/12 lg:w-3/12 min-[1440px]:w-4/12 h-[120px] px-[12px] rounded-full text-gray-200 items-center justify-center flex-col"
          >
            <div className="mb-2">{platformIcons[idx]}</div>
            <div
              ref={countUpRefs[idx]}
              className="text-[36px] font-extrabold "
            >
            </div>
            <div className="flex self-center justify-center text-[16px] font-bold">
              {name}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap">
        {/* <CountersBlockCompact
          title="Network"
          link="/network"
          linkTitle="View Stability Network"
          counters={networksInfo}
        /> */}
        <CountersBlockCompact
          title="Strategies"
          link="/strategies"
          linkTitle="Go to strategies"
          counters={strategiesInfo}
        />

        {/* <CountersBlockCompact
          title="Swapper"
          link=""
          linkTitle="Go to Swapper"
          counters={swapperInfo}
        /> */}
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
