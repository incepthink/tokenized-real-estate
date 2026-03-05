export interface Property {
  id: string;
  name: string;
  city: string;
  type: 'Residential' | 'Commercial' | 'Industrial';
  status: 'Active' | 'Coming Soon' | 'Sold Out';
  tokenSymbol: string;
  tokenPrice: number;
  marketCap: number;
  fundedPercent: number;
  image: string;
  pinned?: boolean;
  /** Deployed PropertyToken contract address — enables live on-chain data */
  contractAddress?: string;
}

export const PROPERTIES: Property[] = [
  { id:"alpha", name:"Property Alpha", city:"Mumbai", type:"Residential", status:"Active", tokenSymbol:"PRPA", tokenPrice:45.00, marketCap:3200000, fundedPercent:87, image:"https://images.unsplash.com/photo-1660145416818-b9a2b1a1f193?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", pinned:true, contractAddress:"0xD9AF49Fa0494a43Fd7FF9d7f37f02edFbf634Ae7" },
  { id:"beta",  name:"Property Beta",  city:"Mumbai", type:"Residential", status:"Active", tokenSymbol:"PRPB", tokenPrice:45.00, marketCap:3200000, fundedPercent:87, image:"https://images.unsplash.com/photo-1660145416818-b9a2b1a1f193?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", pinned:true, contractAddress:"0x5D2feF52a1fCabe0F23ce2CE0512028Ab566Cd91" },
  { id:"meridian", name:"The Meridian Residences", city:"New York", type:"Residential", status:"Active", tokenSymbol:"MRDX", tokenPrice:45.00, marketCap:3200000, fundedPercent:87, image:"https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800" },
  { id:"harbor", name:"Harbor View Commercial Tower", city:"Miami", type:"Commercial", status:"Active", tokenSymbol:"HVCX", tokenPrice:12.50, marketCap:8100000, fundedPercent:34, image:"https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800" },
  { id:"sunset", name:"Sunset Industrial Park", city:"Los Angeles", type:"Industrial", status:"Coming Soon", tokenSymbol:"SNSX", tokenPrice:8.00, marketCap:1500000, fundedPercent:0, image:"https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800" },
  { id:"parklane", name:"Park Lane Apartments", city:"Chicago", type:"Residential", status:"Sold Out", tokenSymbol:"PLAX", tokenPrice:67.00, marketCap:4800000, fundedPercent:100, image:"https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800" },
  { id:"austin", name:"Downtown Austin Plaza", city:"Austin", type:"Commercial", status:"Active", tokenSymbol:"DAPL", tokenPrice:22.00, marketCap:2900000, fundedPercent:61, image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800" },
  { id:"dubai", name:"Marina Heights Tower", city:"Dubai", type:"Commercial", status:"Active", tokenSymbol:"MHTX", tokenPrice:31.00, marketCap:6400000, fundedPercent:52, image:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800" },
  { id:"brooklyn", name:"Brooklyn Creative Lofts", city:"New York", type:"Residential", status:"Active", tokenSymbol:"BCLX", tokenPrice:18.00, marketCap:1800000, fundedPercent:74, image:"https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800" },
  { id:"portland", name:"Portland Logistics Hub", city:"Los Angeles", type:"Industrial", status:"Coming Soon", tokenSymbol:"PLHX", tokenPrice:5.50, marketCap:950000, fundedPercent:12, image:"https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800" },
];

// Generate realistic OHLCV candlestick data
function generateCandlesticks(basePrice: number, days: number): { time: string; open: number; high: number; low: number; close: number }[] {
  const data: { time: string; open: number; high: number; low: number; close: number }[] = [];
  let price = basePrice * 0.85;
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const volatility = basePrice * 0.03;
    const drift = (basePrice - price) * 0.02;
    const open = price;
    const change1 = (Math.random() - 0.45) * volatility + drift;
    const change2 = (Math.random() - 0.45) * volatility + drift;
    const close = open + change1;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    price = close;
    data.push({
      time: dateStr,
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
    });
  }
  return data;
}

export const CANDLESTICK_DATA: Record<string, { time: string; open: number; high: number; low: number; close: number }[]> = {};
PROPERTIES.forEach(p => {
  CANDLESTICK_DATA[p.id] = generateCandlesticks(p.tokenPrice, 90);
});

export interface UserHolding {
  propertyId: string;
  tokenSymbol: string;
  name: string;
  balance: number;
  entryPrice: number;
  currentPrice: number;
}

export const USER_HOLDINGS: UserHolding[] = [
  { propertyId:"meridian", tokenSymbol:"MRDX", name:"The Meridian Residences", balance:12.5, entryPrice:41.20, currentPrice:45.00 },
  { propertyId:"harbor", tokenSymbol:"HVCX", name:"Harbor View Commercial Tower", balance:44, entryPrice:14.10, currentPrice:12.50 },
  { propertyId:"austin", tokenSymbol:"DAPL", name:"Downtown Austin Plaza", balance:8, entryPrice:19.80, currentPrice:22.00 },
  { propertyId:"brooklyn", tokenSymbol:"BCLX", name:"Brooklyn Creative Lofts", balance:20, entryPrice:20.50, currentPrice:18.00 },
];

// Equity history: 90 days
export const EQUITY_HISTORY: { time: number; value: number }[] = (() => {
  const data: { time: number; value: number }[] = [];
  const now = Math.floor(Date.now() / 1000);
  const daySeconds = 86400;
  for (let i = 90; i >= 0; i--) {
    const t = now - i * daySeconds;
    let value: number;
    const dayIndex = 90 - i;
    if (dayIndex < 14) {
      value = 95 + Math.random() * 8 - 4;
    } else if (dayIndex < 49) {
      const progress = (dayIndex - 14) / 35;
      value = 95 + progress * 665 + Math.random() * 20 - 10;
    } else {
      value = 760 + Math.random() * 40 - 10 + (dayIndex - 49) * 0.75;
    }
    data.push({ time: t, value: +value.toFixed(2) });
  }
  // Ensure last value is ~791.81
  data[data.length - 1].value = 791.81;
  return data;
})();

export interface Transaction {
  id: string;
  type: 'Buy' | 'Sell';
  propertyId: string;
  tokenSymbol: string;
  propertyName: string;
  amount: number;
  pricePerToken: number;
  totalValue: number;
  wallet: string;
  timestamp: number;
}

const wallets = ['0x1a2B...3c4D', '0x5e6F...7a8B', '0x9c0D...1e2F', '0x3a4B...5c6D', '0xAb12...Cd34'];
const now = Math.floor(Date.now() / 1000);

export const TRANSACTION_HISTORY: Transaction[] = [
  { id:'tx1', type:'Buy', propertyId:'meridian', tokenSymbol:'MRDX', propertyName:'The Meridian Residences', amount:5, pricePerToken:43.50, totalValue:217.50, wallet:wallets[0], timestamp:now-86400*1 },
  { id:'tx2', type:'Sell', propertyId:'harbor', tokenSymbol:'HVCX', propertyName:'Harbor View Commercial Tower', amount:10, pricePerToken:13.00, totalValue:130.00, wallet:wallets[1], timestamp:now-86400*2 },
  { id:'tx3', type:'Buy', propertyId:'austin', tokenSymbol:'DAPL', propertyName:'Downtown Austin Plaza', amount:3, pricePerToken:21.50, totalValue:64.50, wallet:wallets[2], timestamp:now-86400*3 },
  { id:'tx4', type:'Buy', propertyId:'brooklyn', tokenSymbol:'BCLX', propertyName:'Brooklyn Creative Lofts', amount:8, pricePerToken:17.50, totalValue:140.00, wallet:wallets[0], timestamp:now-86400*4 },
  { id:'tx5', type:'Sell', propertyId:'meridian', tokenSymbol:'MRDX', propertyName:'The Meridian Residences', amount:2, pricePerToken:44.00, totalValue:88.00, wallet:wallets[3], timestamp:now-86400*5 },
  { id:'tx6', type:'Buy', propertyId:'dubai', tokenSymbol:'MHTX', propertyName:'Marina Heights Tower', amount:6, pricePerToken:30.00, totalValue:180.00, wallet:wallets[1], timestamp:now-86400*6 },
  { id:'tx7', type:'Buy', propertyId:'harbor', tokenSymbol:'HVCX', propertyName:'Harbor View Commercial Tower', amount:20, pricePerToken:12.80, totalValue:256.00, wallet:wallets[4], timestamp:now-86400*7 },
  { id:'tx8', type:'Sell', propertyId:'austin', tokenSymbol:'DAPL', propertyName:'Downtown Austin Plaza', amount:1, pricePerToken:22.50, totalValue:22.50, wallet:wallets[2], timestamp:now-86400*8 },
  { id:'tx9', type:'Buy', propertyId:'meridian', tokenSymbol:'MRDX', propertyName:'The Meridian Residences', amount:7.5, pricePerToken:42.00, totalValue:315.00, wallet:wallets[0], timestamp:now-86400*10 },
  { id:'tx10', type:'Sell', propertyId:'brooklyn', tokenSymbol:'BCLX', propertyName:'Brooklyn Creative Lofts', amount:5, pricePerToken:18.50, totalValue:92.50, wallet:wallets[3], timestamp:now-86400*11 },
  { id:'tx11', type:'Buy', propertyId:'dubai', tokenSymbol:'MHTX', propertyName:'Marina Heights Tower', amount:4, pricePerToken:29.50, totalValue:118.00, wallet:wallets[1], timestamp:now-86400*13 },
  { id:'tx12', type:'Sell', propertyId:'harbor', tokenSymbol:'HVCX', propertyName:'Harbor View Commercial Tower', amount:15, pricePerToken:13.20, totalValue:198.00, wallet:wallets[4], timestamp:now-86400*15 },
  { id:'tx13', type:'Buy', propertyId:'austin', tokenSymbol:'DAPL', propertyName:'Downtown Austin Plaza', amount:5, pricePerToken:20.00, totalValue:100.00, wallet:wallets[2], timestamp:now-86400*18 },
  { id:'tx14', type:'Buy', propertyId:'brooklyn', tokenSymbol:'BCLX', propertyName:'Brooklyn Creative Lofts', amount:12, pricePerToken:19.00, totalValue:228.00, wallet:wallets[0], timestamp:now-86400*20 },
  { id:'tx15', type:'Sell', propertyId:'meridian', tokenSymbol:'MRDX', propertyName:'The Meridian Residences', amount:3, pricePerToken:45.50, totalValue:136.50, wallet:wallets[3], timestamp:now-86400*22 },
  { id:'tx16', type:'Buy', propertyId:'harbor', tokenSymbol:'HVCX', propertyName:'Harbor View Commercial Tower', amount:25, pricePerToken:11.80, totalValue:295.00, wallet:wallets[1], timestamp:now-86400*25 },
  { id:'tx17', type:'Sell', propertyId:'dubai', tokenSymbol:'MHTX', propertyName:'Marina Heights Tower', amount:2, pricePerToken:31.50, totalValue:63.00, wallet:wallets[4], timestamp:now-86400*28 },
  { id:'tx18', type:'Buy', propertyId:'meridian', tokenSymbol:'MRDX', propertyName:'The Meridian Residences', amount:10, pricePerToken:40.00, totalValue:400.00, wallet:wallets[2], timestamp:now-86400*30 },
  { id:'tx19', type:'Sell', propertyId:'austin', tokenSymbol:'DAPL', propertyName:'Downtown Austin Plaza', amount:2, pricePerToken:21.00, totalValue:42.00, wallet:wallets[0], timestamp:now-86400*35 },
  { id:'tx20', type:'Buy', propertyId:'brooklyn', tokenSymbol:'BCLX', propertyName:'Brooklyn Creative Lofts', amount:15, pricePerToken:17.00, totalValue:255.00, wallet:wallets[3], timestamp:now-86400*40 },
];

export const PORTFOLIO_SUMMARY = {
  totalValue: 791.81,
  pnl: -66.14,
  roi: -7.71,
  depositedTotal: 858.00,
};

export const HOLDING_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
