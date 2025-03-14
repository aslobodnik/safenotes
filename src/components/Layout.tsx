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
      <nav className="flex items-center justify-between p-8">
        {/* Left side - Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-brand"
        >
          <Image
            src="/img/logo-safenotes.svg"
            alt="ENS Logo"
            width={20}
            height={14}
          />

          <span className="text-neutral-900"> SafeNotes</span>
        </Link>

        {/* Right side - Buttons */}
        <div className="flex items-center gap-4">
          <ConnectButton />
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-8">{children}</main>
      <footer className="mr-8 flex items-center justify-end gap-4 p-4">
        <Link
          className="transition-colors duration-300 hover:text-brand"
          target="_blank"
          href="https://ens.domains/"
        >
          ENS
        </Link>{' '}
        /{' '}
        <Link
          className="transition-colors duration-300 hover:text-brand"
          target="_blank"
          href="https://docs.ens.domains/dao"
        >
          Goverance
        </Link>{' '}
        /
        <Link
          className="transition-colors duration-300 hover:text-brand"
          target="_blank"
          href="https://github.com/aslobodnik/safenotes"
        >
          Github
        </Link>
      </footer>
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

  const handleOpenConnectModal = () => {
    console.log('openConnectModal, isopenConnectModal', openConnectModal)
    console.log('openConnectModal available:', !!openConnectModal)
    openConnectModal?.()
  }

  const handleOpenAccountModal = () => {
    console.log('openAccountModal, isopenAccountModal', openAccountModal)
    console.log('openAccountModal available:', !!openAccountModal)
    openAccountModal?.()
  }

  if (address && isMounted) {
    return (
      <div
        className="flex items-center gap-2 rounded-md border border-brand pr-2 text-brand hover:cursor-pointer hover:bg-brand/10"
        onClick={handleOpenAccountModal}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatar ?? '/img/fallback-avatar.svg'}
          alt="Avatar"
          className="h-9 w-9 rounded-l-md"
        />
        <span>{name ?? truncateAddress(address)}</span>
      </div>
    )
  }

  return (
    <button
      className="rounded-md bg-brand px-4 py-2 text-white hover:bg-brand/90"
      onClick={handleOpenConnectModal}
    >
      Connect
    </button>
  )
}
