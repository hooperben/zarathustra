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

const inter = Inter({ subsets: ["latin"] });

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
    // Get the balance in the input field
    // Get the token address for the input token the user has selected
    // Get the RCP endpoint from metamask
  }

  const handleSubmit = async () => {
    // Approve ERC20 Transfer on the input chain
    // Get the signature from the backend
    // Call the input chain with the signature + call-data

    const message = "Message to sign";

    try {
      const address = walletAddress;
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      });
  
      console.log("Signature:", signature);
    } catch (error) {
      console.error("Error signing message:", error);
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
              <SubmitButton onClick={handleSignMessage} />
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
