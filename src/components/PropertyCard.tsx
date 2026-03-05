import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import type { Property } from '@/lib/dummyData';

const statusColors: Record<string, string> = {
  Active: 'bg-success',
  'Coming Soon': 'bg-accent',
  'Sold Out': 'bg-muted-foreground',
};

export default function PropertyCard({ property }: { property: Property }) {
  const navigate = useNavigate();
  const go = () => navigate(`/property/${property.id}`);

  return (
    <div
      onClick={go}
      className="bg-card rounded-card shadow-card cursor-pointer transition-all duration-150 hover:-translate-y-1 hover:shadow-card-hover overflow-hidden group"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={property.image}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium text-primary-foreground ${statusColors[property.status]}`}>
          {property.status}
        </span>
        <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium bg-card text-foreground">
          {property.type}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-heading text-lg font-bold text-foreground leading-tight">{property.name}</h3>
        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span className="text-xs font-body">{property.city}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wide">Token Price</p>
            <p className="font-heading text-base font-bold">${property.tokenPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-body uppercase tracking-wide">Market Cap</p>
            <p className="font-heading text-base font-bold">${(property.marketCap / 1e6).toFixed(1)}M</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-muted-foreground font-body">{property.fundedPercent}% Funded</span>
            <span className="text-xs font-bold text-accent font-body">{property.fundedPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${property.fundedPercent}%` }}
            />
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); go(); }}
          className="w-full mt-4 h-10 bg-primary text-primary-foreground rounded-button font-body text-sm font-medium transition-all duration-150 hover:bg-primary-hover active:scale-[0.98]"
        >
          Buy Tokens
        </button>
      </div>
    </div>
  );
}
