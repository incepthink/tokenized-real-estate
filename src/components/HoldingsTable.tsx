import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { USER_HOLDINGS, PORTFOLIO_SUMMARY, HOLDING_COLORS, PROPERTIES } from '@/lib/dummyData';
import { useSwapData } from '@/hooks/useSwapData';
import { PROPERTY_TOKEN_ADDRESSES, ETH_USD_PRICE } from '@/lib/contracts';

export default function HoldingsTable() {
  const { address } = useAccount();

  const alphaData = useSwapData(PROPERTY_TOKEN_ADDRESSES.alpha, address);
  const betaData = useSwapData(PROPERTY_TOKEN_ADDRESSES.beta, address);

  const alphaPriceUsd = Number(alphaData.priceInWei) / 1e18 * ETH_USD_PRICE;
  const betaPriceUsd = Number(betaData.priceInWei) / 1e18 * ETH_USD_PRICE;
  const alphaBalance = parseFloat(alphaData.tokenBalanceFormatted);
  const betaBalance = parseFloat(betaData.tokenBalanceFormatted);

  // Store entry price in localStorage on first load when balance > 0
  useEffect(() => {
    if (!address) return;
    const pairs = [
      { symbol: 'PRPA', balance: alphaBalance, price: alphaPriceUsd },
      { symbol: 'PRPB', balance: betaBalance, price: betaPriceUsd },
    ];
    for (const { symbol, balance, price } of pairs) {
      if (balance > 0 && price > 0) {
        const key = `holding_entry_${address.toLowerCase()}_${symbol}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, String(price));
        }
      }
    }
  }, [address, alphaBalance, betaBalance, alphaPriceUsd, betaPriceUsd]);

  // Build on-chain rows (only when balance > 0 and data is ready)
  const onChainConfig = [
    { symbol: 'PRPA', data: alphaData, balance: alphaBalance, currentPrice: alphaPriceUsd },
    { symbol: 'PRPB', data: betaData, balance: betaBalance, currentPrice: betaPriceUsd },
  ];

  const onChainRows = onChainConfig
    .filter(({ balance, data }) => !data.isLoading && balance > 0)
    .map(({ symbol, balance, currentPrice }) => {
      const key = `holding_entry_${address?.toLowerCase()}_${symbol}`;
      const stored = localStorage.getItem(key);
      const entryPrice = stored ? parseFloat(stored) : currentPrice;
      const prop = PROPERTIES.find(p => p.tokenSymbol === symbol)!;
      return { prop, balance, currentPrice, entryPrice };
    });

  const onChainTotalValue = onChainRows.reduce((s, r) => s + r.balance * r.currentPrice, 0);
  const totalValue = PORTFOLIO_SUMMARY.totalValue + onChainTotalValue;

  return (
    <div className="mt-8 bg-card rounded-xl p-6 shadow-card">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <h2 className="font-heading text-xl font-bold">Your Holdings</h2>
        <div className="flex items-center gap-4 text-sm font-body">
          <span>Total Value <strong>${totalValue.toFixed(2)}</strong></span>
          <span className="text-card-border">|</span>
          <span>P&L <strong className="text-danger">${PORTFOLIO_SUMMARY.pnl.toFixed(2)}</strong></span>
          <span className="text-card-border">|</span>
          <span>ROI <strong className="text-danger">{PORTFOLIO_SUMMARY.roi.toFixed(2)}%</strong></span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-card-border">
              {['Token', 'Balance', 'Entry Price', 'Current Price', 'Value', 'P&L', 'ROI', 'Share %'].map(h => (
                <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted-foreground font-body py-3 px-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* On-chain rows: PRPA and PRPB */}
            {onChainRows.map((r, i) => {
              const value = r.balance * r.currentPrice;
              const pnl = (r.currentPrice - r.entryPrice) * r.balance;
              const roi = r.entryPrice > 0 ? ((r.currentPrice - r.entryPrice) / r.entryPrice) * 100 : 0;
              const share = totalValue > 0 ? (value / totalValue) * 100 : 0;
              const isPositive = pnl >= 0;

              return (
                <tr key={r.prop.tokenSymbol} className={`border-b border-card-border ${i % 2 === 1 ? 'bg-background' : ''}`}>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: HOLDING_COLORS[i] }} />
                      <div>
                        <p className="text-sm font-body font-medium">{r.prop.name}</p>
                        <p className="text-xs text-muted-foreground font-body">{r.prop.tokenSymbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm font-body">{r.balance.toFixed(2)}</td>
                  <td className="px-3 py-3 text-sm font-body">${r.entryPrice.toFixed(2)}</td>
                  <td className="px-3 py-3 text-sm font-body">${r.currentPrice.toFixed(2)}</td>
                  <td className="px-3 py-3 text-sm font-body font-medium">${value.toFixed(2)}</td>
                  <td className={`px-3 py-3 text-sm font-body font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
                    {isPositive ? '+' : ''}${pnl.toFixed(2)}
                  </td>
                  <td className={`px-3 py-3 text-sm font-body font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
                    {isPositive ? '+' : ''}{roi.toFixed(2)}%
                  </td>
                  <td className="px-3 py-3 text-sm font-body">{share.toFixed(1)}%</td>
                </tr>
              );
            })}

            {/* Dummy holdings */}
            {USER_HOLDINGS.map((h, i) => {
              const colorIdx = onChainRows.length + i;
              const value = h.balance * h.currentPrice;
              const pnl = (h.currentPrice - h.entryPrice) * h.balance;
              const roi = ((h.currentPrice - h.entryPrice) / h.entryPrice) * 100;
              const share = (value / totalValue) * 100;
              const isPositive = pnl >= 0;

              return (
                <tr key={h.propertyId} className={`border-b border-card-border ${(onChainRows.length + i) % 2 === 1 ? 'bg-background' : ''}`}>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: HOLDING_COLORS[colorIdx % HOLDING_COLORS.length] }} />
                      <div>
                        <p className="text-sm font-body font-medium">{h.name}</p>
                        <p className="text-xs text-muted-foreground font-body">{h.tokenSymbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm font-body">{h.balance}</td>
                  <td className="px-3 py-3 text-sm font-body">${h.entryPrice.toFixed(2)}</td>
                  <td className="px-3 py-3 text-sm font-body">${h.currentPrice.toFixed(2)}</td>
                  <td className="px-3 py-3 text-sm font-body font-medium">${value.toFixed(2)}</td>
                  <td className={`px-3 py-3 text-sm font-body font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
                    {isPositive ? '+' : ''}${pnl.toFixed(2)}
                  </td>
                  <td className={`px-3 py-3 text-sm font-body font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
                    {isPositive ? '+' : ''}{roi.toFixed(2)}%
                  </td>
                  <td className="px-3 py-3 text-sm font-body">{share.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
