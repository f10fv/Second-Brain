/*
  Warnings:

  - Added the required column `minStock` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reorderPoing` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "minStock" INTEGER NOT NULL,
ADD COLUMN     "reorderPoing" INTEGER NOT NULL;
