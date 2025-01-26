import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { publicActions } from 'viem'
import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'

const WALLETCONNECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_ID

if (!WALLETCONNECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_WALLETCONNECT_ID')
}

const { connectors } = getDefaultWallets({
  appName: 'Safenotes',
  projectId: WALLETCONNECT_ID,
})

const chains = [mainnet] as const

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_RPC_ENDPOINT),
  },
})

export const publicClient = wagmiConfig.getClient().extend(publicActions)
