import Link from 'next/link'

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
          <Link href="/admin">
            <button className="text-brand hover:bg-brand/10 rounded-md px-4 py-2">
              Admin
            </button>
          </Link>
          <button className="bg-brand hover:bg-brand/90 rounded-md px-4 py-2 text-white">
            Connect
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-8">{children}</main>
    </div>
  )
}
