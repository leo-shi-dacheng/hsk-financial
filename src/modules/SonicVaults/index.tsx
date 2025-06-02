import { useState, useEffect, useRef, useMemo, useCallback } from "react";

import { useWeb3Modal } from "@web3modal/wagmi/react";

import { useStore } from "@nanostores/react";

import { isMobile } from "react-device-detect";

import { APRModal } from "./components/modals/APRModal";
import { VSHoldModal } from "./components/modals/VSHoldModal";
import { ColumnSort } from "./components/ColumnSort";
import { Pagination } from "./components/Pagination";
import { Filters } from "./components/Filters";
import { Portfolio } from "./components/Portfolio";

import { TimeDifferenceIndicator, FullPageLoader, ErrorMessage, CountUp } from "@ui";

import {
  aprFilter,
  connected,
  error,
  visible,
} from "@store";

import { toVault, initFilters } from "./functions";

import { formatNumber, formatFromBigInt, dataSorter, debounce } from "@utils";

import {
  SONIC_TABLE,
  TABLE_FILTERS,
  PAGINATION_VAULTS,
  STABLECOINS,
  DEFAULT_TABLE_PARAMS,
  SILO_POINTS,
  STABILITY_AAVE_POOLS,
  STABILITY_STRATEGY_LABELS,
} from "@constants";

import type {
  TVault,
  TTableColumn,
  TEarningData,
  TAPRPeriod,
  TTableActiveParams,
  TVSHoldModalState,
  TChain,
} from "@types";

// Mock data based on the user's requirements
const MOCK_VAULTS: TVault[] = [
  {
    address: "0x1234567890123456789012345678901234567891" as const,
    name: "PacARB Vault",
    symbol: "PacARB",
    created: "1640995200",
    assetsPricesOnCreation: ["1.0"],
    type: "Money Market",
    strategy: "MMF",
    shareprice: "1.0",
    sharePriceLast: "1.0",
    tvl: "7052309.71",
    strategySpecific: "",
    balance: "1500000000000000000000", // 1500 tokens for portfolio display
    balanceInUSD: 0,
    lastHardWork: "1640995200",
    hardWorkOnDeposit: false,
    daily: 0,
    assets: [
      {
        address: "0x1234567890123456789012345678901234567891" as const,
        color: "#ff6b35",
        logo: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
        name: "PacARB",
        symbol: "PacARB",
      },
    ],
    assetsSymbol: "PacARB",
    assetsProportions: [100],
    strategyInfo: {
      id: "Money Market Fund",
      shortId: "MMF",
      color: "#ffffff",
      bgColor: "#4f46e5",
      protocols: [
        {
          name: "Pacific",
          logoSrc: "https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png",
        },
      ],
      baseStrategies: [],
      ammAdapter: "",
      sourceCode: "",
    },
    il: 0,
    underlying: {
      address: "0x1234567890123456789012345678901234567891" as const,
      symbol: "PacARB",
      decimals: 18,
      logo: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
    },
    strategyAddress: "0x1234567890123456789012345678901234567891" as const,
    strategyDescription: "Pacific ARB Money Market Fund",
    status: "Active",
    version: "1.0.0",
    strategyVersion: "1.0.0",
    NFTtokenID: "",
    gasReserve: "0",
    rebalances: { daily: 0, weekly: 0 },
    earningData: {
      apr: { latest: "0", daily: "0", weekly: "0" },
      apy: { latest: "0", daily: "0", weekly: "0" },
      poolSwapFeesAPR: { latest: "0", daily: "0", weekly: "0" },
      farmAPR: { latest: "0", daily: "0", weekly: "0" },
      gemsAPR: { latest: "0", daily: "0", weekly: "0" },
    },
    sortAPR: "0",
    pool: {},
    alm: { protocol: "", amountToken0: 0, amountToken1: 0, tvl: 0, positions: [] },
    risk: { factors: [], isRektStrategy: false, symbol: "" },
    vsHold24H: 0,
    vsHoldWeekly: 0,
    lifetimeVsHold: 0,
    vsHoldAPR: 0,
    assetsVsHold: [],
    isVsActive: false,
    yearnProtocols: [],
    network: "146",
    sonicActivePoints: 1,
    ringsPoints: undefined,
    liveAPR: undefined,
    assetAPR: undefined,
  },
  {
    address: "0x1234567890123456789012345678901234567892" as const,
    name: "CPIC Estable Money Market Fund",
    symbol: "CPIC-MMF",
    created: "1640995200",
    assetsPricesOnCreation: ["1.0"],
    type: "Money Market",
    strategy: "MMF",
    shareprice: "1.0",
    sharePriceLast: "1.0",
    tvl: "99870675.30",
    strategySpecific: "",
    balance: "2300000000000000000000", // 2300 tokens for portfolio display
    balanceInUSD: 0,
    lastHardWork: "1640995200",
    hardWorkOnDeposit: false,
    daily: 4.48 / 365,
    assets: [
      {
        address: "0x1234567890123456789012345678901234567892" as const,
        color: "#22c55e",
        logo: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
        name: "CPIC Estable",
        symbol: "CPIC",
      },
    ],
    assetsSymbol: "CPIC",
    assetsProportions: [100],
    strategyInfo: {
      id: "Money Market Fund",
      shortId: "MMF",
      color: "#ffffff",
      bgColor: "#22c55e",
      protocols: [
        {
          name: "CPIC",
          logoSrc: "https://assets.coingecko.com/coins/images/12645/large/AAVE.png",
        },
      ],
      baseStrategies: [],
      ammAdapter: "",
      sourceCode: "",
    },
    il: 0,
    underlying: {
      address: "0x1234567890123456789012345678901234567892" as const,
      symbol: "CPIC",
      decimals: 18,
      logo: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
    },
    strategyAddress: "0x1234567890123456789012345678901234567892" as const,
    strategyDescription: "CPIC Estable Money Market Fund",
    status: "Active",
    version: "1.0.0",
    strategyVersion: "1.0.0",
    NFTtokenID: "",
    gasReserve: "0",
    rebalances: { daily: 0, weekly: 0 },
    earningData: {
      apr: { latest: "4.48", daily: "4.48", weekly: "4.48" },
      apy: { latest: "4.58", daily: "4.58", weekly: "4.58" },
      poolSwapFeesAPR: { latest: "0", daily: "0", weekly: "0" },
      farmAPR: { latest: "4.48", daily: "4.48", weekly: "4.48" },
      gemsAPR: { latest: "0", daily: "0", weekly: "0" },
    },
    sortAPR: "4.48",
    pool: {},
    alm: { protocol: "", amountToken0: 0, amountToken1: 0, tvl: 0, positions: [] },
    risk: { factors: [], isRektStrategy: false, symbol: "" },
    vsHold24H: 0,
    vsHoldWeekly: 0,
    lifetimeVsHold: 0,
    vsHoldAPR: 0,
    assetsVsHold: [],
    isVsActive: false,
    yearnProtocols: [],
    network: "146",
    sonicActivePoints: 1,
    ringsPoints: undefined,
    liveAPR: undefined,
    assetAPR: undefined,
  },
  {
    address: "0x1234567890123456789012345678901234567893" as const,
    name: "AOABT Vault",
    symbol: "AOABT",
    created: "1640995200",
    assetsPricesOnCreation: ["1.0"],
    type: "Yield",
    strategy: "YLD",
    shareprice: "1.0",
    sharePriceLast: "1.0",
    tvl: "3568829.96",
    strategySpecific: "",
    balance: "500000000000000000000", // 500 tokens for portfolio display
    balanceInUSD: 0,
    lastHardWork: "1640995200",
    hardWorkOnDeposit: false,
    daily: 8.17 / 365,
    assets: [
      {
        address: "0x1234567890123456789012345678901234567893" as const,
        color: "#8b5cf6",
        logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
        name: "AOABT",
        symbol: "AOABT",
      },
    ],
    assetsSymbol: "AOABT",
    assetsProportions: [100],
    strategyInfo: {
      id: "Yield Strategy",
      shortId: "YLD",
      color: "#ffffff",
      bgColor: "#8b5cf6",
      protocols: [
        {
          name: "Asseto",
          logoSrc: "https://assets.coingecko.com/coins/images/12124/large/Curve.png",
        },
      ],
      baseStrategies: [],
      ammAdapter: "",
      sourceCode: "",
    },
    il: 0,
    underlying: {
      address: "0x1234567890123456789012345678901234567893" as const,
      symbol: "AOABT",
      decimals: 18,
      logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    },
    strategyAddress: "0x1234567890123456789012345678901234567893" as const,
    strategyDescription: "AOABT Yield Strategy",
    status: "Active",
    version: "1.0.0",
    strategyVersion: "1.0.0",
    NFTtokenID: "",
    gasReserve: "0",
    rebalances: { daily: 0, weekly: 0 },
    earningData: {
      apr: { latest: "8.17", daily: "8.17", weekly: "8.17" },
      apy: { latest: "8.51", daily: "8.51", weekly: "8.51" },
      poolSwapFeesAPR: { latest: "0", daily: "0", weekly: "0" },
      farmAPR: { latest: "8.17", daily: "8.17", weekly: "8.17" },
      gemsAPR: { latest: "0", daily: "0", weekly: "0" },
    },
    sortAPR: "8.17",
    pool: {},
    alm: { protocol: "", amountToken0: 0, amountToken1: 0, tvl: 0, positions: [] },
    risk: { factors: [], isRektStrategy: false, symbol: "" },
    vsHold24H: 0,
    vsHoldWeekly: 0,
    lifetimeVsHold: 0,
    vsHoldAPR: 0,
    assetsVsHold: [],
    isVsActive: false,
    yearnProtocols: [],
    network: "146",
    sonicActivePoints: 1,
    ringsPoints: undefined,
    liveAPR: undefined,
    assetAPR: undefined,
  },
  {
    address: "0x1234567890123456789012345678901234567894" as const,
    name: "Bosera HKD MMF ETF",
    symbol: "BHKD-MMF",
    created: "1640995200",
    assetsPricesOnCreation: ["1.0"],
    type: "ETF",
    strategy: "MMF",
    shareprice: "1.0",
    sharePriceLast: "1.0",
    tvl: "28784346.8",
    strategySpecific: "",
    balance: "0", // No balance for this one
    balanceInUSD: 0,
    lastHardWork: "1640995200",
    hardWorkOnDeposit: false,
    daily: 4.125 / 365,
    assets: [
      {
        address: "0x1234567890123456789012345678901234567894" as const,
        color: "#f59e0b",
        logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
        name: "Bosera HKD MMF ETF",
        symbol: "BHKD",
      },
    ],
    assetsSymbol: "BHKD",
    assetsProportions: [100],
    strategyInfo: {
      id: "Money Market Fund ETF",
      shortId: "MMF",
      color: "#ffffff",
      bgColor: "#f59e0b",
      protocols: [
        {
          name: "Bosera",
          logoSrc: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
        },
      ],
      baseStrategies: [],
      ammAdapter: "",
      sourceCode: "",
    },
    il: 0,
    underlying: {
      address: "0x1234567890123456789012345678901234567894" as const,
      symbol: "BHKD",
      decimals: 18,
      logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    },
    strategyAddress: "0x1234567890123456789012345678901234567894" as const,
    strategyDescription: "Bosera HKD Money Market Fund ETF",
    status: "Active",
    version: "1.0.0",
    strategyVersion: "1.0.0",
    NFTtokenID: "",
    gasReserve: "0",
    rebalances: { daily: 0, weekly: 0 },
    earningData: {
      apr: { latest: "4.125", daily: "4.125", weekly: "4.125" },
      apy: { latest: "4.21", daily: "4.21", weekly: "4.21" },
      poolSwapFeesAPR: { latest: "0", daily: "0", weekly: "0" },
      farmAPR: { latest: "4.125", daily: "4.125", weekly: "4.125" },
      gemsAPR: { latest: "0", daily: "0", weekly: "0" },
    },
    sortAPR: "4.125",
    pool: {},
    alm: { protocol: "", amountToken0: 0, amountToken1: 0, tvl: 0, positions: [] },
    risk: { factors: [], isRektStrategy: false, symbol: "" },
    vsHold24H: 0,
    vsHoldWeekly: 0,
    lifetimeVsHold: 0,
    vsHoldAPR: 0,
    assetsVsHold: [],
    isVsActive: false,
    yearnProtocols: [],
    network: "146",
    sonicActivePoints: 1,
    ringsPoints: undefined,
    liveAPR: undefined,
    assetAPR: undefined,
  },
  {
    address: "0x1234567890123456789012345678901234567895" as const,
    name: "Bosera USD MMF ETF",
    symbol: "BUSD-MMF",
    created: "1640995200",
    assetsPricesOnCreation: ["1.0"],
    type: "ETF",
    strategy: "MMF",
    shareprice: "1.0",
    sharePriceLast: "1.0",
    tvl: "8535373.57",
    strategySpecific: "",
    balance: "0", // No balance for this one
    balanceInUSD: 0,
    lastHardWork: "1640995200",
    hardWorkOnDeposit: false,
    daily: 4.625 / 365,
    assets: [
      {
        address: "0x1234567890123456789012345678901234567895" as const,
        color: "#06b6d4",
        logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
        name: "Bosera USD MMF ETF",
        symbol: "BUSD",
      },
    ],
    assetsSymbol: "BUSD",
    assetsProportions: [100],
    strategyInfo: {
      id: "Money Market Fund ETF",
      shortId: "MMF",
      color: "#ffffff",
      bgColor: "#06b6d4",
      protocols: [
        {
          name: "Bosera",
          logoSrc: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png",
        },
      ],
      baseStrategies: [],
      ammAdapter: "",
      sourceCode: "",
    },
    il: 0,
    underlying: {
      address: "0x1234567890123456789012345678901234567895" as const,
      symbol: "BUSD",
      decimals: 18,
      logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
    },
    strategyAddress: "0x1234567890123456789012345678901234567895" as const,
    strategyDescription: "Bosera USD Money Market Fund ETF",
    status: "Active",
    version: "1.0.0",
    strategyVersion: "1.0.0",
    NFTtokenID: "",
    gasReserve: "0",
    rebalances: { daily: 0, weekly: 0 },
    earningData: {
      apr: { latest: "4.625", daily: "4.625", weekly: "4.625" },
      apy: { latest: "4.73", daily: "4.73", weekly: "4.73" },
      poolSwapFeesAPR: { latest: "0", daily: "0", weekly: "0" },
      farmAPR: { latest: "4.625", daily: "4.625", weekly: "4.625" },
      gemsAPR: { latest: "0", daily: "0", weekly: "0" },
    },
    sortAPR: "4.625",
    pool: {},
    alm: { protocol: "", amountToken0: 0, amountToken1: 0, tvl: 0, positions: [] },
    risk: { factors: [], isRektStrategy: false, symbol: "" },
    vsHold24H: 0,
    vsHoldWeekly: 0,
    lifetimeVsHold: 0,
    vsHoldAPR: 0,
    assetsVsHold: [],
    isVsActive: false,
    yearnProtocols: [],
    network: "146",
    sonicActivePoints: 1,
    ringsPoints: undefined,
    liveAPR: undefined,
    assetAPR: undefined,
  },
  {
    address: "0x1234567890123456789012345678901234567896" as const,
    name: "Matrixdock xAUM",
    symbol: "xAUM",
    created: "1640995200",
    assetsPricesOnCreation: ["1.0"],
    type: "Asset Management",
    strategy: "AUM",
    shareprice: "1.0",
    sharePriceLast: "1.0",
    tvl: "41360000",
    strategySpecific: "",
    balance: "0", // No balance for this one
    balanceInUSD: 0,
    lastHardWork: "1640995200",
    hardWorkOnDeposit: false,
    daily: 0,
    assets: [
      {
        address: "0x1234567890123456789012345678901234567896" as const,
        color: "#10b981",
        logo: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
        name: "Matrixdock xAUM",
        symbol: "xAUM",
      },
    ],
    assetsSymbol: "xAUM",
    assetsProportions: [100],
    strategyInfo: {
      id: "Asset Under Management",
      shortId: "AUM",
      color: "#ffffff",
      bgColor: "#10b981",
      protocols: [
        {
          name: "Matrixdock",
          logoSrc: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png",
        },
      ],
      baseStrategies: [],
      ammAdapter: "",
      sourceCode: "",
    },
    il: 0,
    underlying: {
      address: "0x1234567890123456789012345678901234567896" as const,
      symbol: "xAUM",
      decimals: 18,
      logo: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
    },
    strategyAddress: "0x1234567890123456789012345678901234567896" as const,
    strategyDescription: "Matrixdock Asset Under Management",
    status: "Active",
    version: "1.0.0",
    strategyVersion: "1.0.0",
    NFTtokenID: "",
    gasReserve: "0",
    rebalances: { daily: 0, weekly: 0 },
    earningData: {
      apr: { latest: "0", daily: "0", weekly: "0" },
      apy: { latest: "0", daily: "0", weekly: "0" },
      poolSwapFeesAPR: { latest: "0", daily: "0", weekly: "0" },
      farmAPR: { latest: "0", daily: "0", weekly: "0" },
      gemsAPR: { latest: "0", daily: "0", weekly: "0" },
    },
    sortAPR: "0",
    pool: {},
    alm: { protocol: "", amountToken0: 0, amountToken1: 0, tvl: 0, positions: [] },
    risk: { factors: [], isRektStrategy: false, symbol: "" },
    vsHold24H: 0,
    vsHoldWeekly: 0,
    lifetimeVsHold: 0,
    vsHoldAPR: 0,
    assetsVsHold: [],
    isVsActive: false,
    yearnProtocols: [],
    network: "146",
    sonicActivePoints: 1,
    ringsPoints: undefined,
    liveAPR: undefined,
    assetAPR: undefined,
  },
  {
    address: "0x1234567890123456789012345678901234567897" as const,
    name: "Matrixdock STBT",
    symbol: "STBT",
    created: "1640995200",
    assetsPricesOnCreation: ["1.0"],
    type: "Stablecoin",
    strategy: "STB",
    shareprice: "1.0",
    sharePriceLast: "1.0",
    tvl: "13336039.21",
    strategySpecific: "",
    balance: "0", // No balance for this one
    balanceInUSD: 0,
    lastHardWork: "1640995200",
    hardWorkOnDeposit: false,
    daily: 3.79 / 365,
    assets: [
      {
        address: "0x1234567890123456789012345678901234567897" as const,
        color: "#3b82f6",
        logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
        name: "Matrixdock STBT",
        symbol: "STBT",
      },
    ],
    assetsSymbol: "STBT",
    assetsProportions: [100],
    strategyInfo: {
      id: "Stable Token Bonds",
      shortId: "STB",
      color: "#ffffff",
      bgColor: "#3b82f6",
      protocols: [
        {
          name: "Matrixdock",
          logoSrc: "https://assets.coingecko.com/coins/images/10775/large/COMP.png",
        },
      ],
      baseStrategies: [],
      ammAdapter: "",
      sourceCode: "",
    },
    il: 0,
    underlying: {
      address: "0x1234567890123456789012345678901234567897" as const,
      symbol: "STBT",
      decimals: 18,
      logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    },
    strategyAddress: "0x1234567890123456789012345678901234567897" as const,
    strategyDescription: "Matrixdock Stable Token Bonds",
    status: "Active",
    version: "1.0.0",
    strategyVersion: "1.0.0",
    NFTtokenID: "",
    gasReserve: "0",
    rebalances: { daily: 0, weekly: 0 },
    earningData: {
      apr: { latest: "3.79", daily: "3.79", weekly: "3.79" },
      apy: { latest: "3.86", daily: "3.86", weekly: "3.86" },
      poolSwapFeesAPR: { latest: "0", daily: "0", weekly: "0" },
      farmAPR: { latest: "3.79", daily: "3.79", weekly: "3.79" },
      gemsAPR: { latest: "0", daily: "0", weekly: "0" },
    },
    sortAPR: "3.79",
    pool: {},
    alm: { protocol: "", amountToken0: 0, amountToken1: 0, tvl: 0, positions: [] },
    risk: { factors: [], isRektStrategy: false, symbol: "" },
    vsHold24H: 0,
    vsHoldWeekly: 0,
    lifetimeVsHold: 0,
    vsHoldAPR: 0,
    assetsVsHold: [],
    isVsActive: false,
    yearnProtocols: [],
    network: "146",
    sonicActivePoints: 1,
    ringsPoints: undefined,
    liveAPR: undefined,
    assetAPR: undefined,
  },
  {
    address: "0x1234567890123456789012345678901234567898" as const,
    name: "AsteroidX",
    symbol: "ASTX",
    created: "1640995200",
    assetsPricesOnCreation: ["1.0"],
    type: "DeFi",
    strategy: "DEX",
    shareprice: "1.0",
    sharePriceLast: "1.0",
    tvl: "0",
    strategySpecific: "",
    balance: "0", // No balance for this one
    balanceInUSD: 0,
    lastHardWork: "1640995200",
    hardWorkOnDeposit: false,
    daily: 0,
    assets: [
      {
        address: "0x1234567890123456789012345678901234567898" as const,
        color: "#ef4444",
        logo: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
        name: "AsteroidX",
        symbol: "ASTX",
      },
    ],
    assetsSymbol: "ASTX",
    assetsProportions: [100],
    strategyInfo: {
      id: "Decentralized Exchange",
      shortId: "DEX",
      color: "#ffffff",
      bgColor: "#ef4444",
      protocols: [
        {
          name: "AsteroidX",
          logoSrc: "https://assets.coingecko.com/coins/images/12271/large/512x512_Logo_no_chop.png",
        },
      ],
      baseStrategies: [],
      ammAdapter: "",
      sourceCode: "",
    },
    il: 0,
    underlying: {
      address: "0x1234567890123456789012345678901234567898" as const,
      symbol: "ASTX",
      decimals: 18,
      logo: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
    },
    strategyAddress: "0x1234567890123456789012345678901234567898" as const,
    strategyDescription: "AsteroidX Decentralized Exchange Protocol",
    status: "Active",
    version: "1.0.0",
    strategyVersion: "1.0.0",
    NFTtokenID: "",
    gasReserve: "0",
    rebalances: { daily: 0, weekly: 0 },
    earningData: {
      apr: { latest: "0", daily: "0", weekly: "0" },
      apy: { latest: "0", daily: "0", weekly: "0" },
      poolSwapFeesAPR: { latest: "0", daily: "0", weekly: "0" },
      farmAPR: { latest: "0", daily: "0", weekly: "0" },
      gemsAPR: { latest: "0", daily: "0", weekly: "0" },
    },
    sortAPR: "0",
    pool: {},
    alm: { protocol: "", amountToken0: 0, amountToken1: 0, tvl: 0, positions: [] },
    risk: { factors: [], isRektStrategy: false, symbol: "" },
    vsHold24H: 0,
    vsHoldWeekly: 0,
    lifetimeVsHold: 0,
    vsHoldAPR: 0,
    assetsVsHold: [],
    isVsActive: false,
    yearnProtocols: [],
    network: "146",
    sonicActivePoints: 1,
    ringsPoints: undefined,
    liveAPR: undefined,
    assetAPR: undefined,
  },
];

const SonicVaults = (): JSX.Element => {
  const { open } = useWeb3Modal();

  const $aprFilter: TAPRPeriod = useStore(aprFilter);
  const $connected = useStore(connected);

  const $error = useStore(error);
  const $visible = useStore(visible);

  const newUrl = new URL(window.location.href);
  const params = new URLSearchParams(newUrl.search);

  const [activeTableParams, setActiveTableParams] =
    useState<TTableActiveParams>(DEFAULT_TABLE_PARAMS);

  const [allParams, setAllParams] = useState<number>(0);

  let urlTab = 1;

  let urlTableStates = SONIC_TABLE;

  if (!!Number(params.get("page"))) {
    urlTab = Number(params.get("page"));
  }

  if (params.get("sort")) {
    const [paramName, paramType] = params.get("sort")?.split("-") as string[];

    const indexOfState = urlTableStates.findIndex(
      ({ name }) => name.toUpperCase() === paramName.toUpperCase()
    );

    const URLParamType = paramType === "desc" ? "descendentic" : "ascendentic";

    if (indexOfState != -1) {
      urlTableStates[indexOfState].sortType = URLParamType;

      if (!activeTableParams.sort) {
        setActiveTableParams((prev) => ({ ...prev, sort: 1 }));
      }
    }
  }

  const search: React.RefObject<HTMLInputElement> = useRef(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const [localVaults, setLocalVaults] = useState<TVault[]>([]);
  const [filteredVaults, setFilteredVaults] = useState<TVault[]>([]);
  const [aprModal, setAprModal] = useState({
    earningData: {} as TEarningData,
    daily: 0,
    lastHardWork: "0",
    symbol: "",
    state: false,
    pool: {},
  });

  const [vsHoldModal, setVsHoldModal] = useState<TVSHoldModalState>({
    assetsVsHold: [],
    lifetimeVsHold: 0,
    vsHoldAPR: 0,
    created: 0,
    state: false,
    isVsActive: false,
  });

  const [isLocalVaultsLoaded, setIsLocalVaultsLoaded] = useState(false);

  const [currentTab, setCurrentTab] = useState(urlTab);

  const [tableStates, setTableStates] = useState(urlTableStates);
  const [tableFilters, setTableFilters] = useState(TABLE_FILTERS);
  const [activeNetworks, setActiveNetworks] = useState<TChain[]>([
    {
      name: "Sonic",
      id: "146",
      logoURI: "/sonic.png",
      explorer: "https://sonicscan.org/address/",
      active: true,
    },
  ]);

  const lastTabIndex = currentTab * PAGINATION_VAULTS;
  const firstTabIndex = lastTabIndex - PAGINATION_VAULTS;
  const currentTabVaults = filteredVaults.slice(firstTabIndex, lastTabIndex);

  const userVaultsCondition =
    tableFilters.find((filter) => filter.name === "My vaults")?.state &&
    !$connected;

  const handleSearch = (value: string) => {
    if (search?.current) {
      search.current.value = value;

      tableHandler();
      setSearchHistory([]);
    }
  };

  const activeNetworksHandler = async (chainIDs: string[]) => {
    let updatedNetworks = activeNetworks.map((network) =>
      chainIDs.includes(network.id)
        ? { ...network, active: !network.active }
        : network
    );

    const allActive = activeNetworks.every((network) => network.active);
    const allInactive = updatedNetworks.every((network) => !network.active);

    if (allInactive) {
      updatedNetworks = activeNetworks.map((network) => ({
        ...network,
        active: true,
      }));
    } else if (allActive) {
      updatedNetworks = activeNetworks.map((network) => ({
        ...network,
        active: chainIDs.includes(network.id),
      }));
    }

    /// URL set
    const activeNetworksLength = updatedNetworks.filter(
      (network) => network.active
    )?.length;

    if (activeNetworksLength === updatedNetworks.length) {
      params.delete("chain");
    } else {
      params.delete("chain");

      updatedNetworks.forEach((network) => {
        if (network.active) {
          params.append("chain", network.id);
        }
      });
    }

    newUrl.search = `?${params.toString()}`;
    window.history.pushState({}, "", newUrl.toString());

    setActiveNetworks(updatedNetworks);
  };

  const resetTable = () => {
    // search
    if (search?.current) {
      search.current.value = "";
    }

    // sort
    const _tableStates = tableStates.map((state) => ({
      ...state,
      sortType: "none",
    }));
    setTableStates(_tableStates);

    //filters
    const _tableFilters = tableFilters.map((filter) => {
      if (filter.variants) {
        const variants = filter.variants.map((variant) => ({
          ...variant,
          state: false,
        }));
        return {
          ...filter,
          variants,
        };
      } else if (filter.name === "Active") {
        return { ...filter, state: true };
      } else {
        return { ...filter, state: false };
      }
    });
    setTableFilters(_tableFilters);

    // ui
    setActiveTableParams(DEFAULT_TABLE_PARAMS);
    setAllParams(0);

    // path
    window.history.replaceState(null, "", window.location.pathname);

    // table reset
    tableHandler(_tableStates, DEFAULT_TABLE_PARAMS);
  };

  const updateHistorySearch = useCallback(
    debounce((value: string) => {
      if (!value) return;

      const history = JSON.parse(
        localStorage.getItem("searchHistory") as string
      );

      if (Array.isArray(history) && history.includes(value)) return;

      let newValues = history ? [...history, value] : [value];

      if (newValues.length > 10) {
        newValues.shift();
      }

      localStorage.setItem("searchHistory", JSON.stringify(newValues));
    }, 2000),
    []
  );

  const tableHandler = (
    table: TTableColumn[] = tableStates,
    tableParams = activeTableParams
  ) => {
    // Use mock data instead of real vaults
    const searchValue: string = String(search?.current?.value.toLowerCase());

    //@ts-ignore
    updateHistorySearch(searchValue);

    // Use mock vaults instead of real vaults data
    let sortedVaults = MOCK_VAULTS.map((vault) => {
      const balance = formatFromBigInt(vault.balance, 18);

      return {
        ...vault,
        balanceInUSD: balance * Number(vault.shareprice),
      };
    });

    //filter
    tableFilters.forEach((f) => {
      if (!f.state) return;
      switch (f.type) {
        case "single":
          if (f.name === "Stablecoins") {
            sortedVaults = sortedVaults.filter((vault: TVault) => {
              if (vault.assets.length > 1) {
                return (
                  STABLECOINS.includes(vault?.assets[0]?.address) &&
                  STABLECOINS.includes(vault?.assets[1]?.address)
                );
              }
              return STABLECOINS.includes(vault?.assets[0]?.address);
            });
          }
          break;
        case "multiple":
          // if (!f.variants) break;
          // if (f.name === "Strategy") {
          //   const strategyName = f.variants.find(
          //     (variant: TTAbleFiltersVariant) => variant.state
          //   )?.name;
          //   if (strategyName) {
          //     sortedVaults = sortedVaults.filter(
          //       (vault: TVault) => vault.strategyInfo.shortId === strategyName
          //     );
          //   }
          // }
          break;
        case "sample":
          if (f.name === "My vaults") {
            sortedVaults = sortedVaults.filter(
              (vault: TVault) => vault.balance
            );
          }
          if (f.name === "Active") {
            sortedVaults = sortedVaults.filter(
              (vault: TVault) => vault.status === "Active"
            );
          }
          break;
        case "dropdown":
          if (!f.variants) break;
          if (f.name === "Strategies") {
            const strategiesToFilter = f.variants.reduce<string[]>(
              (acc, { state, name }) => {
                if (state) acc.push(name);
                return acc;
              },
              []
            );

            if (strategiesToFilter.length) {
              sortedVaults = sortedVaults.filter((vault: TVault) =>
                strategiesToFilter.includes(vault.strategyInfo.shortId)
              );
            }
          }
          break;
        default:
          console.error("NO FILTER CASE");
          break;
      }
    });
    //sort
    table.forEach((state: TTableColumn) => {
      if (state.sortType !== "none") {
        if (state.keyName === "earningData") {
          sortedVaults = [...sortedVaults].sort((a, b) =>
            dataSorter(
              a.earningData.apr[$aprFilter],
              b.earningData.apr[$aprFilter],
              state.dataType,
              state.sortType
            )
          );
        } else {
          sortedVaults = [...sortedVaults].sort((a, b) =>
            dataSorter(
              String(a[state.keyName as keyof TVault]),
              String(b[state.keyName as keyof TVault]),
              state.dataType,
              state.sortType
            )
          );
        }
      }
    });
    //search
    sortedVaults = sortedVaults.filter(
      (vault: TVault) =>
        vault?.symbol.toLowerCase().includes(searchValue) ||
        vault?.assetsSymbol.toLowerCase().includes(searchValue)
    );
    // pagination upd
    if (currentTab != 1) {
      const disponibleTabs = Math.ceil(sortedVaults.length / PAGINATION_VAULTS);

      if (disponibleTabs < currentTab) {
        setCurrentTab(1);
        params.delete("page");
      }
    }

    //active table params(search-sort-filter)
    let _activeTableParams = tableParams;

    if (!!searchValue && !_activeTableParams.search) {
      _activeTableParams = { ..._activeTableParams, search: 1 };
    } else if (!searchValue && !!_activeTableParams.search) {
      _activeTableParams = { ..._activeTableParams, search: 0 };
    }

    const isSort = table.some((state) => state.sortType != "none");

    if (isSort && !_activeTableParams.sort) {
      _activeTableParams = { ..._activeTableParams, sort: 1 };
    } else if (!isSort && !!_activeTableParams.sort) {
      _activeTableParams = { ..._activeTableParams, sort: 0 };
    }

    // search history
    const history = JSON.parse(localStorage.getItem("searchHistory") as string);

    const historyData: string[] = [];
    if (Array.isArray(history) && searchValue) {
      for (const historyValue of history) {
        if (historyValue.includes(searchValue)) {
          historyData.push(historyValue);
        }
      }
    }

    setActiveTableParams(_activeTableParams);
    setFilteredVaults(sortedVaults);
    setTableStates(table);
    setSearchHistory(historyData);
  };

  const initVaults = async () => {
    // Use mock data instead of real vault data
    const vaults: TVault[] = MOCK_VAULTS.map((vault) => {
      const balance = formatFromBigInt(vault.balance, 18);

      return {
        ...vault,
        balanceInUSD: balance * Number(vault.shareprice),
      };
    });

    initFilters(
      vaults,
      tableFilters,
      setTableFilters,
      activeNetworksHandler,
      setActiveTableParams
    );
    setLocalVaults(vaults);
    setFilteredVaults(vaults);
    setIsLocalVaultsLoaded(true);
  };

  useEffect(() => {
    tableHandler();
  }, [tableFilters, activeNetworks]);

  useEffect(() => {
    // Initialize with mock data instead of waiting for real data
    initVaults();
  }, []);

  useEffect(() => {
    const _allParams = Object.values(activeTableParams).reduce(
      (acc, cur) => (acc += cur),
      0
    );

    if (allParams != _allParams) {
      setAllParams(_allParams);
    }
  }, [activeTableParams]);

  const isLoading = useMemo(() => {
    // Always show as loaded since we're using mock data
    return !isLocalVaultsLoaded;
  }, [isLocalVaultsLoaded]);

  return (
    <>
      <div
        className={`${
          isLoading ? "pointer-events-none" : "pointer-events-auto"
        }`}
      >
        <ErrorMessage type={$error.type} isAlert={true} onlyForChainId={146} />
        <Portfolio vaults={localVaults} />
        {/* <NetworkFilters
          activeNetworks={activeNetworks}
          activeNetworksHandler={activeNetworksHandler}
        /> */}
        <div className="flex items-center gap-2 flex-col min-[1440px]:flex-row font-semibold text-[14px]">
          <div className="w-full relative">
            <label className="relative block w-full">
              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <img
                  src="/search.svg"
                  alt="Search"
                  className="w-4 h-4 text-neutral-500"
                />
              </span>
              <input
                type="text"
                className="mt-1 lg:mt-0 w-full bg-accent-900 hover:border-accent-500 hover:bg-accent-800 outline-none py-[3px] rounded-2xl border-[2px] border-accent-800 focus:border-accent-500 focus:text-neutral-50 text-neutral-500 transition-all duration-300 h-10 pl-10"
                placeholder="Search"
                ref={search}
                onChange={() => tableHandler()}
              />
            </label>
            {searchHistory.length > 0 && (
              <ul className="absolute left-0 mt-2 w-full bg-accent-900 text-neutral-50 font-manrope rounded-2xl z-[10]">
                {searchHistory.map((text, index) => (
                  <li
                    key={text + index}
                    className={`p-2 cursor-pointer hover:bg-accent-800 ${!index ? "hover:rounded-t-2xl" : index === searchHistory.length - 1 ? "hover:rounded-b-2xl" : ""}`}
                    onClick={() => handleSearch(text)}
                  >
                    {text}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Filters
            filters={tableFilters}
            setFilters={setTableFilters}
            allParams={allParams}
            setTableParams={setActiveTableParams}
            resetTable={resetTable}
          />
        </div>
      </div>

      <div className="overflow-x-auto lg:overflow-x-visible min-[1130px]:min-w-[1095px] min-[1440px]:min-w-[1338px]">
        <table className="table table-auto w-full select-none mb-9 min-w-[1024px] lg:min-w-full">
          <thead className="bg-accent-950">
            <tr className="text-[12px] uppercase">
              {tableStates.map((value: TTableColumn, index: number) => (
                <ColumnSort
                  key={value.name + index}
                  index={index}
                  value={value.name}
                  table={tableStates}
                  sort={tableHandler}
                />
              ))}
            </tr>
          </thead>
          <tbody className="font-manrope font-semibold text-[14px]">
            {isLoading ? (
              <tr className="relative h-[80px]">
                <td className="absolute left-[50%] top-[50%] translate-y-[-50%] transform translate-x-[-50%] mt-5">
                  <FullPageLoader />
                </td>
              </tr>
            ) : localVaults?.length ? (
              <>
                {currentTabVaults?.length ? (
                  currentTabVaults.map((vault: TVault, index: number) => {
                    const aprValue = Number(
                      vault?.earningData?.apr[$aprFilter]
                    );

                    const apyValue = vault.earningData.apy[$aprFilter];

                    const swapFeesAPRValue =
                      vault.earningData.poolSwapFeesAPR[$aprFilter];

                    const strategyAPRValue =
                      vault.earningData.farmAPR[$aprFilter];

                    const dailyAPRValue = (
                      Number(vault?.earningData?.apr[$aprFilter]) / 365
                    ).toFixed(2);

                    const gemsAprValue = Number(
                      vault.earningData.gemsAPR[$aprFilter]
                    );

                    const matchedAddress = STABILITY_AAVE_POOLS.find((addr) =>
                      vault.strategySpecific.includes(addr)
                    );

                    const isStabilityLogo = !!matchedAddress;

                    const strategySpecific = matchedAddress
                      ? STABILITY_STRATEGY_LABELS[matchedAddress]
                      : vault.strategySpecific.includes("0xb38d..97b8")
                        ? "MEV Capital"
                        : vault.strategySpecific.includes("0xeeb1..cb6c")
                          ? "Re7 Labs"
                          : vault.strategySpecific;

                    const isSTBLVault =
                      Array.isArray(vault?.assets) &&
                      vault.assets.some(
                        (asset) => asset?.symbol && asset?.symbol === "STBL"
                      );

                    return (
                      <tr
                        key={vault.name + index}
                        className="text-center min-[1020px]:hover:bg-accent-950 cursor-pointer h-[48px] font-medium relative"
                        onClick={() => toVault(vault.network, vault.address)}
                        data-testid="vault"
                      >
                        <td className="px-2 min-[1130px]:px-1 py-2 table-cell">
                          <div className="flex items-center gap-1">
                            <div className="flex items-center w-[52px] justify-center">
                              {vault.assets.map((asset, index) => (
                                <img
                                  src={asset?.logo}
                                  alt={asset?.symbol}
                                  className={`w-6 h-6 rounded-full ${
                                    !index &&
                                    vault.assets.length > 1 &&
                                    "mr-[-10px] z-[5]"
                                  }`}
                                  key={asset?.logo + index}
                                />
                              ))}
                            </div>
                            <span className="mr-2">{vault.assetsSymbol}</span>
                            <div className="flex items-center justify-center gap-1">
                              {!vault.symbol.includes("PT-") && (
                                <div
                                  title="Sonic Activity Points"
                                  className="flex items-center rounded-full border border-[#6EBD70] bg-[#6EBD70]/[0.16] pr-[6px]"
                                >
                                  <img
                                    src="/sonic.png"
                                    alt="sonic"
                                    className="w-[14px] h-[14px] rounded-full"
                                  />
                                  <span className="text-[10px] ml-[3px] mr-[2px]">
                                    x{vault.sonicActivePoints}
                                  </span>
                                </div>
                              )}
                              {SILO_POINTS[
                                vault.address as keyof typeof SILO_POINTS
                              ] && (
                                <div
                                  title="Silo Points per $ / day"
                                  className="flex items-center rounded-full border border-[#fff699] bg-[#fff699]/[0.16] pr-[6px]"
                                >
                                  <img
                                    src="https://raw.githubusercontent.com/stabilitydao/.github/main/assets/silo.png"
                                    alt="silo"
                                    className="w-[14px] h-[14px] rounded-full"
                                  />
                                  <span className="text-[10px] ml-[3px] mr-[2px]">
                                    {
                                      SILO_POINTS[
                                        vault.address as keyof typeof SILO_POINTS
                                      ]
                                    }
                                  </span>
                                </div>
                              )}

                              {!!vault.ringsPoints && (
                                <div
                                  title="Rings Points"
                                  className="flex items-center rounded-full border border-[#ac62e4] bg-black pr-[6px]"
                                >
                                  <img
                                    src="/rings.png"
                                    alt="rings"
                                    className="w-[14px] h-[14px] rounded-full"
                                  />
                                  <span className="text-[10px] ml-[3px] mr-[2px]">
                                    x{vault.ringsPoints}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="pl-2 py-2 whitespace-nowrap">
                          <div className="flex items-center border-0 rounded-[8px] pl-0 py-1 border-[#935ec2]">
                            {vault.strategyInfo && (
                              <>
                                <div
                                  style={{
                                    backgroundColor: vault.strategyInfo.bgColor,
                                    color: vault.strategyInfo.color,
                                  }}
                                  className="px-3 rounded-[10px] flex items-center  justify-start"
                                >
                                  <span
                                    className="text-[14px] w-[30px] flex justify-center"
                                    title={vault.strategyInfo.id}
                                  >
                                    {vault.strategyInfo.shortId}
                                  </span>
                                  <span
                                    className={`pl-2 flex h-8 items-center`}
                                  >
                                    <span className="min-w-[24px] flex items-center">
                                      {isStabilityLogo ? (
                                        <img
                                          className="h-6 w-6 mx-[2px]"
                                          src="/logo.svg"
                                          alt="Stability"
                                          title="Stability"
                                        />
                                      ) : (
                                        vault.strategyInfo.protocols.map(
                                          (protocol, index) => (
                                            <img
                                              className="h-6 w-6 mx-[2px]"
                                              key={
                                                protocol.logoSrc + String(index)
                                              }
                                              src={protocol.logoSrc}
                                              alt={protocol.name}
                                              title={protocol.name}
                                              style={{
                                                zIndex:
                                                  vault.strategyInfo.protocols
                                                    .length - index,
                                              }}
                                            />
                                          )
                                        )
                                      )}
                                    </span>
                                    {strategySpecific && (
                                      <span
                                        className={`font-bold text-[#b6bdd7] inline ${
                                          strategySpecific.length > 10
                                            ? "lowercase text-[10px] pl-[12px] whitespace-pre-wrap max-w-[70px] text-left"
                                            : "uppercase text-[10px] pl-[12px]"
                                        }`}
                                      >
                                        {strategySpecific}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        <td
                          onClick={(e) => {
                            if (isMobile) {
                              e.stopPropagation();
                              setAprModal({
                                earningData: vault.earningData,
                                daily: vault.daily,
                                lastHardWork: vault.lastHardWork,
                                symbol: vault?.risk?.symbol as string,
                                state: true,
                                pool: vault?.pool,
                              });
                            }
                          }}
                          className="px-2 min-[1130px]:px-3 py-2 tooltip cursor-help"
                        >
                          <div
                            className={`whitespace-nowrap w-full text-end flex items-center justify-end gap-[2px] ${
                              vault?.risk?.isRektStrategy
                                ? "text-[#818181]"
                                : "text-[#eaecef]"
                            }`}
                          >
                            <div className="flex flex-col justify-end">
                              <p>
                                <CountUp 
                                  end={aprValue} 
                                  decimals={2}
                                  duration={1.2}
                                  suffix="%"
                                  enableScrollSpy={true}
                                  scrollSpyDelay={100}
                                />
                              </p>
                              {!!vault?.liveAPR && (
                                <p className="text-[12px] text-neutral-700">
                                  live. <CountUp 
                                    end={vault.liveAPR} 
                                    decimals={2}
                                    duration={1.2}
                                    suffix="%"
                                    enableScrollSpy={true}
                                    scrollSpyDelay={150}
                                  />
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="visible__tooltip">
                            <div className="flex items-start flex-col gap-4">
                              <div className="flex flex-col gap-1 w-full">
                                {!!vault?.risk?.isRektStrategy && (
                                  <div className="flex flex-col items-center gap-2 mb-[10px]">
                                    <h3 className="text-[#f52a11] font-bold">
                                      {vault?.risk?.symbol} VAULT
                                    </h3>
                                    <p className="text-[12px] text-start">
                                      Rekt vault regularly incurs losses,
                                      potentially leading to rapid USD value
                                      decline, with returns insufficient to
                                      offset the losses.
                                    </p>
                                  </div>
                                )}
                                <div className="font-bold flex items-center justify-between">
                                  <p>Total APY</p>
                                  <p className="text-end">
                                    {formatNumber(apyValue, "formatAPR")}%
                                  </p>
                                </div>
                                <div className="font-bold flex items-center justify-between">
                                  <p>Total APR</p>
                                  <p className="text-end">
                                    {formatNumber(aprValue, "formatAPR")}%
                                  </p>
                                </div>

                                {vault?.earningData?.poolSwapFeesAPR.daily !=
                                  "-" &&
                                  vault?.pool && (
                                    <div className="font-bold flex items-center justify-between">
                                      <p>Pool swap fees APR</p>
                                      <p className="text-end">
                                        {formatNumber(
                                          swapFeesAPRValue,
                                          "formatAPR"
                                        )}
                                        %
                                      </p>
                                    </div>
                                  )}
                                <div className="font-bold flex items-center justify-between">
                                  <p>Strategy APR</p>
                                  <p className="text-end">
                                    {formatNumber(
                                      strategyAPRValue,
                                      "formatAPR"
                                    )}
                                    %
                                  </p>
                                </div>
                                <div className="font-bold flex items-center justify-between">
                                  <p>Daily</p>
                                  <p className="text-end">
                                    {formatNumber(dailyAPRValue, "formatAPR")}%
                                  </p>
                                </div>
                                {!isSTBLVault && (
                                  <div className="font-bold flex items-center justify-between">
                                    <p>Gems APR</p>
                                    <div className="flex items-center justify-end">
                                      {formatNumber(
                                        gemsAprValue.toFixed(2),
                                        "formatAPR"
                                      )}
                                      %
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center justify-between w-full">
                                <p>Last Hard Work</p>
                                <TimeDifferenceIndicator
                                  unix={vault.lastHardWork}
                                />
                              </div>
                            </div>
                            <i></i>
                          </div>
                        </td>
                        <td className="px-2 min-[1130px]:px-4 py-2 text-right">
                          {Number(vault.tvl) > 1000000 ? (
                            <>
                              $<CountUp 
                                end={Number(vault.tvl) / 1000000} 
                                decimals={2}
                                duration={1.2}
                                enableScrollSpy={true}
                                scrollSpyDelay={250}
                                separator=","
                                suffix="M"
                              />
                            </>
                          ) : Number(vault.tvl) > 1000 ? (
                            <>
                              $<CountUp 
                                end={Number(vault.tvl) / 1000} 
                                decimals={1}
                                duration={1.2}
                                enableScrollSpy={true}
                                scrollSpyDelay={250}
                                separator=","
                                suffix="K"
                              />
                            </>
                          ) : (
                            <>
                              $<CountUp 
                                end={Number(vault.tvl)} 
                                decimals={0}
                                duration={1.2}
                                enableScrollSpy={true}
                                scrollSpyDelay={250}
                                separator=","
                              />
                            </>
                          )}
                        </td>
                        <td className="pr-2 md:pr-3 min-[1130px]:pr-5 py-2 text-right">
                          <p className={`${!$visible && "blur select-none"}`}>
                            {$visible ? (
                              <>
                                $<CountUp 
                                  end={vault.balanceInUSD} 
                                  decimals={2}
                                  duration={1.2}
                                  enableScrollSpy={true}
                                  scrollSpyDelay={300}
                                  separator=","
                                />
                              </>
                            ) : (
                              "$000"
                            )}
                          </p>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className="text-start h-[60px] font-medium">
                    {userVaultsCondition ? (
                      <td>
                        <p className="text-[18px]">
                          You haven't connected your wallet.
                        </p>
                        <p>Connect to view your vaults.</p>
                        <button
                          className="bg-[#30127f] text-[#fcf3f6] py-0.5 px-4 rounded-md min-w-[120px] mt-2"
                          onClick={() => open()}
                        >
                          Connect Wallet
                        </button>
                      </td>
                    ) : (
                      <td>
                  
                      </td>
                    )}
                  </tr>
                )}
              </>
            ) : (
              <tr className="text-start h-[60px] font-medium">
                <td>No vaults</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        vaults={filteredVaults}
        tab={currentTab}
        setTab={setCurrentTab}
      />
      {aprModal.state && (
        <APRModal state={aprModal} setModalState={setAprModal} />
      )}
      {vsHoldModal.state && (
        <VSHoldModal state={vsHoldModal} setModalState={setVsHoldModal} />
      )}
      {/* <a href="/factory">
        <button className="bg-button px-3 py-2 rounded-md text-[14px] mt-3">
          Create vault
        </button>
      </a> */}
    </>
  );
};

export { SonicVaults };
