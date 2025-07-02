# Delegate Hints

An app to retrieve delegator hints for orchestrators, helping reduce gas fees when interacting with Livepeer smart contract methods like `bondWithHint`, `unbondWithHint`, and `rebondWithHint`.

## What Are Hints?

Hints are positional references used in the `SortedDoublyLL` data structure within the Livepeer protocol. They help smart contracts efficiently find the correct position in the list of orchestrators, reducing computational costs and gas fees.

## Why Use Hints?

Providing accurate hints avoids expensive linear searches in the contract, significantly reducing gas costs for operations like bonding, unbonding, and rebonding.

## How to Run

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.
4. Enter the delegator's address to retrieve the orchestrator and corresponding hints.
