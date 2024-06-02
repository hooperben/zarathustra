import Image from "next/image";
import React, { useState } from 'react';
import { Inter } from "next/font/google";
import { Dropdown } from "@/ui/Dropdown";
import { Tokendropdown } from "@/ui/Tokendropdown";
import TextBox from "@/ui/textbox";
import { SubmitButton } from "@/ui/SubmitButton";
import SettingsButton from "@/ui/SettingsButton";
import { CogDrawer } from "@/ui/CogDrawer";
import { AlertDestructive } from "@/ui/alert";
import {ConnectButton} from "@/ui/ConnectButton";
import { ethers } from "ethers";

const inter = Inter({ subsets: ["latin"] });

interface BridgeRequestData {
    user: string;
    tokenAddress: string;
    amountIn: ethers.BigNumberish;
    amountOut: ethers.BigNumberish;
    destinationVault: string;
    destinationAddress: string;
    transferIndex: ethers.BigNumberish;
}

declare global {
  interface Window {
    ethereum?: any; // Define ethereum property on the Window interface
  }
}

export default function Home() {

  const [textBoxValue, setTextBoxValue] = useState<number>(NaN); // State initialization inside the component
  const [selectedToken, setSelectedToken] = useState({ src: '', alt: "Token" });
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletError, setWalletError] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const handleTextBoxChange = (newValue: number) => {
    setTextBoxValue(newValue); // Update the state with the new value
  };

  const handleTokenSelect = (src: string, alt: string) => {
    setSelectedToken({ src, alt });
  };

  const handleConnectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        console.log(accounts[0]);
      }
    } catch (error) {
        console.error("Error connecting wallet:", error);
        setWalletError(true);
        return;
    }
      setWalletConnected(true);
  };

  const approveERC20Transfer = async () => {
      const erc20Abi = ['function approve(address spender, uint256 amount) external returns (bool)'];
      const erc20Interface = new ethers.Interface(erc20Abi);

      const calldata = erc20Interface.encodeFunctionData('approve', ["0xed4712592F95974fb0346730429C512f20c01348", textBoxValue]);
      console.log('Calldata:', calldata);

      const thHash = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [
              {
                  from: walletAddress,
                  to: "0x5a16A4F940Bb055357f6b378d7E01341a044450C",
                  value: ethers.toBeHex(0),
                  data: calldata,
              },
          ],
      });
      console.log('Transaction Hash:', thHash);
  }

  const getDigest = async () => {
    const abi = [
        "function getDigest((address,address,uint256,uint256,address,address,uint256)) view returns (bytes32)"
    ];
    const contractAddress = "0xed4712592F95974fb0346730429C512f20c01348";

    const providerUrl = "https://purple-divine-morning.ethereum-holesky.quiknode.pro/145f60a65b09b33285c3bfc8efda5335394ea282";

    const provider = new ethers.JsonRpcProvider(providerUrl);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    const data = [
        ethers.getAddress("0x485B7B8ECA681221d68250a7Ed88b1d4c9152149"),
        ethers.getAddress("0xE2101b383FDdca24813DB1Bf0E68129bE402e8e0"),
        1000000000000000000n,
        1000000000000000000n,
        ethers.getAddress("0xd7085121bcba7559ce6216E88A785209F4d66971"),
        ethers.getAddress("0x485B7B8ECA681221d68250a7Ed88b1d4c9152149"),  // Assume it's the same as the source wallet
        0n  // We will need to get this from the contract too (source chain contract call)
      ];

    try {
        const digest = await contract.getFunction("getDigest")(data);
        console.log("Digest:", digest);
        return digest;
    } catch (error) {
        console.error("Error calling getDigest:", error);
    }
  }

  const handleSubmit = async () => {
      await approveERC20Transfer();

      const digest = await getDigest();
      if (typeof digest !== "string") {
          throw new Error("Error getting digest");
      }

      const signer = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");
      const signature = await signer.signMessage(digest);
      console.log("Signature:", signature);

      // Call the input chain with the signature + call-data
      try {
          const s = await window.ethereum.request({
              method: "eth_sendTransaction",
              params: [
                  {
                      from: walletAddress,
                      to: "0xed4712592F95974fb0346730429C512f20c01348",
                      value: ethers.parseEther("1"),
                  },
              ]
          });
          console.log(s);
      } catch (error) {
          console.error("Error sending transaction:", error);
      }
  };

  return (
    <main className={`flex min-h-screen flex-col items-center ${inter.className}`} style={{ background: 'linear-gradient(to right, rgb(49, 229, 232), rgb(46, 209, 132))' }}>

      <div className="flex flex-col items-center min-w-96 min-h-80 m-52 rounded-3xl shadow-xl" style={{ backgroundColor: 'rgba(200, 200, 200, 0.35)', border: '0.5px solid white', paddingLeft: '20px', paddingRight: '20px'}}>

      <div style={{ borderRadius: "10px", padding: "7px", color: 'rgba(25, 30, 35, 1)', backgroundColor: 'rgba(255, 255, 255, 1)', width: '500px', transition: 'background-color 0.3s ease', position: 'absolute', top: '4px', left: '4px' }} className="text-white text-sm">
        Wallet Address: {walletAddress}
      </div>


        <div className="flex flex-row my-5 px-5 py-1 items-center space-x-3 bg-white rounded-xl shadow-lg">
          <div className="flex">
            <Dropdown/>
          </div>
          <div className="flex" >
            
            <TextBox value={textBoxValue} onChange={handleTextBoxChange} />
          </div>
          <div>
            <Tokendropdown selectedToken={selectedToken} onSelect={handleTokenSelect}/>
          </div>
        </div>

        <div className="flex flex-row px-5 py-1 items-center space-x-3 bg-white rounded-xl shadow-lg">
          <div className="flex" >
            <Dropdown/>
          </div>
          <div className="flex">
            <TextBox value={textBoxValue} onChange={handleTextBoxChange} />
          </div>
          <div>
          <Tokendropdown selectedToken={selectedToken} onSelect={handleTokenSelect}/>
          </div>
        </div>

        <div className="flex my-12">
          <>
            {walletConnected ? (
              <SubmitButton onClick={handleSubmit} />
            ) : (
              <ConnectButton onClick={handleConnectWallet} />
            )}
          </>

        </div>
      </div>

      {walletError && <AlertDestructive/>}

    </main>
  );
}
