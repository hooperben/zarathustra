"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Inter } from "next/font/google";
import { Dropdown } from "@/ui/Dropdown";
import { Tokendropdown } from "@/ui/Tokendropdown";
import TextBox from "@/ui/textbox";
import { SubmitButton } from "@/ui/SubmitButton";
import { AlertDestructive } from "@/ui/alert";
import { Contract, ethers, parseEther } from "ethers";
import { WalletOptions } from "@/components/ui/wallet-options";
import { useAccount, useWriteContract } from "wagmi";
import { Account } from "@/components/ui/account";
import {
  HOLESKY_ERC20_CONTRACT,
  HOLESKY_VAULT_CONTRACT,
  VAULT_OP_SEPOLIA_CONTRACT,
  SEPOLIA_OP_ERC20_CONTRACT,
} from "@/constants/contracts";
import { erc20Abi } from "viem";
import { vaultAbi } from "@/constants/vaultAbi";

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
  const [textBoxValue, setTextBoxValue] = useState<number>(0); // State initialization inside the component
  const [selectedToken, setSelectedToken] = useState({ src: "", alt: "Token" });
  // const [walletConnected, setWalletConnected] = useState(false);
  const [walletError, setWalletError] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const { address } = useAccount();

  const handleTextBoxChange = (newValue: number) => {
    setTextBoxValue(newValue); // Update the state with the new value
  };

  const handleTokenSelect = (src: string, alt: string) => {
    setSelectedToken({ src, alt });
  };

  const handleConnectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        console.log(accounts[0]);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setWalletError(true);
      return;
    }
  };

  const approveERC20Transfer = async () => {
    const erc20Abi = [
      "function approve(address spender, uint256 amount) external returns (bool)",
    ];
    const erc20Interface = new ethers.Interface(erc20Abi);

    const calldata = erc20Interface.encodeFunctionData("approve", [
      "0xed4712592F95974fb0346730429C512f20c01348",
      textBoxValue,
    ]);

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
    console.log("Transaction Hash:", thHash);
  };

  const [userTxIndex, setUserTxIndex] = useState(0);

  const getDigest = async () => {
    const contractAddress = "0xed4712592F95974fb0346730429C512f20c01348";

    const providerUrl =
      "https://optimism-sepolia.infura.io/v3/2bc37d20ac5048fa848978190f5f24bc";

    const provider = new ethers.JsonRpcProvider(providerUrl);
    const contract = new ethers.Contract(contractAddress, vaultAbi, provider);

    const optimismVault = new Contract(
      VAULT_OP_SEPOLIA_CONTRACT,
      vaultAbi,
      provider
    );

    const data = [
      address,
      HOLESKY_ERC20_CONTRACT,
      BigInt(textBoxValue),
      BigInt(textBoxValue),
      VAULT_OP_SEPOLIA_CONTRACT,
      address,
      address, // Assume it's the same as the source wallet
      BigInt(0), // We will need to get this from the contract too (source chain contract call)
    ];

    console.log("got this far");

    console.log(data);

    try {
      const digest = await optimismVault.getDigest({
        user: address,
        tokenAddress: HOLESKY_ERC20_CONTRACT,
        amountIn: BigInt(textBoxValue),
        amountOut: BigInt(textBoxValue),
        destinationVault: VAULT_OP_SEPOLIA_CONTRACT,
        destinationAddress: address,
        transferIndex: 27,
        canonicalAttestation: "0x",
      });

      console.log({
        user: address,
        tokenAddress: HOLESKY_ERC20_CONTRACT,
        amountIn: BigInt(textBoxValue),
        amountOut: BigInt(textBoxValue),
        destinationVault: VAULT_OP_SEPOLIA_CONTRACT,
        destinationAddress: address,
        transferIndex: 27,
        canonicalAttestation: "0x",
      });

      console.log("Digest:", digest);
      return digest;
    } catch (error) {
      console.error("Error calling getDigest:", error);
    }
  };

  const [loading, setLoading] = useState(false);

  const {
    data: approvalHash,
    isPending: awaitingApproval,
    status: approvalStatus,
    writeContract,
  } = useWriteContract();

  const {
    data: bridgeHash,
    isPending: awaitingBridge,
    status: bridgeStatus,
    writeContractAsync: writeBridgeContractAsync,
  } = useWriteContract();

  const [approvalError, setApprovalError] = useState<string>();

  const [approvalComplete, setApprovalComplete] = useState(false);

  const handleApproval = async () => {
    setApprovalError(undefined);
    setLoading(true);

    try {
      writeContract(
        {
          address: HOLESKY_ERC20_CONTRACT,
          abi: erc20Abi,
          functionName: "approve",
          args: [HOLESKY_VAULT_CONTRACT, parseEther(textBoxValue.toString())],
        },
        {
          onSuccess: () => {
            setLoading(false);
            setApprovalComplete(true);
          },
          onSettled: () => {
            console.log("ran settled");
          },
          onError: () => setApprovalError("Something went wrong :("),
        }
      );
    } catch (err: any) {
      console.log(err);
      setApprovalError("Something went wrong :(");
    }
  };

  const handleSendTokens = async () => {
    const digest = await getDigest();
    if (typeof digest !== "string") {
      setApprovalError("Something went wrong :(");
      return;
    }

    // TODO this is a big no no
    const signer = new ethers.Wallet(
      "0x861210e14ede5ffc63a502be024c8b4ee34c23744a411b38858f12c78723a1a2"
    );
    const signature = await signer.signMessage(digest);

    console.log("Signature:", signature);

    // Call the input chain with the signature + call-data
    try {
      await writeBridgeContractAsync(
        {
          address: HOLESKY_VAULT_CONTRACT,
          abi: vaultAbi,
          functionName: "bridge",
          args: [
            HOLESKY_ERC20_CONTRACT,
            BigInt(textBoxValue),
            BigInt(textBoxValue),
            VAULT_OP_SEPOLIA_CONTRACT,
            address,
            signature,
          ],
        },
        {
          onSettled: () => setLoading(false),
          onError: () => {
            setLoading(false);
            setApprovalError("Something went wrong :(");
          },
        }
      );
    } catch (err: any) {
      console.log(err);
      setLoading(false);
    }
  };

  function ConnectWallet() {
    const { isConnected } = useAccount();
    return (
      <div className="my-3">
        {isConnected ? <Account /> : <WalletOptions />}
      </div>
    );
  }

  return (
    <main
      className={`flex min-h-screen flex-col items-center ${inter.className} font-mono`}
      style={{
        background:
          "linear-gradient(to right, rgb(49, 229, 232), rgb(46, 209, 132))",
      }}
    >
      <div
        className="flex flex-col items-center min-w-96 min-h-80 m-52 rounded-3xl shadow-xl font-mono pt-[60px]"
        style={{
          backgroundColor: "rgba(200, 200, 200, 0.35)",
          border: "0.5px solid white",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        {walletAddress && (
          <div className="text-sm flex justify-end w-[100%] text-white absolute top-0 right-0 p-2">
            Wallet Address: {walletAddress}
          </div>
        )}

        <div className="flex flex-col justify-center">
          <Image
            src="/zarathustra.webp"
            alt="zarathustra"
            width={100}
            height={100}
            className="rounded-lg"
          />
          <h1>Zarathustra</h1>
        </div>

        {address && (
          <>
            <div className="flex flex-row my-5 px-5 py-1 items-center space-x-3 bg-white rounded-xl shadow-lg">
              <div className="flex">
                <Dropdown defaultEth={true} />
              </div>
              <div className="flex">
                <TextBox value={textBoxValue} onChange={handleTextBoxChange} />
              </div>
              <div>
                <Tokendropdown
                  selectedToken={selectedToken}
                  onSelect={handleTokenSelect}
                />
              </div>
            </div>

            <div className="flex flex-row px-5 py-1 items-center space-x-3 bg-white rounded-xl shadow-lg">
              <div className="flex">
                <Dropdown defaultEth={false} />
              </div>
              <div className="flex">
                <TextBox value={textBoxValue} onChange={handleTextBoxChange} />
              </div>
              <div>
                <Tokendropdown
                  selectedToken={selectedToken}
                  onSelect={handleTokenSelect}
                />
              </div>
            </div>
          </>
        )}

        {!address && (
          <div className="mt-10">
            <h1>Connect your wallet to get started</h1>
          </div>
        )}

        {(loading || awaitingBridge || approvalStatus === "pending") && (
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
          >
            <circle
              cx="50"
              cy="50"
              r="35"
              stroke="#000"
              stroke-width="10"
              stroke-linecap="round"
              stroke-dasharray="164.93361431346415 56.97787143782138"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                repeatCount="indefinite"
                dur="1s"
                keyTimes="0;1"
                values="0 50 50;360 50 50"
              ></animateTransform>
            </circle>
          </svg>
        )}

        {awaitingApproval && <h3 className="mt-4">Awaiting approval...</h3>}

        {approvalError && <h4 className="mt-4">{approvalError}</h4>}

        {textBoxValue > 0 &&
          !loading &&
          (approvalComplete ? (
            <div className="text-center">
              <p className="mt-4">
                Approval complete! Now send your tokens to the vault.
              </p>
              <SubmitButton text="Send my tokens!" onClick={handleSendTokens} />
            </div>
          ) : (
            <div className="text-center">
              <p className="mt-4">
                You&apos;ll need to approve your tokens to be moved by the
                bridging contract{" "}
              </p>
              <SubmitButton text="Approve my tokens" onClick={handleApproval} />
            </div>
          ))}

        <ConnectWallet />
      </div>

      {walletError && <AlertDestructive />}
    </main>
  );
}
