import { useState } from 'react';
import { ArrowUpDown, Loader2 } from 'lucide-react';
import { useAccount, useWriteContract } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { parseEther, formatEther } from 'viem';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { toast } from 'sonner';
import type { Property } from '@/lib/dummyData';
import { saveTransaction } from '@/lib/storage';
import { config } from '@/lib/wagmiConfig';
import {
  PROPERTY_SWAP_ADDRESS,
  PROPERTY_TOKEN_ABI,
  PROPERTY_SWAP_ABI,
} from '@/lib/contracts';
import { useSwapData } from '@/hooks/useSwapData';

interface Props {
  property: Property;
  onSwapExecuted: (marker: { type: 'Buy' | 'Sell'; time: number }) => void;
}

const slippageOptions = [0.5, 1, 2.5];

// ─── On-chain swap panel ─────────────────────────────────────────────────────

function OnChainSwapPanel({ property, onSwapExecuted }: Props) {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync } = useWriteContract();
  const [mode, setMode] = useState<'Buy' | 'Sell'>('Buy');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [sellStep, setSellStep] = useState<'approving' | 'selling' | null>(null);

  const { priceInWei, ethBalanceWei, tokenBalanceWei,
          ethBalanceFormatted, tokenBalanceFormatted, refetchBalances } =
    useSwapData(property.contractAddress, address);

  const payAmount = parseFloat(amount) || 0;

  // Derived receive amounts
  const tokensOut: bigint = (() => {
    if (mode !== 'Buy' || payAmount <= 0 || priceInWei === 0n) return 0n;
    try {
      const ethWei = parseEther(amount);
      return ethWei / priceInWei;
    } catch { return 0n; }
  })();

  const ethOut: number = (() => {
    if (mode !== 'Sell' || payAmount <= 0 || priceInWei === 0n) return 0;
    return payAmount * Number(formatEther(priceInWei));
  })();

  const priceEth = priceInWei > 0n ? Number(formatEther(priceInWei)) : 0;

  const handleSwap = async () => {
    if (!isConnected) { openConnectModal?.(); return; }
    if (payAmount <= 0 || !property.contractAddress) return;

    setLoading(true);
    try {
      const tokenAddr = property.contractAddress as `0x${string}`;
      const ts = Math.floor(Date.now() / 1000);

      if (mode === 'Buy') {
        if (tokensOut === 0n) { toast.error('Amount too small'); return; }
        const ethValue = tokensOut * priceInWei;

        const hash = await writeContractAsync({
          address: PROPERTY_SWAP_ADDRESS,
          abi: PROPERTY_SWAP_ABI as never,
          functionName: 'buy',
          args: [tokenAddr, tokensOut],
          value: ethValue,
        });
        await waitForTransactionReceipt(config, { hash });

        const tokenAmountNum = Number(tokensOut);
        const ethSpent = Number(formatEther(ethValue));

        if (address) {
          saveTransaction(address, {
            id: `tx_${Date.now()}`,
            type: 'Buy',
            propertyId: property.id,
            propertyName: property.name,
            tokenSymbol: property.tokenSymbol,
            amount: tokenAmountNum,
            pricePerToken: priceEth,
            totalValue: ethSpent,
            wallet: address,
            timestamp: ts,
          });
        }
        refetchBalances();
        onSwapExecuted({ type: 'Buy', time: ts });
        toast.success(`Bought ${tokenAmountNum} ${property.tokenSymbol} for ${ethSpent.toFixed(6)} ETH`);

      } else {
        // Sell: approve → sell
        const tokenAmountWhole = BigInt(Math.floor(payAmount));
        const tokenAmountWei = tokenAmountWhole * 10n ** 18n;

        setSellStep('approving');
        const approveHash = await writeContractAsync({
          address: tokenAddr,
          abi: PROPERTY_TOKEN_ABI as never,
          functionName: 'approve',
          args: [PROPERTY_SWAP_ADDRESS, tokenAmountWei],
        });
        await waitForTransactionReceipt(config, { hash: approveHash });

        setSellStep('selling');
        const sellHash = await writeContractAsync({
          address: PROPERTY_SWAP_ADDRESS,
          abi: PROPERTY_SWAP_ABI as never,
          functionName: 'sell',
          args: [tokenAddr, tokenAmountWhole],
        });
        await waitForTransactionReceipt(config, { hash: sellHash });

        const ethReceived = Number(tokenAmountWhole) * priceEth;

        if (address) {
          saveTransaction(address, {
            id: `tx_${Date.now()}`,
            type: 'Sell',
            propertyId: property.id,
            propertyName: property.name,
            tokenSymbol: property.tokenSymbol,
            amount: Number(tokenAmountWhole),
            pricePerToken: priceEth,
            totalValue: ethReceived,
            wallet: address,
            timestamp: ts,
          });
        }
        refetchBalances();
        onSwapExecuted({ type: 'Sell', time: ts });
        toast.success(`Sold ${Number(tokenAmountWhole)} ${property.tokenSymbol} for ${ethReceived.toFixed(6)} ETH`);
      }

      setAmount('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('User rejected')) toast.error('Transaction failed');
    } finally {
      setLoading(false);
      setSellStep(null);
    }
  };

  const maxBalance = mode === 'Buy' ? ethBalanceFormatted : tokenBalanceFormatted;

  const buttonLabel = () => {
    if (!loading) return `${mode} Tokens`;
    if (mode === 'Sell') {
      if (sellStep === 'approving') return 'Approving…';
      if (sellStep === 'selling') return 'Selling…';
    }
    return 'Confirming…';
  };

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 sticky top-24">
      <p className="text-sm text-muted-foreground font-body">{property.name}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="font-heading text-2xl font-bold">
          {priceEth > 0 ? `${priceEth} ETH` : '—'}
        </span>
        <span className="text-xs text-muted-foreground font-body">per token</span>
      </div>

      {/* Buy/Sell tabs */}
      <div className="flex gap-2 mt-5">
        {(['Buy', 'Sell'] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setAmount(''); }}
            className={`flex-1 py-2 rounded-button text-sm font-body font-medium transition-all duration-150 ${
              mode === m
                ? m === 'Buy' ? 'bg-primary text-primary-foreground' : 'bg-danger text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* You Pay */}
      <div className="mt-5">
        <label className="text-xs text-muted-foreground font-body">You Pay</label>
        <div className="mt-1 flex items-center border border-card-border rounded-button px-3 h-12">
          <input
            type="number"
            min="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            className="flex-1 bg-transparent outline-none font-body text-base"
          />
          <span className="text-sm font-medium font-body text-muted-foreground bg-secondary px-2 py-1 rounded">
            {mode === 'Buy' ? 'ETH' : property.tokenSymbol}
          </span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground font-body">
            Balance: {mode === 'Buy'
              ? `${ethBalanceFormatted} ETH`
              : `${tokenBalanceFormatted} ${property.tokenSymbol}`}
          </span>
          <button
            onClick={() => setAmount(maxBalance)}
            className="text-xs text-primary font-body font-medium"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center my-3">
        <ArrowUpDown className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* You Receive */}
      <div>
        <label className="text-xs text-muted-foreground font-body">You Receive</label>
        <div className="mt-1 flex items-center border border-card-border rounded-button px-3 h-12 bg-secondary/50">
          <span className="flex-1 font-body text-base">
            {mode === 'Buy'
              ? (tokensOut > 0n ? tokensOut.toString() : '0')
              : (ethOut > 0 ? ethOut.toFixed(6) : '0')}
          </span>
          <span className="text-sm font-medium font-body text-muted-foreground bg-secondary px-2 py-1 rounded">
            {mode === 'Buy' ? property.tokenSymbol : 'ETH'}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="bg-background rounded-lg p-3 mt-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground font-body">Slippage</span>
          <div className="flex gap-1">
            {slippageOptions.map(s => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={`px-2 py-0.5 rounded text-xs font-body transition-colors duration-150 ${
                  slippage === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground font-body">Price per token</span>
          <span className="text-xs font-body">{priceEth} ETH</span>
        </div>
        {mode === 'Buy' && tokensOut > 0n && (
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground font-body">Total cost</span>
            <span className="text-xs font-body">
              {formatEther(tokensOut * priceInWei)} ETH
            </span>
          </div>
        )}
      </div>

      {/* Action button */}
      <button
        onClick={handleSwap}
        disabled={loading}
        className={`w-full mt-4 h-12 rounded-button font-body text-sm font-medium transition-all duration-150 active:scale-[0.98] text-primary-foreground ${
          mode === 'Buy' ? 'bg-primary hover:bg-primary-hover' : 'bg-danger hover:opacity-90'
        } disabled:opacity-60`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {buttonLabel()}
          </span>
        ) : (
          `${mode} Tokens`
        )}
      </button>

      {!isConnected && (
        <p className="text-xs text-muted-foreground text-center mt-2 font-body">
          Requires wallet connection
        </p>
      )}
    </div>
  );
}

// ─── Mock swap panel (unchanged for non-on-chain properties) ─────────────────

function MockSwapPanel({ property, onSwapExecuted }: Props) {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [mode, setMode] = useState<'Buy' | 'Sell'>('Buy');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [loading, setLoading] = useState(false);

  const payAmount = parseFloat(amount) || 0;
  const receiveAmount = mode === 'Buy'
    ? payAmount / property.tokenPrice
    : payAmount * property.tokenPrice;
  const totalSupply = property.marketCap / property.tokenPrice;
  const ownershipPercent = mode === 'Buy' ? (receiveAmount / totalSupply) * 100 : 0;

  const handleSwap = async () => {
    if (!isConnected) { openConnectModal?.(); return; }
    if (payAmount <= 0) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    const tokenAmount = mode === 'Buy' ? receiveAmount : payAmount;
    const usdAmount = mode === 'Buy' ? payAmount : receiveAmount;
    const ts = Math.floor(Date.now() / 1000);
    if (address) {
      saveTransaction(address, {
        id: `tx_${Date.now()}`,
        type: mode,
        propertyId: property.id,
        propertyName: property.name,
        tokenSymbol: property.tokenSymbol,
        amount: +tokenAmount.toFixed(4),
        pricePerToken: property.tokenPrice,
        totalValue: +usdAmount.toFixed(2),
        wallet: address,
        timestamp: ts,
      });
    }
    onSwapExecuted({ type: mode, time: ts });
    toast.success(
      mode === 'Buy'
        ? `Purchased ${tokenAmount.toFixed(2)} ${property.tokenSymbol} for ${payAmount.toFixed(2)} USDC`
        : `Sold ${payAmount.toFixed(2)} ${property.tokenSymbol} for ${receiveAmount.toFixed(2)} USDC`
    );
    setAmount('');
  };

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 sticky top-24">
      <p className="text-sm text-muted-foreground font-body">{property.name}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="font-heading text-3xl font-bold">${property.tokenPrice.toFixed(2)}</span>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">▲ +2.3%</span>
      </div>
      <div className="flex gap-2 mt-5">
        {(['Buy', 'Sell'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-button text-sm font-body font-medium transition-all duration-150 ${
              mode === m
                ? m === 'Buy' ? 'bg-primary text-primary-foreground' : 'bg-danger text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      <div className="mt-5">
        <label className="text-xs text-muted-foreground font-body">You Pay</label>
        <div className="mt-1 flex items-center border border-card-border rounded-button px-3 h-12">
          <input
            type="number" min="0" value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            className="flex-1 bg-transparent outline-none font-body text-base"
          />
          <span className="text-sm font-medium font-body text-muted-foreground bg-secondary px-2 py-1 rounded">
            {mode === 'Buy' ? 'USDC' : property.tokenSymbol}
          </span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground font-body">
            Balance: {mode === 'Buy' ? '300.00 USDC' : `50.00 ${property.tokenSymbol}`}
          </span>
          <button onClick={() => setAmount(mode === 'Buy' ? '300' : '50')} className="text-xs text-primary font-body font-medium">MAX</button>
        </div>
      </div>
      <div className="flex justify-center my-3">
        <ArrowUpDown className="w-5 h-5 text-muted-foreground" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground font-body">You Receive</label>
        <div className="mt-1 flex items-center border border-card-border rounded-button px-3 h-12 bg-secondary/50">
          <span className="flex-1 font-body text-base">{payAmount > 0 ? receiveAmount.toFixed(4) : '0'}</span>
          <span className="text-sm font-medium font-body text-muted-foreground bg-secondary px-2 py-1 rounded">
            {mode === 'Buy' ? property.tokenSymbol : 'USDC'}
          </span>
        </div>
      </div>
      <div className="bg-background rounded-lg p-3 mt-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground font-body">Slippage</span>
          <div className="flex gap-1">
            {slippageOptions.map(s => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={`px-2 py-0.5 rounded text-xs font-body transition-colors duration-150 ${
                  slippage === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground font-body">Gas Fee</span>
          <span className="text-xs font-body">~$1.24</span>
        </div>
        {mode === 'Buy' && payAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground font-body">Ownership</span>
            <span className="text-xs font-body">{ownershipPercent.toFixed(3)}% after this purchase</span>
          </div>
        )}
      </div>
      <button
        onClick={handleSwap}
        disabled={loading}
        className={`w-full mt-4 h-12 rounded-button font-body text-sm font-medium transition-all duration-150 active:scale-[0.98] text-primary-foreground ${
          mode === 'Buy' ? 'bg-primary hover:bg-primary-hover' : 'bg-danger hover:opacity-90'
        } disabled:opacity-60`}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : `${mode} Tokens`}
      </button>
      {!isConnected && (
        <p className="text-xs text-muted-foreground text-center mt-2 font-body">Requires wallet connection</p>
      )}
    </div>
  );
}

// ─── Router ──────────────────────────────────────────────────────────────────

export default function SwapPanel(props: Props) {
  return props.property.contractAddress
    ? <OnChainSwapPanel {...props} />
    : <MockSwapPanel {...props} />;
}
