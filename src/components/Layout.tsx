import { useAccountModal, useConnectModal } from '@rainbow-me/rainbowkit'
import Image from 'next/image'
import Link from 'next/link'
import { useAccount, useEnsAvatar, useEnsName } from 'wagmi'
import { useRouter } from 'next/router'
import { Settings } from 'lucide-react'

import { useIsMounted } from '@/hooks/useIsMounted'
import { truncateAddress } from '@/lib/utils'

export function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const currentPath = router.pathname

  return (
    <div className="mx-auto flex max-w-7xl flex-col">
      {/* Header/Navigation Bar */}
      <nav className="flex items-center justify-between p-4">
        {/* Left side - Brand */}
        <div>
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
        </div>

        <div>
          {/* Right side - Buttons */}
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <Link
                href={`/admin`}
                className={`px-3 py-2 rounded-md text-sm font-medium ${currentPath.startsWith('/admin')
                  ? 'text-brand font-semibold'
                  : 'text-gray-700 hover:text-brand'
                  }`}
              >
                <span className="hidden sm:inline">Admin</span>
                <Settings className="inline sm:hidden" size={18} />
              </Link>
            </div>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-8">
        {children}
      </main>
      <footer className="mr-8 flex items-center justify-end gap-4 p-4">
        <Link
          className="transition-colors duration-300 hover:text-brand"
          target="_blank"
          href="https://github.com/aslobodnik/safenotes"
        >
          Github
        </Link>
        /
        <Link
          href="https://t.me/limes_eth"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors duration-300 hover:text-brand"
        >
          Contact Us
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
        className="flex items-center gap-2 rounded-md border border-brand pr-2 text-brand hover:cursor-pointer hover:bg-brand/10 overflow-hidden"
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
      className="rounded-md bg-brand px-4 py-2 text-white hover:bg-brand/90 overflow-hidden"
      onClick={handleOpenConnectModal}
    >
      Connect
    </button>
  )
}
