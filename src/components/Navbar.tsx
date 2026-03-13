import { Link, useLocation } from "react-router-dom";
import { Building2 } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const navItems = [
  { label: "Explore", path: "/" },
  { label: "Portfolio", path: "/account" },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="sticky top-0 z-50 h-16 bg-card border-b border-card-border flex items-center px-6">
      <Link to="/" className="flex items-center gap-2 mr-8">
        <Building2 className="w-6 h-6 text-primary" />
        <span className="font-heading text-xl font-bold text-foreground">
          EstateChain
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
        {navItems.map((item) => {
          const isActive =
            item.path === "/"
              ? pathname === "/"
              : pathname.startsWith(item.path);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`relative font-body text-sm transition-colors duration-150 pb-1 ${
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="ml-auto">
        <ConnectButton chainStatus="icon" showBalance={false} />
      </div>
    </nav>
  );
}
