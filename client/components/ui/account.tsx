import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";

export function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

  return (
    <div className="flex flex-col justify-center w-[100%]">
      {/* {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
      {address && <div>{ensName ? `${ensName} (${address})` : address}</div>} */}
      <button
        className="w-[200px] m-2  bg-blue-500 text-white font-bold py-2 px-4 rounded transition transform hover:bg-blue-700 hover:scale-105 active:bg-blue-800 active:scale-95"
        onClick={() => disconnect()}
      >
        Disconnect Wallet
      </button>
    </div>
  );
}
