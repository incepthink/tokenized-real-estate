import { useState, useMemo } from "react";
import { Search, TrendingUp, Building2, Users, X } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { PROPERTIES } from "@/lib/dummyData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const statusOptions = ["All", "Active", "Coming Soon", "Sold Out"] as const;
const typeOptions = [
  "All Types",
  "Residential",
  "Commercial",
  "Industrial",
] as const;
const cities = [
  "All Cities",
  ...Array.from(new Set(PROPERTIES.map((p) => p.city))),
];
const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Token Price ↑" },
  { value: "price-desc", label: "Token Price ↓" },
  { value: "funded", label: "% Funded" },
  { value: "mcap", label: "Market Cap" },
];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("All");
  const [type, setType] = useState("All Types");
  const [city, setCity] = useState("All Cities");
  const [priceRange, setPriceRange] = useState([1, 500]);
  const [mcapRange, setMcapRange] = useState([100000, 10000000]);
  const [fundedRange, setFundedRange] = useState([0, 100]);
  const [sort, setSort] = useState("featured");

  const hasFilters =
    status !== "All" ||
    type !== "All Types" ||
    city !== "All Cities" ||
    priceRange[0] !== 1 ||
    priceRange[1] !== 500 ||
    mcapRange[0] !== 100000 ||
    mcapRange[1] !== 10000000 ||
    fundedRange[0] !== 0 ||
    fundedRange[1] !== 100;
  const activeFilterCount = [
    status !== "All",
    type !== "All Types",
    city !== "All Cities",
    priceRange[0] !== 1 || priceRange[1] !== 500,
    mcapRange[0] !== 100000 || mcapRange[1] !== 10000000,
    fundedRange[0] !== 0 || fundedRange[1] !== 100,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setStatus("All");
    setType("All Types");
    setCity("All Cities");
    setPriceRange([1, 500]);
    setMcapRange([100000, 10000000]);
    setFundedRange([0, 100]);
    setSearch("");
  };

  const filtered = useMemo(() => {
    let result = PROPERTIES.filter((p) => {
      if (
        search &&
        !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.city.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (status !== "All" && p.status !== status) return false;
      if (type !== "All Types" && p.type !== type) return false;
      if (city !== "All Cities" && p.city !== city) return false;
      if (p.tokenPrice < priceRange[0] || p.tokenPrice > priceRange[1])
        return false;
      if (p.marketCap < mcapRange[0] || p.marketCap > mcapRange[1])
        return false;
      if (p.fundedPercent < fundedRange[0] || p.fundedPercent > fundedRange[1])
        return false;
      return true;
    });

    if (sort === "price-asc")
      result.sort((a, b) => a.tokenPrice - b.tokenPrice);
    else if (sort === "price-desc")
      result.sort((a, b) => b.tokenPrice - a.tokenPrice);
    else if (sort === "funded")
      result.sort((a, b) => b.fundedPercent - a.fundedPercent);
    else if (sort === "mcap") result.sort((a, b) => b.marketCap - a.marketCap);

    return result;
  }, [search, status, type, city, priceRange, mcapRange, fundedRange, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Hero */}
      <section className="text-center py-20">
        <h1 className="font-heading text-5xl md:text-[52px] leading-tight text-foreground">
          Invest in Real Estate,
          <br />
          One Token at a Time
        </h1>
        <p className="mt-4 text-lg text-muted-foreground font-body max-w-xl mx-auto">
          Fractional property ownership powered by blockchain. Start from as
          little as $10.
        </p>
        <div className="flex justify-center gap-8 mt-10">
          {[
            { icon: TrendingUp, value: "$24.6M", label: "Total Value Locked" },
            { icon: Building2, value: "142", label: "Properties Listed" },
            { icon: Users, value: "8,400+", label: "Investors" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <s.icon className="w-5 h-5 text-primary" />
              <span className="font-heading text-xl font-bold text-primary">
                {s.value}
              </span>
              <span className="text-xs text-muted-foreground font-body">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Search + Filters */}
      <div className="sticky top-16 z-40 bg-card shadow-sm rounded-card py-4 px-4 -mx-4 sm:mx-0">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, city, or address..."
              className="w-full h-12 pl-11 pr-4 rounded-full border border-card-border bg-card font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {activeFilterCount > 0 && (
            <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded-full font-body whitespace-nowrap">
              {activeFilterCount} active
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-3 pb-1">
          {/* Status pills */}
          <div className="flex gap-1 shrink-0">
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all duration-150 whitespace-nowrap ${
                  status === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-card-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[140px] h-8 text-xs font-body rounded-button shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-[130px] h-8 text-xs font-body rounded-button shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="shrink-0 min-w-[140px]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[12px] text-muted-foreground font-body">
                Token Price
              </span>
              <span className="text-[10px] text-muted-foreground font-body">
                ${priceRange[0]} – ${priceRange[1]}
              </span>
            </div>
            <Slider
              min={1}
              max={500}
              step={1}
              value={priceRange}
              onValueChange={setPriceRange}
              className="mt-1"
            />
          </div>

          <div className="shrink-0 min-w-[140px]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[12px] text-muted-foreground font-body">
                Market Cap
              </span>
              <span className="text-[10px] text-muted-foreground font-body">
                ${(mcapRange[0] / 1e6).toFixed(1)}M – $
                {(mcapRange[1] / 1e6).toFixed(1)}M
              </span>
            </div>
            <Slider
              min={100000}
              max={10000000}
              step={100000}
              value={mcapRange}
              onValueChange={setMcapRange}
              className="mt-1"
            />
          </div>

          <div className="shrink-0 min-w-[120px]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[12px] text-muted-foreground font-body">
                Funded
              </span>
              <span className="text-[10px] text-muted-foreground font-body">
                {fundedRange[0]}% – {fundedRange[1]}%
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={fundedRange}
              onValueChange={setFundedRange}
              className="mt-1"
            />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-primary font-body font-medium whitespace-nowrap flex items-center gap-1 shrink-0"
            >
              <X className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results bar */}
      <div className="flex justify-between items-center mt-4 mb-4">
        <span className="text-sm text-muted-foreground font-body">
          Showing {filtered.length} of {PROPERTIES.length} properties
        </span>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[160px] h-8 text-xs font-body rounded-button">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground font-body">
            No properties match your filters
          </p>
          <button
            onClick={clearFilters}
            className="mt-3 text-sm text-primary font-body font-medium"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
