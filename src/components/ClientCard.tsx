import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { useRouter } from 'next/router'
import { Organization } from '@/db/schema'

interface ClientCardProps {
  organization: Organization
}

export default function ClientCard({
  organization,
}: ClientCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/${organization.slug}`)
  }

  return (
    <div 
      onClick={handleClick}
      className="flex flex-col gap-2 rounded-lg border p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-neutral-300"
    >
      {/* Banner Image */}
      <Image
        src={organization.bannerImage}
        alt="Banner Image"
        width={500}
        height={500}
        className="hidden h-48 w-full rounded-lg object-cover md:block"
      />
      {/* Card Content */}
      <div className="mt-4 flex flex-col gap-4 md:flex-row md:gap-4">
        <Image
          src={organization.logoImage}
          className="w-20 -rotate-3 self-center rounded-3xl border-2 border-white shadow-[0_0_22px_0_#00000029] sm:block md:w-28"
          alt="Brand Image"
          width={80}
          height={80}
        />
        <div className="flex flex-col gap-2">
          <div className="text-lg font-bold text-neutral-900">{organization.name}</div>
          <div className="text-sm text-neutral-500">{organization.description}</div>
          <div className="mt-4 flex items-center gap-2 text-sm text-neutral-900 group">
            View Transactions <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  )
}