import PROPERTY_TOKEN_ABI from "@/abi/PropertyToken.json";
import PROPERTY_SWAP_ABI from "@/abi/PropertySwap.json";

export { PROPERTY_TOKEN_ABI, PROPERTY_SWAP_ABI };

// ─── Contract Addresses (Sepolia) ───────────────────────────────────────────

export const PROPERTY_SWAP_ADDRESS =
  "0x71bA7E4095f3e1E647c2C389f2aaD4e1F3746357" as const;

export const PROPERTY_TOKEN_ADDRESSES = {
  alpha: "0xD9AF49Fa0494a43Fd7FF9d7f37f02edFbf634Ae7",
  beta:  "0x5D2feF52a1fCabe0F23ce2CE0512028Ab566Cd91",
} as const;

// ─── Price Config ────────────────────────────────────────────────────────────

/** ETH/USD rate used to convert on-chain wei prices to USD. Update as needed. */
export const ETH_USD_PRICE = 2500;

