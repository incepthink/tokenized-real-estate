import { useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { PROPERTIES } from '@/lib/dummyData';
import { getMarkersForProperty } from '@/lib/storage';
import PropertyChart from '@/components/PropertyChart';
import SwapPanel from '@/components/SwapPanel';
import HoldingsTable from '@/components/HoldingsTable';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address } = useAccount();
  const property = PROPERTIES.find(p => p.id === id);

  const [lastMarker, setLastMarker] = useState<{ type: 'Buy' | 'Sell'; time: number } | null>(null);

  const storedMarkers = address && id ? getMarkersForProperty(address, id) : [];

  const handleSwap = useCallback((marker: { type: 'Buy' | 'Sell'; time: number }) => {
    setLastMarker(marker);
  }, []);

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg text-muted-foreground font-body mb-4">Property not found</p>
        <Button variant="outline" onClick={() => navigate('/')} className="gap-2 rounded-button">
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground font-body mb-4">
        <Link to="/" className="hover:text-foreground transition-colors">Explore</Link>
        <span className="mx-2">›</span>
        <span className="text-foreground">{property.name}</span>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start">
        <PropertyChart
          propertyId={property.id}
          newMarker={lastMarker}
          storedMarkers={storedMarkers}
        />
        <SwapPanel
          property={property}
          onSwapExecuted={handleSwap}
        />
      </div>

      {/* Holdings */}
      <HoldingsTable />
    </div>
  );
}
