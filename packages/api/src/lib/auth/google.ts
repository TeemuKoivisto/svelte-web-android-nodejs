import type { GoogleProfile } from '@org/lib/schemas'
import { UserStatus, type PrismaClient } from '@org/db/client'

export async function findOrCreateGoogleUser(data: GoogleProfile, db: PrismaClient) {
  // const key = await env.USERS_KV.get(data.sub)
  // const user = getUser(key)
  // const prisma = env.prisma()
  // if (user?.p === 'google' && user.user_id) {
  //   return prisma.user.findUnique({
  //     where: { id: user.user_id }
  //   })
  // }
  const acc = await db.account.findFirst({
    where: {
      provider: 'google',
      providerAccountId: data.sub
    },
    include: {
      user: true
    }
  })
  if (acc) {
    return acc.user
  }
  const created = await db.user.create({
    data: {
      name: `${data.given_name} ${data.family_name}`,
      email: data.email,
      image: data.picture,
      status: UserStatus.ACTIVE,
      accounts: {
        create: {
          type: 'oauth',
          provider: 'google',
          providerAccountId: data.sub
        }
      }
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true
    }
  })
  // const kvUser: KVUser = {
  //   p: 'google',
  //   user_id: created.id
  // }
  // await env.USERS_KV.put(data.sub, JSON.stringify(kvUser))
  return created
}
