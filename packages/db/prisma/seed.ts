import { PrismaClient, User, UserStatus } from '../generated'

const prisma = new PrismaClient()

const { USER_EMAIL, USER_NAME } = process.env

async function insertUsers(users: Partial<User> & { name: string; email: string }[]) {
  return await prisma.user.createMany({
    data: users.map(u => ({
      emailVerified: new Date(),
      status: UserStatus.ACTIVE,
      ...u
    }))
  })
}

async function main() {
  console.log('Seeding database...')
  const users = await insertUsers([
    {
      name: USER_NAME || '',
      email: USER_EMAIL || 'user@example.com'
    }
  ])

  console.log('Database seeded successfully!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
