import { publicClient } from '@/lib/web3'

export interface AddressMap {
  [key: string]: string | null
}

export async function fetchEnsNames(addresses: string[]): Promise<AddressMap> {
  const uniqueAddresses = new Set(addresses)
  const names: AddressMap = {}

  // Batch resolve ENS names
  await Promise.all(
    Array.from(uniqueAddresses).map(async (address) => {
      try {
        const name = await publicClient.getEnsName({
          address: address as `0x${string}`,
        })
        names[address] = name
      } catch (err) {
        console.error(`Failed to resolve ENS for ${address}:`, err)
        names[address] = null
      }
    })
  )

  return names
}
