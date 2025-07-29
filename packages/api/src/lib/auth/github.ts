import type { Endpoints } from '@octokit/types'
import { UserStatus, type PrismaClient } from '@org/db/client'

export type GitHubUserData = Endpoints['GET /user']['response']['data']

export async function findOrCreateGithubUser(data: GitHubUserData, db: PrismaClient) {
  // const key = await env.USERS_KV.get(data.id.toString())
  // const user = getUser(key)
  // const prisma = env.prisma()
  // if (user?.p === 'github' && user.user_id) {
  //   return prisma.user.findUnique({
  //     where: { id: user.user_id }
  //   })
  // }
  const acc = await db.account.findFirst({
    where: {
      provider: 'github',
      providerAccountId: data.id.toString()
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
      name: data.name || '',
      email: data.email || '',
      image: data.avatar_url,
      status: UserStatus.ACTIVE
    }
    // select: {
    //   id: true,
    //   email: true,
    //   name: true,
    // }
  })
  const _account = await db.account.create({
    data: {
      user_id: created.id,
      type: 'oauth',
      provider: 'github',
      providerAccountId: data.id.toString()
    }
  })
  // const kvUser: KVUser = {
  //   p: 'github',
  //   user_id: created.id
  // }
  // await env.USERS_KV.put(data.id.toString(), JSON.stringify(kvUser))
  return created
}
