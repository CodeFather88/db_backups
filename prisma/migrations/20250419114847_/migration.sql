/*
  Warnings:

  - Added the required column `bucket` to the `Backup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `Backup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Backup" ADD COLUMN     "bucket" TEXT NOT NULL,
ADD COLUMN     "key" TEXT NOT NULL;
