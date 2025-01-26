import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth'
import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { AppProps } from 'next/app'
import { WagmiProvider } from 'wagmi'

import { wagmiConfig } from '@/lib/web3'
import '@/styles/globals.css'
import { trpc } from '@/utils/trpc'

const queryClient = new QueryClient()

type Props = AppProps<{
  session: Session
}>

function App({ Component, pageProps }: Props) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <SessionProvider refetchInterval={0} session={pageProps.session}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitSiweNextAuthProvider>
            <RainbowKitProvider modalSize="compact">
              <Component {...pageProps} />
            </RainbowKitProvider>
          </RainbowKitSiweNextAuthProvider>
        </QueryClientProvider>
      </SessionProvider>
    </WagmiProvider>
  )
}

export default trpc.withTRPC(App)
