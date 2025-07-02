"use client";
import { useState } from "react";
import Web3 from "web3";
import bondingManagerAbi from "../ABI/BondingManager.json";
import { isAddress } from "web3-validator";

const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Utility function to introduce a delay between RPC calls.
 * @param {number} ms - The delay duration in milliseconds.
 * @returns {Promise} - A promise that resolves after the specified delay.
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Home component.
 */
export default function Home() {
  const [delegator, setDelegator] = useState("");
  const [rpcEndpoint, setRpcEndpoint] = useState("");
  const [results, setResults] = useState({ transcoder: null, hints: null });
  const [rpcError, setRpcError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEthAddress = (address) => {
    return isAddress(address);
  };

  const validateRpcEndpoint = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleRpcEndpointChange = (e) => {
    const value = e.target.value;
    setRpcEndpoint(value);
    setRpcError(validateRpcEndpoint(value) ? "" : "Invalid RPC URL.");
  };

  const handleDelegatorChange = (e) => {
    const value = e.target.value;
    setDelegator(value);
    setAddressError(
      isValidEthAddress(value) ? "" : "Invalid Ethereum address."
    );
  };

  const getTranscoderAndHints = async () => {
    try {
      setRpcError("");
      setAddressError("");
      setLoading(true);

      if (!validateRpcEndpoint(rpcEndpoint)) {
        setRpcError("Invalid RPC URL. Please provide a valid endpoint.");
        setLoading(false);
        return;
      }

      if (!isValidEthAddress(delegator)) {
        setAddressError(
          "Invalid Ethereum address. Please provide a valid address."
        );
        setLoading(false);
        return;
      }

      const web3 = new Web3(rpcEndpoint);
      const bondingManagerAddress =
        "0x35Bcf3c30594191d53231E4FF333E8A770453e40";
      const bondingManager = new web3.eth.Contract(
        bondingManagerAbi,
        bondingManagerAddress
      );

      const delegatorInfo = await bondingManager.methods
        .getDelegator(delegator)
        .call();
      const transcoder = delegatorInfo.delegateAddress;

      let prevTranscoder = EMPTY_ADDRESS;
      let nextTranscoder = await bondingManager.methods
        .getFirstTranscoderInPool()
        .call();

      while (nextTranscoder !== EMPTY_ADDRESS) {
        if (nextTranscoder === transcoder) {
          // If the transcoder is the first in the active set.
          if (prevTranscoder === EMPTY_ADDRESS) {
            nextTranscoder = await bondingManager.methods
              .getNextTranscoderInPool(nextTranscoder)
              .call();
            break;
          }

          // If the transcoder is the last in the active set.
          const nextInPool = await bondingManager.methods
            .getNextTranscoderInPool(nextTranscoder)
            .call();
          if (nextInPool === EMPTY_ADDRESS) {
            nextTranscoder = EMPTY_ADDRESS;
            break;
          }

          // If the transcoder is in the middle of the active set.
          nextTranscoder = await bondingManager.methods
            .getNextTranscoderInPool(nextTranscoder)
            .call();
          break;
        }

        prevTranscoder = nextTranscoder;
        nextTranscoder = await bondingManager.methods
          .getNextTranscoderInPool(nextTranscoder)
          .call();

        await delay(200);
      }

      setResults({
        transcoder,
        hints: { prev: prevTranscoder, next: nextTranscoder },
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setResults({ transcoder: "Error", hints: null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-gray-900 text-white font-sans">
      <main className="flex flex-col gap-6 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">Get Delegate Hints</h1>
        <p>
          A simple tool to retrieve delegator list hints for <br />
          your orchestrator.This helps reduce gas fees when <br />
          interacting with smart contract methods <br />
          like <b>unbondWithHint</b>.
        </p>
        <div className="w-full sm:w-96">
          <input
            type="text"
            placeholder="Enter RPC Endpoint"
            value={rpcEndpoint}
            onChange={handleRpcEndpointChange}
            className={`border p-2 rounded w-full bg-gray-800 text-white ${
              rpcError ? "border-red-500" : "border-gray-700"
            }`}
          />
          {rpcError && <p className="text-red-500 text-sm mt-1">{rpcError}</p>}
        </div>
        <div className="w-full sm:w-96">
          <input
            type="text"
            placeholder="Enter Delegator Address"
            value={delegator}
            onChange={handleDelegatorChange}
            className={`border p-2 rounded w-full bg-gray-800 text-white mt-4 ${
              addressError ? "border-red-500" : "border-gray-700"
            }`}
          />
          {addressError && (
            <p className="text-red-500 text-sm mt-1">{addressError}</p>
          )}
        </div>
        <button
          onClick={getTranscoderAndHints}
          className={`bg-blue-500 text-white px-4 py-2 rounded mt-4 ${
            !rpcEndpoint || !isValidEthAddress(delegator)
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          disabled={!rpcEndpoint || !isValidEthAddress(delegator)}
        >
          {loading ? "Loading..." : "Get Transcoder and Hints"}
        </button>
        {loading && (
          <div className="flex items-center justify-center mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        {!loading && results.transcoder && (
          <div className="mt-6 p-4 rounded bg-gray-800 w-full sm:w-96 shadow-lg">
            <h2 className="text-lg font-semibold text-green-400">Transcoder</h2>
            <p className="text-green-300 break-words">{results.transcoder}</p>
          </div>
        )}
        {!loading && results.hints && (
          <div className="mt-4 p-4 rounded bg-gray-800 w-full sm:w-96 shadow-lg">
            <h2 className="text-lg font-semibold text-green-400">Hints</h2>
            <p className="text-green-300 break-words">
              <span className="font-medium">Previous:</span>{" "}
              {results.hints.prev}
            </p>
            <p className="text-green-300 break-words mt-2">
              <span className="font-medium">Next:</span> {results.hints.next}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
