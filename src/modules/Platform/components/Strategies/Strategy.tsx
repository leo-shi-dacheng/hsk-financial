import {getStrategyProtocols, integrations, strategyStateDescription} from "@stabilitydao/stability";

import type { StrategyShortId } from "@stabilitydao/stability";

import { Breadcrumbs, HeadingText } from "@ui";

import { StrategyStatus } from "../../ui";

import { StrategiesApiService, type StrategyApiData } from "../../services/strategiesApi";

import { StrategyChart } from "./Chart";

import type { TStrategyState } from "@types";

import { useState, useEffect } from "react";

interface IProps {
  strategyId: string;
}

const Strategy: React.FC<IProps> = ({ strategyId }) => {
  const [strategyData, setStrategyData] = useState<StrategyApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStrategyData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await StrategiesApiService.fetchStrategyById(strategyId);
        if (!data) {
          setError('Strategy not found');
          return;
        }
        setStrategyData(data);
      } catch (err) {
        console.error('Error loading strategy data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load strategy details');
      } finally {
        setLoading(false);
      }
    };

    loadStrategyData();
  }, [strategyId]);

  if (loading) {
    return (
      <div className="flex flex-col lg:w-[960px] xl:min-w-[1200px]">
        <Breadcrumbs
          links={["Platform", "Strategies", strategyId.toUpperCase()]}
        />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <span className="ml-4 text-lg">Loading strategy details...</span>
        </div>
      </div>
    );
  }

  if (error || !strategyData) {
    return (
      <div className="flex flex-col lg:w-[960px] xl:min-w-[1200px]">
        <Breadcrumbs
          links={["Platform", "Strategies", strategyId.toUpperCase()]}
        />
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-red-400 mb-4">
            <p className="text-xl font-semibold">Error loading strategy</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-accent-800 hover:bg-accent-700 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const strategy = strategyData;

  return (
    <div className="flex flex-col lg:w-[960px] xl:min-w-[1200px] space-y-8">
      <Breadcrumbs
        links={["Platform", "Strategies", strategyId.toUpperCase()]}
      />

      {/* Header Section */}
      <div className="bg-accent-950 rounded-[24px] p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                 style={{ backgroundColor: strategy.bgColor, color: strategy.color }}>
              {strategyId.toUpperCase()}
            </div>
            <div>
              <HeadingText text={strategy.id || strategyId.toUpperCase()} scale={2}/>
              <p className="text-neutral-400 text-lg">Strategy {strategy.id}</p>
              <div className="flex items-center gap-2 mt-2">
                <StrategyStatus state={strategy.state as TStrategyState}/>
                <span className="text-sm text-neutral-500">
                  {strategy.state && strategyStateDescription[strategy.state as keyof typeof strategyStateDescription]}
                </span>
              </div>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                ${(strategy.tvl || 0).toLocaleString()}
              </div>
              <div className="text-sm text-neutral-400">TVL</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {strategy.apy || '0.00'}%
              </div>
              <div className="text-sm text-neutral-400">APY</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {strategy.riskLevel || 'N/A'}
              </div>
              <div className="text-sm text-neutral-400">Risk Level</div>
            </div>
          </div>
        </div>
      </div>

      {/* K 线图 */}
      <StrategyChart strategyId={strategyId} />

      {/* Performance & Links Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Metrics */}
        <div className="bg-accent-950 rounded-[24px] p-6">
          <h3 className="text-xl font-semibold mb-4">Performance</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(strategy.performance || {}).map(([period, value]) => (
              <div key={period} className="flex justify-between items-center p-3 bg-accent-900 rounded-lg">
                <span className="text-neutral-400">{period}</span>
                <span className={`font-semibold ${
                  parseFloat(String(value)) > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* External Links */}
        <div className="bg-accent-950 rounded-[24px] p-6">
          <h3 className="text-xl font-semibold mb-4">Links & Resources</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Website', url: strategy.website, icon: '🌐' },
              { label: 'Documentation', url: strategy.documentation, icon: '📚' },
              { label: 'Twitter', url: strategy.twitter, icon: '🐦' },
              { label: 'Discord', url: strategy.discord, icon: '💬' },
              { label: 'Telegram', url: strategy.telegram, icon: '📱' },
              { label: 'Audit Report', url: strategy.audit, icon: '🔒' }
            ].map(({ label, url, icon }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-accent-900 rounded-lg hover:bg-accent-800 transition-colors"
              >
                <span className="text-lg">{icon}</span>
                <span className="text-sm">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Strategy Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Metrics */}
        <div className="bg-accent-950 rounded-[24px] p-6">
          <h3 className="text-xl font-semibold mb-4">Risk Analysis</h3>
          <div className="space-y-3">
            {Object.entries(strategy.riskMetrics || {}).map(([metric, value]) => (
              <div key={metric} className="flex justify-between items-center p-3 bg-accent-900 rounded-lg">
                <span className="text-neutral-400 capitalize">
                  {metric.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
                <span className="font-semibold">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fee Structure */}
        <div className="bg-accent-950 rounded-[24px] p-6">
          <h3 className="text-xl font-semibold mb-4">Fee Structure</h3>
          <div className="space-y-3">
            {Object.entries(strategy.fees || {}).map(([feeType, value]) => (
              <div key={feeType} className="flex justify-between items-center p-3 bg-accent-900 rounded-lg">
                <span className="text-neutral-400 capitalize">
                  {feeType} Fee
                </span>
                <span className="font-semibold">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Existing sections with improved styling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contract Development */}
        <div className="bg-accent-950 rounded-[24px] p-6">
          <h3 className="text-xl font-semibold mb-4">Contract Development</h3>
          <a
            className="inline-flex items-center gap-3 p-4 bg-accent-900 rounded-lg hover:bg-accent-800 transition-colors"
            href={`https://github.com/stabilitydao/stability-contracts/issues/${strategy.contractGithubId}`}
            target="_blank"
            title="Go to strategy issue page on Github"
          >
            <img src="/icons/github.svg" alt="Github" className="w-[24px]"/>
            <div>
              <div className="font-semibold">GitHub Issue</div>
              <div className="text-sm text-neutral-400">#{strategy.contractGithubId}</div>
            </div>
          </a>
        </div>

        {/* Statistics */}
        <div className="bg-accent-950 rounded-[24px] p-6">
          <h3 className="text-xl font-semibold mb-4">Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-accent-900 rounded-lg">
              <span className="text-neutral-400">Daily Volume</span>
              <span className="font-semibold">${(strategy.dailyVolume || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-accent-900 rounded-lg">
              <span className="text-neutral-400">Total Users</span>
              <span className="font-semibold">{(strategy.totalUsers || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Base Strategies & Protocols */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {strategy.baseStrategies?.length ? (
          <div className="bg-accent-950 rounded-[24px] p-6">
            <h3 className="text-xl font-semibold mb-4">Base Strategies</h3>
            <div className="space-y-2">
              {strategy.baseStrategies.map((baseStrategy: string, index: number) => (
                <div key={index} className="p-3 bg-accent-900 rounded-lg">
                  {baseStrategy}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="bg-accent-950 rounded-[24px] p-6">
          <h3 className="text-xl font-semibold mb-4">Protocols</h3>
          <div className="space-y-3">
            {getStrategyProtocols(strategy.shortId as StrategyShortId).map((protocol: any, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-accent-900 rounded-lg">
                <img 
                  className="w-[32px] h-[32px] rounded-full" 
                  src={`https://raw.githubusercontent.com/stabilitydao/.github/main/assets/${protocol.img || integrations[protocol.organization as string]?.img}`} 
                  alt={protocol.name}
                />
                <div>
                  <div className="font-semibold">{protocol.name}</div>
                  <div className="text-sm text-neutral-400">{protocol.organization}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      {strategy.description && (
        <div className="bg-accent-950 rounded-[24px] p-6">
          <h3 className="text-xl font-semibold mb-4">Strategy Description</h3>
          <p className="text-neutral-300 leading-relaxed text-lg">
            {strategy.description}
          </p>
        </div>
      )}
    </div>
  );
};

export {Strategy};
