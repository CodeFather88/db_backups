-- CreateEnum
CREATE TYPE "DbType" AS ENUM ('postgresql', 'mongo');

-- CreateEnum
CREATE TYPE "BackupFrequency" AS ENUM ('DAILY', 'HOURLY', 'WEEKLY', 'CUSTOM');

-- CreateTable
CREATE TABLE "databases" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DbType" NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "databaseName" TEXT NOT NULL,
    "backupFrequency" "BackupFrequency" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "databases_pkey" PRIMARY KEY ("id")
);
