import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth'
import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { AppType } from 'next/app'
import { WagmiProvider } from 'wagmi'
import { Toaster } from 'sonner'
import { wagmiConfig } from '@/lib/web3'
import '@/styles/globals.css'
import { api } from '@/utils/trpc'

const queryClient = new QueryClient()

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <SessionProvider refetchInterval={0} session={session}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitSiweNextAuthProvider>
            <RainbowKitProvider modalSize="compact">
              <Component {...pageProps} />
              <Toaster 
                position="top-center"
                expand={true}
                richColors
                closeButton
                toastOptions={{
                  duration: 5000,
                  style: { zIndex: 9999 }
                }}
              />
            </RainbowKitProvider>
          </RainbowKitSiweNextAuthProvider>
        </QueryClientProvider>
      </SessionProvider>
    </WagmiProvider>
  )
}

export default api.withTRPC(MyApp)
