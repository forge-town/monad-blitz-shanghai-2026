import { WagmiProvider } from "wagmi";
import type { FC, PropsWithChildren } from "react";
import { wagmiConfig } from "./config";

export const Web3Provider: FC<PropsWithChildren> = ({ children }) => {
  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>;
};
