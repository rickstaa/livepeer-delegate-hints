/**
 * @file Contains main app page.
 */
"use client";
import { useState } from "react";
import { isAddress } from "web3-validator";
import type { Hints } from "./api/getHints";

/**
 * Home component.
 */
export default function Home() {
  const [delegator, setDelegator] = useState("");
  const [orchestrator, setOrchestrator] = useState("");
  const [results, setResults] = useState<{ hints: Hints | null }>({ hints: null });
  const [addressError, setAddressError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Validates if the provided address is a valid Ethereum address.
   * @param address - The Ethereum address to validate.
   * @returns Returns true if the address is valid, otherwise false.
   */
  const isValidEthAddress = (address: string): boolean => {
    return isAddress(address);
  };

  /**
   * Handles the change event for the delegator input field.
   * @param e - The event object.
   */
  const handleDelegatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDelegator(value);
    setAddressError(
      isValidEthAddress(value) ? "" : "Invalid Ethereum address."
    );
  };

  /**
   * Handles the change event for the orchestrator input field.
   * @param e - The event object.
   */
  const handleOrchestratorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOrchestrator(value);
    setAddressError(
      isValidEthAddress(value) ? "" : "Invalid Ethereum address."
    );
  };

  /**
   * Fetches the orchestrator address based on the provided delegator address.
   * @param delegator - The delegator address.
   * @returns The orchestrator address.
   */
  const fetchOrchestrator = async (delegator: string): Promise<string> => {
    const response = await fetch(`/api/getOrchestrator?delegator=${delegator}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch orchestrator.");
    }
    return data.orchestrator;
  };

  /**
   * Fetches the hints for a given orchestrator.
   * @param orchestrator - The orchestrator address.
   * @returns The hints object containing previous and next hints.
   */
  const fetchHints = async (orchestrator: string): Promise<Hints> => {
    const response = await fetch(`/api/getHints?orchestrator=${orchestrator}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch hints.");
    }
    return data.hints;
  };

  /**
   * Fetches hints based on the provided delegator or orchestrator address.
   * If the orchestrator address is not provided, it fetches it using the delegator
   * address.
   * @returns A promise that resolves when the hints are fetched.
   */
  const getHints = async () => {
    try {
      setAddressError("");
      setLoading(true);

      if (!isValidEthAddress(delegator) && !isValidEthAddress(orchestrator)) {
        setAddressError(
          "Invalid Ethereum address. Please provide a valid delegator or " +
          "orchestrator address."
        );
        setLoading(false);
        return;
      }

      let orch = orchestrator;

      // If no orchestrator is provided, fetch it using the delegator address.
      if (!orch && delegator) {
        orch = await fetchOrchestrator(delegator);
        setOrchestrator(orch);
      }

      if (!orch) {
        throw new Error("Orchestrator address is required.");
      }

      const hints = await fetchHints(orch);
      setResults({ hints });
    } catch (error) {
      console.error("Error fetching hints:", error);
      setResults({ hints: null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-6 pb-16 gap-12 sm:p-16 bg-gray-900 text-white font-sans">
      <main className="flex flex-col gap-6 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">Get Delegate Hints</h1>
        <p>
          A simple tool to retrieve orchestrator list hints <br />
          This helps reduce gas fees when interacting with <br />
          methods on the{" "}
          <a
            href="https://arbiscan.io/address/0x35Bcf3c30594191d53231E4FF333E8A770453e40"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            BondingManager
          </a>{" "}
          contract.
        </p>
        <div className="w-full sm:w-96">
          <input
            type="text"
            placeholder="Enter Delegator Address"
            value={delegator}
            onChange={handleDelegatorChange}
            className={`border p-2 rounded w-full bg-gray-800 text-white mt-4 ${addressError ? "border-red-500" : "border-gray-700"
              }`}
          />
        </div>
        <div className="w-full sm:w-96">
          <p className="text-sm text-gray-400 mt-2">
            If you already know the orchestrator address, you can enter it below.
          </p>
          <input
            type="text"
            placeholder="Enter Orchestrator Address (optional)"
            value={orchestrator}
            onChange={handleOrchestratorChange}
            className={`border p-2 rounded w-full bg-gray-800 text-white mt-4 ${addressError ? "border-red-500" : "border-gray-700"
              }`}
          />
          {addressError && (
            <p className="text-red-500 text-sm mt-1">{addressError}</p>
          )}
        </div>
        <button
          onClick={getHints}
          className={`bg-blue-500 text-white px-4 py-2 rounded mt-4 ${!isValidEthAddress(delegator) && !isValidEthAddress(orchestrator)
            ? "opacity-50 cursor-not-allowed"
            : ""
            }`}
          disabled={
            !isValidEthAddress(delegator) && !isValidEthAddress(orchestrator)
          }
        >
          {loading ? "Loading..." : "Get Hints"}
        </button>
        {loading && (
          <div className="flex items-center justify-center mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        {!loading && results.hints && (
          <div className="mt-4 p-4 rounded bg-gray-800 w-full sm:w-96 shadow-lg">
            <h2 className="text-lg font-semibold text-green-400">Hints</h2>
            <p className="text-green-300 break-words">
              <span className="font-medium underline">Previous:</span>{" "}
              {results.hints.prev || "N/A"}
            </p>
            <p className="text-green-300 break-words mt-2">
              <span className="font-medium underline">Next:</span>{" "}
              {results.hints.next || "N/A"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
