import Web3 from "web3";
import {
  ROUNDS_MANAGER_ABI,
  BONDING_MANAGER_ABI,
  EMPTY_ADDRESS,
  RPC_ENDPOINT,
  BONDING_MANAGER_ADDRESS,
  ROUNDS_MANAGER_ADDRESS,
} from "../../config";

const CACHE = {
  round: null,
  data: {},
};

const WEB3 = new Web3(RPC_ENDPOINT);
const BONDING_MANAGER = new WEB3.eth.Contract(
  BONDING_MANAGER_ABI,
  BONDING_MANAGER_ADDRESS
);
const ROUNDS_MANAGER = new WEB3.eth.Contract(
  ROUNDS_MANAGER_ABI,
  ROUNDS_MANAGER_ADDRESS
);

/**
 * Builds the hints table (prev and next orchestrators) by iterating through the pool.
 *
 * @returns {Promise<Object>} - A mapping of orchestrator addresses to their `prev` and
 * `next` hints.
 */
const buildHintsTable = async () => {
  let prevTranscoder = EMPTY_ADDRESS;
  let nextTranscoder = await BONDING_MANAGER.methods
    .getFirstTranscoderInPool()
    .call();
  const hints = {};

  while (nextTranscoder !== EMPTY_ADDRESS) {
    hints[nextTranscoder] = {
      prev: prevTranscoder,
      next: EMPTY_ADDRESS,
    };

    prevTranscoder = nextTranscoder;
    nextTranscoder = await BONDING_MANAGER.methods
      .getNextTranscoderInPool(nextTranscoder)
      .call();

    if (prevTranscoder !== EMPTY_ADDRESS) {
      hints[prevTranscoder].next = nextTranscoder;
    }
  }

  return hints;
};

/**
 * Fetches hints (prev and next orchestrators) for a given orchestrator.
 * Uses cached data if the round hasn't changed; otherwise, updates the cache.
 *
 * @param {string} orchestrator - Orchestrator address.
 * @returns {Promise<Object>} - Hints for the orchestrator (`prev` and `next`).
 * @throws {Error} - If orchestrator is not found.
 */
const fetchHints = async (orchestrator) => {
  const currentRound = await ROUNDS_MANAGER.methods.currentRound().call();

  // If the round hasn't changed, use cached data.
  if (CACHE.round === currentRound) {
    if (CACHE.data[orchestrator]) {
      return CACHE.data[orchestrator];
    } else {
      throw new Error("Orchestrator not found in the cached data.");
    }
  }

  // Build the hints table and update the cache.
  const hints = await buildHintsTable();
  CACHE.round = currentRound;
  CACHE.data = hints;

  if (hints[orchestrator]) {
    return hints[orchestrator];
  } else {
    throw new Error("Orchestrator not found in the fetched data.");
  }
};

/**
 * API handler to get hints for a given orchestrator.
 */
export default async function handler(req, res) {
  const { orchestrator } = req.query;

  if (!orchestrator) {
    return res.status(400).json({ error: "Orchestrator address is required." });
  }

  try {
    const hints = await fetchHints(orchestrator);
    res.status(200).json({ hints });
  } catch (error) {
    console.error("Error fetching hints:", error);
    res.status(500).json({ error: error.message || "Failed to fetch hints." });
  }
}
