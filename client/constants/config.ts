import { http, createConfig } from "wagmi";
import { mainnet, sepolia, holesky } from "wagmi/chains";

import { injected, metaMask, safe, walletConnect } from "wagmi/connectors";

const projectId = "YOUR_INFURA_PROJECT_ID";
export const config = createConfig({
  chains: [mainnet, sepolia, holesky],
  connectors: [
    // injected(),
    walletConnect({ projectId }),
    // metaMask(),
    // safe(),
  ],
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [holesky.id]: http(),
  },
});
