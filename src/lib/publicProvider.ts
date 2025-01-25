"use client";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.NEXT_PUBLIC_RPC_ENDPOINT),
  batch: {
    multicall: true,
  },
});

export default publicClient;
