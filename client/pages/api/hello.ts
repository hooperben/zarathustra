import { ethers, keccak256, verifyMessage } from "ethers";
import { AbiCoder } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  firstName: string;
  lastName: string;
  hash: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | { result: boolean; message: string }>
) {
  // this is called by tenderly when a AVSAttestation event is emitted
  if (req.method === "GET") {
    const { tokenAddress,
      amountIn,
      amountOut, 
      destinationVault, 
      destinationAddress,
      transferIndex,
      signature } = req.body;

    const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string);
    const encodedMessage = AbiCoder.defaultAbiCoder().encode(
      ["string", "uint256", "uint256", "address", "address", "uint256", "bytes"],
      [tokenAddress, amountIn, amountOut, destinationVault, destinationAddress, transferIndex, signature] 
    );

    const messageHash = keccak256(encodedMessage);

    const signedMessage = await signer.signMessage(messageHash);


    const provider = new ethers.JsonRpcProvider("https://cloudflare-eth.com");
    const wallet = signer.connect(provider);
    const contractABI = [
      "function verifyAttestation(string firstName, string lastName, bytes signedMessage) public"
    ];
    const contractAddress = "CONTRACT_ADDRESS_HERE"; // TODO: replace
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    // Call the contract function
    try {
      const tx = await contract.verifyAttestation(tokenAddress, amountIn, amountOut, destinationVault, destinationAddress, transferIndex, signature, signedMessage);
      await tx.wait();
      return res.status(200).json({ result: true, message: "Contract called successfully" });
    } catch (error) {
      console.error("Error calling contract:", error);
      return res.status(500).json({ result: false, message: "Error calling contract" });
    }

  } else {
    res.status(404).json({ result: true, message: "nothing here sorry" });
  }
}