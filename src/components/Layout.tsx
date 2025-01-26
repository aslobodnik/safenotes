import { useAccountModal, useConnectModal } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { useAccount, useEnsAvatar, useEnsName } from 'wagmi'

import { useIsMounted } from '@/hooks/useIsMounted'
import { truncateAddress } from '@/lib/utils'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col">
      {/* Header/Navigation Bar */}
      <nav className="flex items-center justify-between p-4">
        {/* Left side - Brand */}
        <Link
          href="/"
          className="text-brand text-2xl font-bold transition-opacity hover:opacity-80"
        >
          ENS | <span className="text-neutral-500">SafeNotes</span>
        </Link>

        {/* Right side - Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-brand hover:bg-brand/10 rounded-md px-4 py-2"
          >
            Admin
          </Link>
          <ConnectButton />
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-8">{children}</main>
    </div>
  )
}

function ConnectButton() {
  const isMounted = useIsMounted()
  const { address } = useAccount()
  const { data: name } = useEnsName({ address })
  const { data: avatar } = useEnsAvatar({ name: name ?? undefined })

  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()

  if (address && isMounted) {
    return (
      <div
        className="bg-brand hover:bg-brand/90 flex items-center gap-2 rounded-md py-0.5 pl-0.5 pr-2 text-white hover:cursor-pointer"
        onClick={openAccountModal}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatar ?? '/img/fallback-avatar.svg'}
          alt="Avatar"
          className="h-9 w-9 rounded-md"
        />
        <span>{name ?? truncateAddress(address)}</span>
      </div>
    )
  }

  return (
    <button
      className="bg-brand hover:bg-brand/90 rounded-md px-4 py-2 text-white"
      onClick={openConnectModal}
    >
      Connect
    </button>
  )
}
