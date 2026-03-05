import { useReadContracts } from "wagmi";
import {
  PROPERTY_SWAP_ADDRESS,
  PROPERTY_TOKEN_ABI,
  PROPERTY_SWAP_ABI,
  ETH_USD_PRICE,
} from "@/lib/contracts";

export interface OnChainPropertyData {
  tokenPrice: number;
  marketCap: number;
  fundedPercent: number;
  isLoading: boolean;
}

/**
 * Reads on-chain tokenPrice, marketCap, and fundedPercent for a deployed
 * PropertyToken contract. Returns null values (and isLoading: false) when
 * no contractAddress is provided, so non-pinned cards are unaffected.
 */
export function usePropertyOnChainData(
  contractAddress: string | undefined,
  fallback: { tokenPrice: number; marketCap: number; fundedPercent: number }
): OnChainPropertyData {
  const enabled = Boolean(contractAddress);

  const { data, isLoading } = useReadContracts({
    contracts: enabled
      ? [
          {
            address: contractAddress as `0x${string}`,
            abi: PROPERTY_TOKEN_ABI as never,
            functionName: "totalSupply",
          },
          {
            address: contractAddress as `0x${string}`,
            abi: PROPERTY_TOKEN_ABI as never,
            functionName: "balanceOf",
            args: [PROPERTY_SWAP_ADDRESS],
          },
          {
            address: PROPERTY_SWAP_ADDRESS,
            abi: PROPERTY_SWAP_ABI as never,
            functionName: "getBuyPrice",
            args: [contractAddress as `0x${string}`, 1n],
          },
        ]
      : [],
    query: { enabled },
  });

  if (!enabled || isLoading || !data) {
    return { ...fallback, isLoading: enabled && isLoading };
  }

  const [totalSupplyResult, swapBalanceResult, buyPriceResult] = data;

  if (
    totalSupplyResult.status !== "success" ||
    swapBalanceResult.status !== "success" ||
    buyPriceResult.status !== "success"
  ) {
    return { ...fallback, isLoading: false };
  }

  const totalSupply = totalSupplyResult.result as bigint;
  const swapBalance = swapBalanceResult.result as bigint;
  const priceInWei = buyPriceResult.result as bigint;

  // priceInWei = cost in ETH wei to buy 1 full token (1e18 units)
  const tokenPriceEth = Number(priceInWei) / 1e18;
  const tokenPrice = tokenPriceEth * ETH_USD_PRICE;

  // marketCap = tokenPrice * total token supply (accounting for 18 decimals)
  const totalSupplyNum = Number(totalSupply) / 1e18;
  const marketCap = tokenPrice * totalSupplyNum;

  // fundedPercent = % of tokens that have been sold (not sitting in swap contract)
  const soldTokens = totalSupply - swapBalance;
  const fundedPercent =
    totalSupply > 0n
      ? Math.round((Number(soldTokens) / Number(totalSupply)) * 100)
      : 0;

  return { tokenPrice, marketCap, fundedPercent, isLoading: false };
}
