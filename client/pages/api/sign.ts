import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

const CANONICAL_PRIVATE_KEY =
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string | { result: boolean; message: string }>
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ result: false, message: "Method not allowed" });
  }

  const queryString = req.query.digest as string;
  const signer = new ethers.Wallet(CANONICAL_PRIVATE_KEY);

  return await signer.signMessage(queryString);
}
