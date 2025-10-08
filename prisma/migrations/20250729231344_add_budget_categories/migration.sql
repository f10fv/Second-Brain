-- CreateEnum
CREATE TYPE "BudgetCategory" AS ENUM ('NEEDS', 'WANTS', 'SAVINGS');

-- AlterTable
ALTER TABLE "finance_records" ADD COLUMN     "budgetCategory" "BudgetCategory";
