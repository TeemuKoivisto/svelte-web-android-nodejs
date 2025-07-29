-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('BACKLOG', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE');

-- CreateTable
CREATE TABLE "task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "status" "TaskStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),
    "trashed_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
