/*
  Warnings:

  - You are about to drop the column `backupFrequency` on the `databases` table. All the data in the column will be lost.
  - Added the required column `backupInterval` to the `databases` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BackupInterval" AS ENUM ('DAILY', 'HOURLY', 'WEEKLY', 'CUSTOM');

-- AlterTable
ALTER TABLE "databases" DROP COLUMN "backupFrequency",
ADD COLUMN     "backupInterval" "BackupInterval" NOT NULL;

-- DropEnum
DROP TYPE "BackupFrequency";
