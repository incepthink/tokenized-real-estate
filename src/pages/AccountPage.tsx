import { useRef, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { createChart } from 'lightweight-charts';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, Info, ArrowUp, ArrowDown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  USER_HOLDINGS, EQUITY_HISTORY, TRANSACTION_HISTORY,
  PORTFOLIO_SUMMARY, HOLDING_COLORS,
} from '@/lib/dummyData';

export default function AccountPage() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Wallet className="w-16 h-16 text-muted-foreground" />
        <p className="text-muted-foreground font-body text-lg">Connect your wallet to view your portfolio</p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <BalanceHeader />
      <EquityTrend />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <TokenPortfolio />
        <RecentTransactions />
      </div>
    </div>
  );
}

function BalanceHeader() {
  return (
    <div className="bg-card rounded-xl p-8 shadow-card flex flex-wrap justify-between items-start gap-4">
      <div>
        <p className="text-[11px] text-muted-foreground font-body uppercase tracking-widest">Estimated Balance</p>
        <p className="font-heading text-4xl md:text-[44px] font-bold mt-1">${PORTFOLIO_SUMMARY.totalValue.toFixed(2)} USD</p>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Wallet Holdings (${PORTFOLIO_SUMMARY.totalValue.toFixed(2)}) + Yield Vaults ($0.00)
        </p>
      </div>
      <div className="flex gap-2">
        {['Deposit', 'Withdraw', 'Transfer'].map(label => (
          <Button key={label} variant="outline" size="sm" className="rounded-button font-body text-xs">
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function EquityTrend() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { type: 'solid' as any, color: '#111827' }, textColor: '#9CA3AF' },
      grid: { vertLines: { color: '#1F2937' }, horzLines: { color: '#1F2937' } },
      rightPriceScale: { borderColor: '#374151' },
      timeScale: { borderColor: '#374151', timeVisible: false },
      width: containerRef.current.clientWidth,
      height: 320,
    });

    const series = chart.addAreaSeries({
      lineColor: '#1A6B5A',
      topColor: 'rgba(26,107,90,0.3)',
      bottomColor: 'rgba(26,107,90,0.0)',
      lineWidth: 2,
    });

    series.setData(EQUITY_HISTORY.map(d => ({ time: d.time as any, value: d.value })));
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chart.remove(); };
  }, []);

  return (
    <div className="bg-card rounded-xl p-6 shadow-card mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-body text-lg font-bold">Equity Trend</h2>
          <UITooltip>
            <TooltipTrigger><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger>
            <TooltipContent><p className="font-body text-xs">Portfolio value over time</p></TooltipContent>
          </UITooltip>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">+731.95%</span>
          <span className="text-xs text-muted-foreground font-body">Last 90 days</span>
        </div>
      </div>
      <div ref={containerRef} className="mt-4 bg-[#111827] rounded-xl" style={{ height: 320 }} />
    </div>
  );
}

function TokenPortfolio() {
  const holdingsData = USER_HOLDINGS.map(h => ({
    name: h.tokenSymbol,
    value: +(h.balance * h.currentPrice).toFixed(2),
  }));

  return (
    <div className="bg-card rounded-xl p-6 shadow-card">
      <h2 className="font-body text-lg font-bold mb-4">Token Portfolio</h2>
      <div className="relative">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={holdingsData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" nameKey="name" paddingAngle={2}>
              {holdingsData.map((_, i) => <Cell key={i} fill={HOLDING_COLORS[i]} />)}
            </Pie>
            <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-body">Total Portfolio</p>
            <p className="font-heading text-lg font-bold">${PORTFOLIO_SUMMARY.totalValue.toFixed(2)}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        {USER_HOLDINGS.map((h, i) => {
          const val = h.balance * h.currentPrice;
          const pct = (val / PORTFOLIO_SUMMARY.totalValue * 100).toFixed(1);
          return (
            <div key={h.propertyId} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: HOLDING_COLORS[i] }} />
              <span className="text-xs font-body">{h.tokenSymbol}</span>
              <span className="text-xs font-body font-medium">${val.toFixed(0)}</span>
              <span className="text-xs text-muted-foreground font-body">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentTransactions() {
  const [filter, setFilter] = useState<'All' | 'Buy' | 'Sell'>('All');
  const txns = TRANSACTION_HISTORY
    .filter(tx => filter === 'All' || tx.type === filter)
    .slice(0, 10);

  return (
    <div className="bg-card rounded-xl p-6 shadow-card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-body text-lg font-bold">Recent Transactions</h2>
        <div className="flex gap-1">
          {(['All', 'Buy', 'Sell'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-body font-medium transition-all duration-150 ${
                filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-0">
        {txns.length === 0 ? (
          <div className="flex flex-col items-center py-12">
            <Building2 className="w-10 h-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground font-body">No transactions found</p>
          </div>
        ) : (
          txns.map(tx => (
            <div key={tx.id} className="flex justify-between items-center py-3 border-b border-background">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'Buy' ? 'bg-success/10' : 'bg-danger/10'}`}>
                  {tx.type === 'Buy'
                    ? <ArrowUp className="w-4 h-4 text-success" />
                    : <ArrowDown className="w-4 h-4 text-danger" />
                  }
                </div>
                <div>
                  <p className="text-sm font-body font-medium">{tx.propertyName}</p>
                  <p className="text-xs text-muted-foreground font-body">{tx.tokenSymbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-body font-medium">{tx.amount} {tx.tokenSymbol}</p>
                <p className="text-xs text-muted-foreground font-body">${tx.totalValue.toFixed(2)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
