import { USER_HOLDINGS, PORTFOLIO_SUMMARY, HOLDING_COLORS } from '@/lib/dummyData';

export default function HoldingsTable() {
  const totalValue = PORTFOLIO_SUMMARY.totalValue;

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
            {USER_HOLDINGS.map((h, i) => {
              const value = h.balance * h.currentPrice;
              const pnl = (h.currentPrice - h.entryPrice) * h.balance;
              const roi = ((h.currentPrice - h.entryPrice) / h.entryPrice) * 100;
              const share = (value / totalValue) * 100;
              const isPositive = pnl >= 0;

              return (
                <tr key={h.propertyId} className={`border-b border-card-border ${i % 2 === 1 ? 'bg-background' : ''}`}>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: HOLDING_COLORS[i] }} />
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
