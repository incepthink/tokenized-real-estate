export interface StoredTransaction {
  id: string;
  type: 'Buy' | 'Sell';
  propertyId: string;
  propertyName: string;
  tokenSymbol: string;
  amount: number;
  pricePerToken: number;
  totalValue: number;
  wallet: string;
  timestamp: number;
}

const key = (wallet: string) => `estatechain_${wallet.toLowerCase()}`;

export function getStoredTransactions(wallet: string): StoredTransaction[] {
  try {
    const raw = localStorage.getItem(key(wallet));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTransaction(wallet: string, tx: StoredTransaction): void {
  const existing = getStoredTransactions(wallet);
  localStorage.setItem(key(wallet), JSON.stringify([tx, ...existing]));
}

export function getMarkersForProperty(wallet: string, propertyId: string) {
  return getStoredTransactions(wallet)
    .filter(tx => tx.propertyId === propertyId)
    .map(tx => ({
      time: tx.timestamp as unknown as string,
      position: tx.type === 'Buy' ? ('belowBar' as const) : ('aboveBar' as const),
      color: tx.type === 'Buy' ? '#10B981' : '#EF4444',
      shape: tx.type === 'Buy' ? ('arrowUp' as const) : ('arrowDown' as const),
      text: tx.type.toUpperCase(),
    }));
}
