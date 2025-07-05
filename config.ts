/**
 * @file Contains app wide configuration constants.
 */
import { AbiItem } from "web3-utils";
import BONDING_MANAGER_ABI_JSON from "./ABI/BondingManager.json";
import ROUNDS_MANAGER_ABI_JSON from "./ABI/RoundsManager.json";

export const BONDING_MANAGER_ABI: AbiItem[] =
  BONDING_MANAGER_ABI_JSON as AbiItem[];
export const ROUNDS_MANAGER_ABI: AbiItem[] =
  ROUNDS_MANAGER_ABI_JSON as AbiItem[];

export const EMPTY_ADDRESS: string =
  "0x0000000000000000000000000000000000000000";
export const RPC_ENDPOINT: string =
  process.env.RPC_URL || "https://arb1.arbitrum.io/rpc";
export const BONDING_MANAGER_ADDRESS: string =
  "0x35Bcf3c30594191d53231E4FF333E8A770453e40";
export const ROUNDS_MANAGER_ADDRESS: string =
  "0xdd6f56DcC28D3F5f27084381fE8Df634985cc39f";
