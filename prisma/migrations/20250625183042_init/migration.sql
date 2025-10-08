/*
  Warnings:

  - Added the required column `shippingCost` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "shippingCost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL;
