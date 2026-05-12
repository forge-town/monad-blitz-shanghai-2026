import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { monad } from "wagmi/chains";
import { formatUnits } from "viem";

export const ConnectWallet = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address,
    chainId: monad.id,
  });

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex flex-col text-sm">
          <span className="font-mono text-xs">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          {balance && (
            <span className="text-muted-foreground text-xs">
              {Number(formatUnits(balance.value, balance.decimals)).toFixed(4)} {balance.symbol}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => disconnect()}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          type="button"
          key={connector.uid}
          onClick={() => connect({ connector, chainId: monad.id })}
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Connecting..." : `Connect ${connector.name}`}
        </button>
      ))}
    </div>
  );
};
