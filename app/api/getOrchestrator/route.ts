/**
 * @file Contains API route that serves the orchestrator address for a given delegator.
 */
import Web3 from "web3";
import {
  BONDING_MANAGER_ABI,
  RPC_ENDPOINT,
  BONDING_MANAGER_ADDRESS,
} from "../../../config";

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
 * Handles GET requests to fetch the orchestrator address for a given delegator.
 * Uses caching to improve performance.
 *
 * @param req - The API request object.
 * @returns The API response object.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const delegator = url.searchParams.get("delegator");

  if (!delegator) {
    return new Response(
      JSON.stringify({ error: "Delegator address is required." }),
      { status: 400 }
    );
  }

  if (CACHE[delegator]) {
    return new Response(
      JSON.stringify({ orchestrator: CACHE[delegator] }),
      { status: 200 }
    );
  }

  try {
    const result = (await BONDING_MANAGER.methods
      .getDelegator(delegator)
      .call()) as DelegatorInfo;

    CACHE[delegator] = result.delegateAddress;

    return new Response(
      JSON.stringify({ orchestrator: result.delegateAddress }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching orchestrator:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch orchestrator." }),
      { status: 500 }
    );
  }
}
