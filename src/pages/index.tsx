import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Layout } from '@/components/Layout'
import { api } from '@/utils/trpc'
import ClientCard from '@/components/ClientCard'
import { Skeleton } from '@/components/ui/skeleton'

export default function Home() {
  const { data: organizations, isLoading } = api.organizations.getAll.useQuery()

  // Function to render organization card skeletons during loading
  const renderSkeletons = () => {
    return Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="rounded-lg border p-4 bg-white shadow-sm">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-md" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    ));
  };

  return (
    <>
      <Head>
        {/* Basic HTML Meta */}
        <title>SafeNotes</title>
        <meta
          name="description"
          content="Annotate multisig transactions. Build DAO transparency."
        />

        {/* OpenGraph / Facebook */}
        <meta property="og:title" content="ENS Safes Notes" />
        <meta
          property="og:description"
          content="Annotate multisig transactions. Build DAO transparency."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://safenotes.xyz/" />
        <meta
          property="og:image"
          content="https://safenotes.xyz/img/og-image.png"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ENS Safes Notes" />
        <meta
          name="twitter:description"
          content="Annotate multisig transactions. Build DAO transparency."
        />
        <meta
          name="twitter:image"
          content="https://safenotes.xyz/img/og-image.png"
        />
      </Head>

      <Layout>
        <div className="space-y-8">
          <div className="flex justify-between">
            <div className="flex flex-col gap-3">
              <h1 className="text-4xl font-bold">Explore Safes</h1>
              <div className="text-neutral-500">
                SafeNotes decodes DAO transactions one note at a time.
              </div>
            </div>
            {/* Desktop contact section - hidden on mobile */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="https://t.me/limes_eth"
                target="_blank"
                className="transition-opacity duration-300 hover:opacity-90"
              >
                <Image
                  src="/img/logo-telegram.png"
                  alt="Telegram Icon"
                  width={32}
                  height={32}
                />
              </Link>
              <div className="flex flex-col">
                <span className="text-sm text-neutral-500">
                  Want to try SafeNotes for your safes?
                </span>
                <div className="flex gap-1 text-sm text-neutral-900">
                  DM limes.eth on{' '}
                  <Link
                    href="https://t.me/limes_eth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-500 transition-opacity duration-300 hover:text-blue-600"
                  >
                    Telegram
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile contact card - only visible on mobile */}
          <div className="md:hidden rounded-lg border p-4 bg-white shadow-sm">
            <div className="flex items-center gap-3">
              <Image
                src="/img/logo-telegram.png"
                alt="Telegram Icon"
                width={32}
                height={32}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  Want to try SafeNotes for your safes?
                </span>
                <Link
                  href="https://t.me/limes_eth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500"
                >
                  DM limes.eth on Telegram
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4"></div>
          </div>
          <div className="text-xl font-bold">Trusted By</div>
          {/* Card Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading 
              ? renderSkeletons()
              : organizations?.map((org) => (
                  <ClientCard
                    key={org.id}
                    organization={org}
                  />
                ))
            }
          </div>
        </div>
      </Layout>
    </>
  )
}
