import { useAccountModal, useConnectModal } from '@rainbow-me/rainbowkit'
import Image from 'next/image'
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
          className="flex items-center gap-2 text-2xl font-bold text-brand"
        >
          <Image
            src="/img/ens-logo-Blue.svg"
            alt="ENS Logo"
            width={65}
            height={14}
          />
          <span className="h-6 w-[2px] bg-neutral-200"></span>
          <span className="text-neutral-900"> SafeNotes</span>
        </Link>

        {/* Right side - Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="rounded-md py-2 text-brand transition-colors duration-300 hover:text-brand/80"
          >
            Home
          </Link>
          <Link
            href="/admin"
            className="rounded-md px-4 py-2 text-brand transition-colors duration-300 hover:text-brand/80"
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
        className="flex items-center gap-2 rounded-md bg-brand py-0.5 pl-0.5 pr-2 text-white hover:cursor-pointer hover:bg-brand/90"
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
      className="rounded-md bg-brand px-4 py-2 text-white hover:bg-brand/90"
      onClick={openConnectModal}
    >
      Connect
    </button>
  )
}
