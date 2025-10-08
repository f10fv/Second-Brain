/*
  Warnings:

  - You are about to drop the `project_tasks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "project_tasks" DROP CONSTRAINT "project_tasks_projectId_fkey";

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "projectId" TEXT;

-- DropTable
DROP TABLE "project_tasks";

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
