/**
 * @file Contains API route that serves the hints (prev and next orchestrators)
 * for a given orchestrator address.
 */
import Web3 from "web3";
import {
  ROUNDS_MANAGER_ABI,
  BONDING_MANAGER_ABI,
  EMPTY_ADDRESS,
  RPC_ENDPOINT,
  BONDING_MANAGER_ADDRESS,
  ROUNDS_MANAGER_ADDRESS,
} from "../../../config";

/** Hints response */
export interface Hints {
  prev: string;
  next: string;
}

const CACHE: {
  round: number | null;
  data: Record<string, Hints>;
} = {
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
 * @returns A mapping of orchestrator addresses to their `prev` and
 * `next` hints.
 */
const buildHintsTable = async (): Promise<Record<string, Hints>> => {
  let prevTranscoder = EMPTY_ADDRESS;
  let nextTranscoder = (await BONDING_MANAGER.methods
    .getFirstTranscoderInPool()
    .call()) as string;
  const hints: Record<string, Hints> = {};

  while (nextTranscoder !== EMPTY_ADDRESS) {
    hints[nextTranscoder] = {
      prev: prevTranscoder,
      next: EMPTY_ADDRESS,
    };

    prevTranscoder = nextTranscoder;
    nextTranscoder = (await BONDING_MANAGER.methods
      .getNextTranscoderInPool(nextTranscoder)
      .call()) as string;

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
 * @param  orchestrator - Orchestrator address.
 * @returns Hints for the orchestrator (`prev` and `next`).
 */
const fetchHints = async (orchestrator: string): Promise<Hints> => {
  const currentRound = parseInt(
    (await ROUNDS_MANAGER.methods.currentRound().call()) as string,
    10
  );

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
 * Handles GET requests to fetch hints for a given orchestrator.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const orchestrator = url.searchParams.get("orchestrator");

  if (!orchestrator) {
    return new Response(
      JSON.stringify({ error: "Orchestrator address is required." }),
      { status: 400 }
    );
  }

  try {
    const hints = await fetchHints(orchestrator);
    return new Response(JSON.stringify({ hints }), { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching hints:", error.message);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    } else {
      console.error("Unknown error:", error);
      return new Response(
        JSON.stringify({ error: "An unknown error occurred." }),
        { status: 500 }
      );
    }
  }
}
