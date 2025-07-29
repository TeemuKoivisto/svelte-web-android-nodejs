import dotenv from 'dotenv'

import { PrismaClient, TaskStatus, User, UserStatus } from '../generated/client'

dotenv.config({ quiet: true })

const prisma = new PrismaClient()

const { USER_EMAIL, USER_NAME } = process.env

async function insertUsers(users: Partial<User> & { name: string; email: string }[]) {
  return await prisma.user.createManyAndReturn({
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
      name: USER_NAME || 'User',
      email: USER_EMAIL || 'user@example.com'
    }
  ])
  const tasks = await Promise.all(
    users.map(u =>
      prisma.task.createMany({
        data: [
          {
            title: 'Backlogged',
            status: TaskStatus.BACKLOG,
            user_id: u.id
          },
          {
            title: 'Do me',
            status: TaskStatus.TODO,
            user_id: u.id
          },
          {
            title: 'WIP',
            status: TaskStatus.IN_PROGRESS,
            user_id: u.id
          },
          {
            title: 'It is done',
            status: TaskStatus.DONE,
            user_id: u.id
          }
        ]
      })
    )
  )
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
