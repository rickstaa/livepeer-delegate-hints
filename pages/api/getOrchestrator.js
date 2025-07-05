import Web3 from "web3";
import {
  BONDING_MANAGER_ABI,
  RPC_ENDPOINT,
  BONDING_MANAGER_ADDRESS,
} from "../../config";

const WEB3 = new Web3(RPC_ENDPOINT);
const BONDING_MANAGER = new WEB3.eth.Contract(
  BONDING_MANAGER_ABI,
  BONDING_MANAGER_ADDRESS
);

const CACHE = {};

/**
 * Fetches the orchestrator address for a given delegator.
 * Uses caching to improve performance.
 *
 * @param {string} delegator - The address of the delegator.
 * @returns {Promise<string>} - The address of the orchestrator.
 */
export default async function handler(req, res) {
  const { delegator } = req.query;

  if (!delegator) {
    return res.status(400).json({ error: "Delegator address is required." });
  }

  if (CACHE[delegator]) {
    return res.status(200).json({ orchestrator: CACHE[delegator] });
  }

  try {
    const { delegateAddress } = await BONDING_MANAGER.methods
      .getDelegator(delegator)
      .call();

    CACHE[delegator] = delegateAddress;

    res.status(200).json({ orchestrator: delegateAddress });
  } catch (error) {
    console.error("Error fetching orchestrator:", error);
    res.status(500).json({ error: "Failed to fetch orchestrator." });
  }
}
