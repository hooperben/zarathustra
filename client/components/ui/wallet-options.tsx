"use client";

import * as React from "react";
import { Connector, useConnect } from "wagmi";

export function WalletOptions() {
  const { connectors, connect } = useConnect();

  return connectors.map((connector) => (
    <WalletOption
      key={connector.uid}
      connector={connector}
      onClick={() => connect({ connector })}
    />
  ));
}

function WalletOption({
  connector,
  onClick,
}: {
  connector: Connector;
  onClick: () => void;
}) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const provider = await connector.getProvider();
      setReady(!!provider);
    })();
  }, [connector]);

  return (
    <div className="flex justify-center items-center ">
      <button
        className="w-[200px] m-2  bg-blue-500 text-white font-bold py-2 px-4 rounded transition transform hover:bg-blue-700 hover:scale-105 active:bg-blue-800 active:scale-95"
        disabled={!ready}
        onClick={onClick}
      >
        {connector.name}
      </button>
    </div>
  );
}
