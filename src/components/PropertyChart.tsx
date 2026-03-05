import { useRef, useEffect, useState } from 'react';
import { createChart, CrosshairMode, type IChartApi } from 'lightweight-charts';
import { CANDLESTICK_DATA, TRANSACTION_HISTORY, type Transaction } from '@/lib/dummyData';

interface Props {
  propertyId: string;
  newMarker?: { type: 'Buy' | 'Sell'; time: number } | null;
  storedMarkers?: { time: any; position: string; color: string; shape: string; text: string }[];
}

const intervals = ['1H', '4H', '1D', '1W'] as const;

export default function PropertyChart({ propertyId, newMarker, storedMarkers = [] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'history'>('chart');
  const [activeInterval, setActiveInterval] = useState<string>('1D');
  const [markers, setMarkers] = useState<any[]>([]);

  // Apply stored markers on mount
  useEffect(() => {
    if (storedMarkers.length > 0) {
      setMarkers(storedMarkers);
    }
  }, [storedMarkers]);

  // Handle new marker from swap
  useEffect(() => {
    if (newMarker) {
      const m = {
        time: newMarker.time as any,
        position: newMarker.type === 'Buy' ? 'belowBar' : 'aboveBar',
        color: newMarker.type === 'Buy' ? '#10B981' : '#EF4444',
        shape: newMarker.type === 'Buy' ? 'arrowUp' : 'arrowDown',
        text: newMarker.type.toUpperCase(),
      };
      setMarkers(prev => [...prev, m]);
    }
  }, [newMarker]);

  useEffect(() => {
    if (activeTab !== 'chart' || !containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { type: 'solid' as any, color: '#111827' }, textColor: '#9CA3AF' },
      grid: { vertLines: { color: '#1F2937' }, horzLines: { color: '#1F2937' } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: '#374151' },
      timeScale: { borderColor: '#374151', timeVisible: true },
      width: containerRef.current.clientWidth,
      height: 420,
    });

    chartRef.current = chart;

    const series = chart.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderUpColor: '#10B981',
      borderDownColor: '#EF4444',
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    let data = CANDLESTICK_DATA[propertyId] || [];
    if (activeInterval === '1H') data = data.slice(-3);
    else if (activeInterval === '4H') data = data.slice(-7);
    else if (activeInterval === '1W') {
      data = data.filter((_, i) => i % 7 === 0);
    }

    series.setData(data as any);
    if (markers.length > 0) {
      try { series.setMarkers(markers as any); } catch {}
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [activeTab, propertyId, activeInterval, markers]);

  const propertyTxns = TRANSACTION_HISTORY.filter(tx => tx.propertyId === propertyId);

  return (
    <div>
      {/* Tab pills */}
      <div className="flex gap-2 mb-4">
        {(['chart', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-button text-sm font-body font-medium transition-all duration-150 ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'chart' ? 'Chart' : 'History'}
          </button>
        ))}
      </div>

      {activeTab === 'chart' ? (
        <div>
          <div ref={containerRef} className="bg-[#111827] rounded-xl" style={{ height: 460 }} />
          <div className="flex gap-2 mt-3">
            {intervals.map(iv => (
              <button
                key={iv}
                onClick={() => setActiveInterval(iv)}
                className={`px-3 py-1.5 rounded-button text-xs font-body font-medium transition-all duration-150 ${
                  activeInterval === iv
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-[#1F2937] text-[#9CA3AF] hover:text-white'
                }`}
              >
                {iv}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl overflow-auto max-h-[460px]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-card-border">
                {['Type', 'Amount', 'Price/Token', 'Total Value', 'Wallet', 'Time'].map(h => (
                  <th key={h} className="text-left text-[11px] uppercase tracking-wide text-muted-foreground font-body py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {propertyTxns.map((tx, i) => (
                <tr key={tx.id} className={`border-b border-card-border ${i % 2 === 1 ? 'bg-background' : ''}`}>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-primary-foreground ${tx.type === 'Buy' ? 'bg-success' : 'bg-danger'}`}>
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-body">{tx.amount}</td>
                  <td className="px-4 py-3 text-sm font-body">${tx.pricePerToken.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-body">${tx.totalValue.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-body text-muted-foreground">{tx.wallet}</td>
                  <td className="px-4 py-3 text-sm font-body text-muted-foreground">{new Date(tx.timestamp * 1000).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
