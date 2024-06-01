import { ethers, keccak256, verifyMessage } from "ethers";
import { Signature } from "ethers";
import { AbiCoder } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  firstName: string;
  lastName: string;
  hash: string;
};

// this is whats in AVS config file
const AVS_PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

// this is what is in vercels backend
const CANNONICAL_PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

type ChainData = {
  api: string;
  contractAddress: string;
};

const chainLookUp: Record<string, ChainData> = { // TODO: replace contract address with actual contract address
  "0x111": { api: "https://cloudflare-eth.com", contractAddress: "0x123" },
  "0x22": { api: "https://cloudflare-eth.com", contractAddress: "0x321" }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | { result: boolean; message: string }>
) {
  // this is called by tenderly when a AVSAttestation event is emitted
  if (req.method === "GET") {
    const { 
      user, tokenAddress, amountIn, amountOut, destinationVault, destinationAddress, transferIndex, signedAVSMessage  
    } = req.body;

    const avsSigner = new ethers.Wallet(CANNONICAL_PRIVATE_KEY as string);
    const avsAttestationSignedMessage = await avsSigner.signMessage(keccak256("0x221426124"));

    const cannonicalSigner = new ethers.Wallet(CANNONICAL_PRIVATE_KEY);



    const encodedMessage = AbiCoder.defaultAbiCoder().encode(
      ["address", "address", "uint256", "uint256", "address", "address", "uint256"],
      [user, tokenAddress, amountIn, amountOut, destinationVault, destinationAddress, transferIndex] 
    );

    const messageHash = keccak256(encodedMessage);
    const cannonicalAttestationSignedMessage = await cannonicalSigner.signMessage(keccak256(messageHash));

    // we wont have to do any AVS signature checks here
    const signedAVSMessageReplica = await avsSigner.signMessage(messageHash);
    const {r,s,v} = Signature.from(signedAVSMessage);

    const api: string = chainLookUp[tokenAddress].api;
    const provider = new ethers.JsonRpcProvider(api); // filter rpc based on the destination address
    const wallet = cannonicalSigner.connect(provider);

    const contractABI = [
      "function verifyAttestation (tokenAddress, amountIn, amountOut, destinationVault, destinationAddress, transferIndex, signedAVSMessage, cannonicalAttestationSignedMessage) public"
    ];
    
    const contractAddress = chainLookUp[tokenAddress].contractAddress; 
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    // contract.releaseFunds();

    // Call the contract function
    try {
      const tx = await contract.verifyAttestation(tokenAddress, amountIn, amountOut, destinationVault, destinationAddress, transferIndex, signedAVSMessage, cannonicalAttestationSignedMessage);
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