/*
  Warnings:

  - You are about to drop the column `dimensions` on the `ProductVariant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "shippingPlace" TEXT;

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "dimensions";
