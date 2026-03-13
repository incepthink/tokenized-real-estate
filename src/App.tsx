import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { config } from "@/lib/wagmiConfig";

import Navbar from "./components/Navbar";
import ExplorePage from "./pages/ExplorePage";
import PropertyPage from "./pages/PropertyPage";
import AccountPage from "./pages/AccountPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <BrowserRouter basename="/examples/tokenized-real-estate">
            <Navbar />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<ExplorePage />} />
                <Route path="/property/:id" element={<PropertyPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </BrowserRouter>
        </TooltipProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
