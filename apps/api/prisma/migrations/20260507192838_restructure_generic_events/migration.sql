/*
  Warnings:

  - You are about to drop the column `brideName` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `coupleName` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `groomName` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `hashtag` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `story` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `weddingDate` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `side` on the `Guest` table. All the data in the column will be lost.
  - You are about to drop the `ShagunTransaction` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `date` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('WEDDING', 'BIRTHDAY', 'ANNIVERSARY', 'RETIREMENT', 'CUSTOM');

-- DropForeignKey
ALTER TABLE "ShagunTransaction" DROP CONSTRAINT "ShagunTransaction_eventId_fkey";

-- DropForeignKey
ALTER TABLE "ShagunTransaction" DROP CONSTRAINT "ShagunTransaction_guestId_fkey";

-- DropIndex
DROP INDEX "Guest_eventId_side_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "brideName",
DROP COLUMN "coupleName",
DROP COLUMN "groomName",
DROP COLUMN "hashtag",
DROP COLUMN "story",
DROP COLUMN "weddingDate",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "type" "EventType" NOT NULL DEFAULT 'WEDDING';

-- AlterTable
ALTER TABLE "Guest" DROP COLUMN "side",
ADD COLUMN     "group" TEXT;

-- DropTable
DROP TABLE "ShagunTransaction";

-- DropEnum
DROP TYPE "GuestSide";

-- CreateTable
CREATE TABLE "WeddingDetail" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "partner1Name" TEXT NOT NULL,
    "partner1Label" TEXT DEFAULT 'Bride',
    "partner2Name" TEXT NOT NULL,
    "partner2Label" TEXT DEFAULT 'Groom',
    "coupleName" TEXT,
    "story" TEXT,
    "hashtag" TEXT,

    CONSTRAINT "WeddingDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "label" TEXT,
    "paymentId" TEXT,
    "transferId" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'INITIATED',
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeddingDetail_eventId_key" ON "WeddingDetail"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Contribution_paymentId_key" ON "Contribution"("paymentId");

-- CreateIndex
CREATE INDEX "Contribution_eventId_status_idx" ON "Contribution"("eventId", "status");

-- CreateIndex
CREATE INDEX "Guest_eventId_group_idx" ON "Guest"("eventId", "group");

-- AddForeignKey
ALTER TABLE "WeddingDetail" ADD CONSTRAINT "WeddingDetail_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
