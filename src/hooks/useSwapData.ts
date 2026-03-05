import { useReadContract, useBalance } from "wagmi";
import { formatEther, formatUnits } from "viem";
import {
  PROPERTY_SWAP_ADDRESS,
  PROPERTY_TOKEN_ABI,
  PROPERTY_SWAP_ABI,
} from "@/lib/contracts";

export interface SwapData {
  /** ETH wei cost for 1 whole token (e.g. 100000000000000n = 0.0001 ETH) */
  priceInWei: bigint;
  /** User's ETH balance in wei */
  ethBalanceWei: bigint;
  /** User's token balance in token-wei (18 decimals) */
  tokenBalanceWei: bigint;
  /** Formatted ETH balance string (e.g. "0.4521") */
  ethBalanceFormatted: string;
  /** Formatted token balance string (e.g. "12.0") */
  tokenBalanceFormatted: string;
  isLoading: boolean;
  /** Refetch both ETH and token balances (call after a confirmed swap) */
  refetchBalances: () => void;
}

const FALLBACK: SwapData = {
  priceInWei: 0n,
  ethBalanceWei: 0n,
  tokenBalanceWei: 0n,
  ethBalanceFormatted: "0",
  tokenBalanceFormatted: "0",
  isLoading: false,
  refetchBalances: () => {},
};

export function useSwapData(
  contractAddress: string | undefined,
  userAddress: string | undefined
): SwapData {
  const hasContract = Boolean(contractAddress);
  const hasUser = Boolean(userAddress);

  const { data: priceInWei, isLoading: priceLoading } = useReadContract({
    address: PROPERTY_SWAP_ADDRESS,
    abi: PROPERTY_SWAP_ABI as never,
    functionName: "getBuyPrice",
    args: [contractAddress as `0x${string}`, 1n],
    query: { enabled: hasContract },
  });

  const { data: ethBalance, isLoading: ethLoading, refetch: refetchEth } = useBalance({
    address: userAddress as `0x${string}`,
    query: { enabled: hasUser },
  });

  const { data: tokenBalanceRaw, isLoading: tokenLoading, refetch: refetchToken } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: PROPERTY_TOKEN_ABI as never,
    functionName: "balanceOf",
    args: [userAddress as `0x${string}`],
    query: { enabled: hasContract && hasUser },
  });

  if (!hasContract) return FALLBACK;

  const isLoading = priceLoading || ethLoading || tokenLoading;
  const price = (priceInWei as bigint | undefined) ?? 0n;
  const ethWei = ethBalance?.value ?? 0n;
  const tokenWei = (tokenBalanceRaw as bigint | undefined) ?? 0n;

  return {
    priceInWei: price,
    ethBalanceWei: ethWei,
    tokenBalanceWei: tokenWei,
    ethBalanceFormatted: parseFloat(formatEther(ethWei)).toFixed(4),
    tokenBalanceFormatted: parseFloat(formatUnits(tokenWei, 18)).toFixed(2),
    isLoading,
    refetchBalances: () => { refetchEth(); refetchToken(); },
  };
}
