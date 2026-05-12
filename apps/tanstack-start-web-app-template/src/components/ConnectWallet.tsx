import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { monadTestnet } from "wagmi/chains";
import { formatUnits } from "viem";

export const ConnectWallet = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address,
    chainId: monadTestnet.id,
  });

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-col overflow-hidden">
          <span className="truncate font-mono text-xs font-medium">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          {balance && (
            <span className="truncate text-[10px] text-muted-foreground">
              {Number(formatUnits(balance.value, balance.decimals)).toFixed(4)} {balance.symbol}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => disconnect()}
          className="shrink-0 rounded-md border px-2 py-1 text-xs hover:bg-accent"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {connectors.slice(0, 1).map((connector) => (
        <button
          type="button"
          key={connector.uid}
          onClick={() => connect({ connector, chainId: monadTestnet.id })}
          disabled={isPending}
          className="w-full rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "..." : "Connect Wallet"}
        </button>
      ))}
    </div>
  );
};
