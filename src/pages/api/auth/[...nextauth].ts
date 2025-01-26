import { IncomingMessage } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getCsrfToken } from 'next-auth/react'
import {
  type SiweMessage,
  parseSiweMessage,
  validateSiweMessage,
} from 'viem/siwe'

import { publicClient } from '@/lib/web3'

export function getAuthOptions(req: IncomingMessage): NextAuthOptions {
  const providers = [
    CredentialsProvider({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async authorize(credentials: any) {
        try {
          const siweMessage = parseSiweMessage(
            credentials?.message
          ) as SiweMessage

          if (
            !validateSiweMessage({
              address: siweMessage?.address,
              message: siweMessage,
            })
          ) {
            return null
          }

          const nextAuthUrl =
            process.env.NEXTAUTH_URL ||
            (process.env.VERCEL_URL
              ? `https://${process.env.VERCEL_URL}`
              : null)
          if (!nextAuthUrl) {
            return null
          }

          console.log('nextAuthUrl', nextAuthUrl)

          const nextAuthHost = new URL(nextAuthUrl).host
          console.log('nextAuthHost', nextAuthHost)
          console.log('siweMessage.domain', siweMessage.domain)
          if (siweMessage.domain !== nextAuthHost) {
            return null
          }

          if (
            siweMessage.nonce !==
            (await getCsrfToken({ req: { headers: req.headers } }))
          ) {
            return null
          }

          const valid = await publicClient.verifyMessage({
            address: siweMessage?.address,
            message: credentials?.message,
            signature: credentials?.signature,
          })

          if (!valid) {
            return null
          }

          return {
            id: siweMessage.address,
          }
        } catch {
          return null
        }
      },
      credentials: {
        message: {
          label: 'Message',
          placeholder: '0x0',
          type: 'text',
        },
        signature: {
          label: 'Signature',
          placeholder: '0x0',
          type: 'text',
        },
      },
      name: 'Ethereum',
    }),
  ]

  return {
    callbacks: {
      async session({ session, token }) {
        // @ts-expect-error: Copied from Rainbowkit example
        session.address = token.sub
        session.user = {
          name: token.sub,
        }
        return session
      },
    },
    // https://next-auth.js.org/configuration/providers/oauth
    providers,
    secret: process.env.NEXTAUTH_SECRET,
    session: {
      strategy: 'jwt',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  }
}

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const authOptions = getAuthOptions(req)

  if (!Array.isArray(req.query.nextauth)) {
    res.status(400).send('Bad request')
    return
  }

  const isDefaultSigninPage =
    req.method === 'GET' &&
    req.query.nextauth.find((value) => value === 'signin')

  // Hide Sign-In with Ethereum from default sign page
  if (isDefaultSigninPage) {
    authOptions.providers.pop()
  }

  return await NextAuth(req, res, authOptions)
}
