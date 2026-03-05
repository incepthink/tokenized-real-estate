# Deployment Guide — Sepolia Testnet

## Contracts

- PropertyToken.sol — ERC-20 for each property (deployed via factory)
- PropertyFactory.sol — deploys PropertyToken instances
- PropertySwap.sol — handles buy/sell with SepoliaETH

---

## Step 1 — Setup in Remix

1. Go to https://remix.ethereum.org
2. Create these files in Remix:
   - `PropertyToken.sol`
   - `PropertyFactory.sol`
   - `PropertySwap.sol`
3. In compiler settings, use **Solidity 0.8.20**
4. Enable optimization (200 runs)
5. Connect MetaMask to **Sepolia testnet**

---

## Step 2 — Deploy PropertyFactory

1. Compile `PropertyFactory.sol`
2. Deploy → you are automatically the owner
3. Save the deployed address: `FACTORY_ADDRESS`

---

## Step 3 — Create Two Property Tokens

Call `createProperty()` twice on the factory:

**Property 1:**

```
_name:             "Maple Street Apartments" Property Alpha
_symbol:           "MAPLE"
_propertyName:     "Maple Street Apartments"
_propertyLocation: "123 Maple St, New York"
_totalSupply:      1000000
```

**Property 2:**

```
_name:             "Ocean View Villa" Property Beta
_symbol:           "OCEAN"
_propertyName:     "Ocean View Villa"
_propertyLocation: "456 Ocean Blvd, Miami"
_totalSupply:      1000000
```

After each call, check `getProperties()` to get both token addresses.
Save them: `MAPLE_TOKEN_ADDRESS` and `OCEAN_TOKEN_ADDRESS`

---

## Step 4 — Deploy PropertySwap

1. Compile and deploy `PropertySwap.sol`
2. Save the deployed address: `SWAP_ADDRESS`

---

## Step 5 — Register Tokens in Swap

Call `registerToken()` twice on PropertySwap:

**Token 1:**

```
_token:       MAPLE_TOKEN_ADDRESS
_priceInWei:  100000000000000   (= 0.0001 ETH per token)
```

**Token 2:**

```
_token:       OCEAN_TOKEN_ADDRESS
_priceInWei:  100000000000000   (= 0.0001 ETH per token)
```

---

## Step 6 — Seed the Swap Contract with Tokens

In MetaMask / Remix, interact with each PropertyToken contract:

Call `transfer()` on MAPLE token:

```
to:     SWAP_ADDRESS
amount: 500000000000000000000000  (500,000 tokens in wei = 500000 * 1e18)
```

Call `transfer()` on OCEAN token:

```
to:     SWAP_ADDRESS
amount: 500000000000000000000000  (500,000 tokens in wei)
```

This gives the swap contract 500k tokens per property to sell.
You keep 500k in your wallet.

---

## Step 7 — Seed the Swap Contract with ETH

Call `depositETH()` on PropertySwap, sending some SepoliaETH as value.
Recommended: **1–2 SepoliaETH** so users can sell tokens back.

---

## Step 8 — Verify Everything

Check on the swap contract:

- `getETHBalance()` — should show your deposited ETH
- `getTokenBalance(MAPLE_TOKEN_ADDRESS)` — should show 500000 \* 1e18
- `getTokenBalance(OCEAN_TOKEN_ADDRESS)` — should show 500000 \* 1e18

---

## How Your Frontend Calls the Contracts

### Buy Flow

```js
// 1. Calculate cost
const tokenAmount = 10; // whole tokens
const pricePerToken = 0.0001; // ETH
const totalCost = ethers.parseEther((tokenAmount * pricePerToken).toString());

// 2. Call buy()
await swapContract.buy(tokenAddress, tokenAmount, { value: totalCost });
```

### Sell Flow

```js
// 1. Approve swap contract to spend tokens
const tokenAmountWei = ethers.parseUnits(tokenAmount.toString(), 18);
await tokenContract.approve(swapContractAddress, tokenAmountWei);

// 2. Call sell()
await swapContract.sell(tokenAddress, tokenAmount);
```

### Read prices

```js
const costInWei = await swapContract.getBuyPrice(tokenAddress, tokenAmount);
const returnInWei = await swapContract.getSellReturn(tokenAddress, tokenAmount);
```

---

## Contract ABIs needed on frontend

You'll need the ABI for:

- `PropertySwap` — for buy/sell/price reads
- `PropertyToken` (ERC-20) — for approve + balanceOf

Both are available after compilation in Remix under the ABI tab.
