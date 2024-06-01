import React, { useState } from 'react';
import { ethers } from 'ethers';

const WalletConnectButton = ({ onConnect }) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        setAccount(account);
        setWalletConnected(true);
        onConnect(account);
      } else {
        console.log('No Ethereum provider found');
      }
    } catch (error) {
      console.error('Failed to connect wallet', error);
    }
  };

  return (
    <div>
      <button
        onClick={handleConnectWallet}
        disabled={walletConnected}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {walletConnected ? 'Wallet Connected' : 'Connect Wallet'}
      </button>
      {walletConnected && account && (
        <div className="mt-4 text-white">
          Connected to {account}
        </div>
      )}
    </div>
  );
};

export default WalletConnectButton;
