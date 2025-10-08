-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WatchStatus" ADD VALUE 'WANT_TO_PLAY';
ALTER TYPE "WatchStatus" ADD VALUE 'PLAYING';
ALTER TYPE "WatchStatus" ADD VALUE 'ON_HOLD';
ALTER TYPE "WatchStatus" ADD VALUE 'DROPPED';
