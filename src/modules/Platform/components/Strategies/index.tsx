import { useState, useEffect } from "react";

import { Breadcrumbs, HeadingText, Counter } from "@ui";

import { StrategyStatus, ProtocolsChip } from "../../ui";

import { STRATEGIES_TABLE } from "@constants";

import { STRATEGIES_INFO, STRATEGY_STATUSES } from "../../constants";

import { StrategiesApiService, type StrategyApiData } from "../../services/strategiesApi";

import type { TStrategyState, TTableColumn } from "@types";

const toStrategy = (shortId: string): void => {
  window.location.href = `/strategies/${shortId.toLowerCase()}`;
};

// Custom sort function for StrategyApiData
const sortStrategiesData = (
  data: StrategyApiData[],
  table: TTableColumn[]
): StrategyApiData[] => {
  let sortedData = [...data];

  table.forEach((column: TTableColumn) => {
    if (column.sortType !== "none") {
      sortedData = sortedData.sort((a, b) => {
        const aValue = String((a as any)[column.keyName] || '');
        const bValue = String((b as any)[column.keyName] || '');
        
        if (column.dataType === "number") {
          const aNum = parseFloat(aValue) || 0;
          const bNum = parseFloat(bValue) || 0;
          return column.sortType === "asc" ? aNum - bNum : bNum - aNum;
        } else {
          return column.sortType === "asc" 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
      });
    }
  });

  return sortedData;
};

const Strategies = (): JSX.Element => {
  const [tableStates, setTableStates] = useState(STRATEGIES_TABLE);
  const [tableData, setTableData] = useState<StrategyApiData[]>([]);
  const [filteredTableData, setFilteredTableData] = useState<StrategyApiData[]>(
    []
  );
  const [activeStrategies, setActiveStrategies] = useState(STRATEGIES_INFO);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initTableData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const strategyStatuses = searchParams.getAll("status");
      
      const strategiesData = await StrategiesApiService.fetchStrategies();

      const filteredStrategiesData = strategyStatuses.length
        ? strategiesData.filter((strategy) =>
            strategyStatuses.includes(strategy.state.toLowerCase())
          )
        : strategiesData;

      const filteredStrategies = strategyStatuses.length
        ? activeStrategies.map((strategy) =>
            strategyStatuses.includes(
              strategy.name.toLowerCase().split(" ").join("_")
            )
              ? { ...strategy, active: !strategy.active }
              : strategy
          )
        : activeStrategies.map((strategy) => ({ ...strategy, active: true }));

      setTableData(strategiesData);
      setActiveStrategies(filteredStrategies);
      setFilteredTableData(filteredStrategiesData);
    } catch (err) {
      console.error('Error initializing table data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load strategies');
    } finally {
      setLoading(false);
    }
  };

  const activeStrategiesHandler = (category: string) => {
    let updatedStrategies = activeStrategies.map((strategy) =>
      category === strategy.name
        ? { ...strategy, active: !strategy.active }
        : strategy
    );

    ///// For chains URL filters
    const newUrl = new URL(window.location.href);
    const params = new URLSearchParams(newUrl.search);
    /////

    const allActive = activeStrategies.every((strategy) => strategy.active);
    const allInactive = updatedStrategies.every((strategy) => !strategy.active);

    if (allInactive) {
      updatedStrategies = activeStrategies.map((strategy) => ({
        ...strategy,
        active: true,
      }));
    } else if (allActive) {
      updatedStrategies = activeStrategies.map((strategy) => ({
        ...strategy,
        active: strategy.name === category,
      }));
    }

    /// URL set
    const activeChainsLength = updatedStrategies.filter(
      (strategy) => strategy.active
    )?.length;

    if (activeChainsLength === updatedStrategies.length) {
      params.delete("status");
    } else {
      params.delete("status");

      updatedStrategies.forEach((strategy) => {
        const type = strategy.name.toLowerCase().split(" ").join("_");

        if (strategy.active) {
          params.append("status", type);
        }
      });
    }

    newUrl.search = `?${params.toString()}`;
    window.history.pushState({}, "", newUrl.toString());

    setActiveStrategies(updatedStrategies);
  };

  const tableHandler = (table: TTableColumn[] = tableStates) => {
    const strategiesToFilter = activeStrategies.filter(
      (strategy) => strategy.active
    );

    let data: StrategyApiData[] = [];
    //filter
    strategiesToFilter.forEach((strategy) => {
      if (strategy.active) {
        data.push(
          ...tableData.filter(
            (row) =>
              row.state ===
              STRATEGY_STATUSES[strategy.name as keyof typeof STRATEGY_STATUSES]
          )
        );
      }
    });
    
    //sort
    const sortedData = sortStrategiesData(data, table);
    setFilteredTableData(sortedData);
    setTableStates(table);
  };

  // Custom handler for column sort
  const handleColumnSort = (index: number, _columnName: string) => {
    const newTableStates = [...tableStates];
    
    // Reset all other columns
    newTableStates.forEach((col, i) => {
      if (i !== index) {
        col.sortType = "none";
      }
    });
    
    // Toggle current column
    const currentSort = newTableStates[index].sortType;
    if (currentSort === "none") {
      newTableStates[index].sortType = "desc";
    } else if (currentSort === "desc") {
      newTableStates[index].sortType = "asc";
    } else {
      newTableStates[index].sortType = "none";
    }
    
    tableHandler(newTableStates);
  };

  useEffect(() => {
    tableHandler();
  }, [activeStrategies]);

  useEffect(() => {
    initTableData();
  }, []);

  return (
    <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
      <div className="hidden">
        <Breadcrumbs links={["Platform", "Strategies"]} />
        <HeadingText text="Strategies" scale={1} />
      </div>

      <div className="bg-accent-950 p-[26px] rounded-[44px] mb-6 flex flex-col select-none">
        <div className="flex flex-wrap relative justify-evenly gap-5">
          {activeStrategies.map(({ name, length, bgColor, active }) => (
            <div
              key={name}
              className={`flex p-[12px] ${active ? "opacity-100" : "opacity-50"} cursor-pointer`}
              onClick={() => activeStrategiesHandler(name)}
            >
              <Counter color={bgColor} value={length.toString()} name={name} />
            </div>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto md:overflow-x-visible md:min-w-[700px]">
        <table className="w-full font-manrope table table-auto select-none mb-9 min-w-[700px] md:min-w-full">
          <thead className="bg-accent-950 text-neutral-600 h-[36px]">
            <tr className="text-[12px] uppercase">
              {tableStates.map((value: TTableColumn, index: number) => (
                <th 
                  key={value.name + index}
                  className="px-4 py-2 text-left cursor-pointer hover:bg-accent-900 transition-colors"
                  onClick={() => handleColumnSort(index, value.name)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] uppercase">{value.name}</span>
                    {value.sortType !== "none" && (
                      <span className="text-xs">
                        {value.sortType === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <span className="ml-2">Loading strategies...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center">
                  <div className="text-red-400">
                    <p className="text-lg font-semibold">Error loading strategies</p>
                    <p className="text-sm mt-2">{error}</p>
                    <button 
                      onClick={initTableData}
                      className="mt-4 px-4 py-2 bg-accent-800 hover:bg-accent-700 rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </td>
              </tr>
            ) : !!filteredTableData.length ? (
              filteredTableData.map(
                ({ id, shortId, state, color, bgColor }) => {
                  return (
                    <tr
                      onClick={() => toStrategy(shortId)}
                      className="h-[48px] hover:bg-accent-950 cursor-pointer transition-colors"
                      key={shortId}
                    >
                      <td className="px-4 py-3 text-center sticky md:relative left-0 md:table-cell bg-accent-950 md:bg-transparent z-10">
                        <ProtocolsChip
                          id={shortId as any}
                          bgColor={bgColor}
                          color={color}
                        />
                      </td>
                      <td className="px-4 py-3 text-[16px] font-semibold flex justify-center">
                        {id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <StrategyStatus state={state as TStrategyState} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <a
                            onClick={(event) => event.stopPropagation()}
                            className="inline-flex hover:opacity-80 transition-opacity"
                            href={`https://github.com/stabilitydao/stability-contracts/issues`}
                            target="_blank"
                            title="Go to strategy repository on Github"
                          >
                            <img
                              src="/icons/github.svg"
                              alt="Github"
                              className="w-[20px]"
                            />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center">
                  <p className="text-[18px]">No strategies found.</p>
                  <p className="min-w-[200px] text-neutral-400 mt-2">
                    Try clearing your filters or adjusting your search criteria.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { Strategies };
