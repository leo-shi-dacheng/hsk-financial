import type { TAddress, TTokenData } from "@types";
import tokenlist from "@stabilitydao/stability/out/stability.tokenlist.json";

const getTokenData = (address: string): TTokenData | undefined => {
  for (const token of tokenlist.tokens) {
    if (token.address.toLowerCase() === address.toLowerCase()) {
      return {
        address: token.address.toLowerCase() as TAddress,
        chainId: token.chainId,
        decimals: token.decimals,
        name: token.name,
        symbol: token.symbol,
        logoURI: token.logoURI,
        tags: token?.tags,
      };
    }
  }
  return undefined;
};

export { getTokenData };
