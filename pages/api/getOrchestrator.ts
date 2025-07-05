import Web3 from "web3";
import {
  BONDING_MANAGER_ABI,
  RPC_ENDPOINT,
  BONDING_MANAGER_ADDRESS,
} from "../../config";
import type { NextApiRequest, NextApiResponse } from "next";

const WEB3 = new Web3(RPC_ENDPOINT);
const BONDING_MANAGER = new WEB3.eth.Contract(
  BONDING_MANAGER_ABI as any,
  BONDING_MANAGER_ADDRESS
);

type DelegatorInfo = {
  delegateAddress: string;
};

const CACHE: Record<string, DelegatorInfo["delegateAddress"]> = {};

/**
 * API handler to fetch the orchestrator address for a given delegator.
 * Uses caching to improve performance.
 *
 * @param req - The API request object.
 * @param res - The API response object.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { delegator } = req.query;

  if (!delegator || typeof delegator !== "string") {
    return res.status(400).json({ error: "Delegator address is required." });
  }

  if (CACHE[delegator]) {
    return res.status(200).json({ orchestrator: CACHE[delegator] });
  }

  try {
    const result = (await BONDING_MANAGER.methods
      .getDelegator(delegator)
      .call()) as DelegatorInfo;

    CACHE[delegator] = result.delegateAddress;

    res.status(200).json({ orchestrator: result.delegateAddress });
  } catch (error) {
    console.error("Error fetching orchestrator:", error);
    res.status(500).json({ error: "Failed to fetch orchestrator." });
  }
}
