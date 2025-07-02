# Delegate Hints


A simple tool to retrieve orchestrator list hints based on either the orchestrator address or the delegator address. This helps reduce gas fees when interacting with Livepeer's [BondingManager](https://arbiscan.io/address/0x35Bcf3c30594191d53231E4FF333E8A770453e40) smart contract.

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
