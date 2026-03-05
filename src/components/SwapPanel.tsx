import { useState } from 'react';
import { ArrowUpDown, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { toast } from 'sonner';
import type { Property } from '@/lib/dummyData';
import { saveTransaction } from '@/lib/storage';

interface Props {
  property: Property;
  onSwapExecuted: (marker: { type: 'Buy' | 'Sell'; time: number }) => void;
}

const slippageOptions = [0.5, 1, 2.5];

export default function SwapPanel({ property, onSwapExecuted }: Props) {
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
  const ownershipPercent = mode === 'Buy'
    ? (receiveAmount / totalSupply) * 100
    : 0;

  const handleSwap = async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
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

      {/* Buy/Sell tabs */}
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
            {mode === 'Buy' ? 'USDC' : property.tokenSymbol}
          </span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground font-body">
            Balance: {mode === 'Buy' ? '300.00 USDC' : `50.00 ${property.tokenSymbol}`}
          </span>
          <button
            onClick={() => setAmount(mode === 'Buy' ? '300' : '50')}
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
            {payAmount > 0 ? receiveAmount.toFixed(4) : '0'}
          </span>
          <span className="text-sm font-medium font-body text-muted-foreground bg-secondary px-2 py-1 rounded">
            {mode === 'Buy' ? property.tokenSymbol : 'USDC'}
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

      {/* Action button */}
      <button
        onClick={handleSwap}
        disabled={loading}
        className={`w-full mt-4 h-12 rounded-button font-body text-sm font-medium transition-all duration-150 active:scale-[0.98] text-primary-foreground ${
          mode === 'Buy' ? 'bg-primary hover:bg-primary-hover' : 'bg-danger hover:opacity-90'
        } disabled:opacity-60`}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
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
