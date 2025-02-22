import { ChevronRight } from 'lucide-react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

import { Layout } from '@/components/Layout'

export default function Home() {
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
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="flex flex-col gap-3">
              <h1 className="text-4xl font-bold">SafeNotes</h1>
              <div className="text-neutral-500">
                Decoding DAO transactions one note at time.
              </div>
            </div>
            <div className="flex items-center gap-2">
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
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4"></div>
          </div>
          <div className="text-xl font-bold">Trusted By</div>
          {/* Card Container */}
          <div className="grid grid-cols-2 gap-4">
            <Card
              title="ENS"
              description="Explore ENS Safes"
              bannerImage="/img/banner-ens.png"
              brandImage="/img/logo-filled.svg"
            />
            <Card
              title="Uniswap (UAC)"
              description="Uniswap Accountability Committee Safes"
              bannerImage="/img/banner-uni.png"
              brandImage="/img/logo-uniswap.svg"
            />
          </div>
        </div>
      </Layout>
    </>
  )
}

function Card({
  bannerImage,
  title,
  description,
  brandImage,
}: {
  bannerImage: string
  title: string
  description: string
  brandImage: string
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      {/* Banner Image */}
      <Image
        src={bannerImage}
        alt="Banner Image"
        width={500}
        height={500}
        className="hidden h-48 w-full rounded-lg object-cover md:block"
      />
      {/* Card Content */}
      <div className="mt-4 flex flex-col gap-4 md:flex-row md:gap-4">
        <Image
          src={brandImage}
          className="w-20 -rotate-3 self-center rounded-3xl border-2 border-white shadow-[0_0_22px_0_#00000029] sm:block md:w-28"
          alt="Brand Image"
          width={80}
          height={80}
        />
        <div className="flex flex-col gap-2">
          <div className="text-lg font-bold text-neutral-900">{title}</div>
          <div className="text-sm text-neutral-500">{description}</div>
          <div className="mt-4 flex items-center gap-2 text-sm text-neutral-900">
            View Transactions <ChevronRight className="size-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
