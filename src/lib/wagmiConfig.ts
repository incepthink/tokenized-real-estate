import { http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const config = getDefaultConfig({
  appName: "EstateChain",
  projectId: "estatechain-demo-project",
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});
