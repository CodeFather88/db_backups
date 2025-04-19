-- CreateTable
CREATE TABLE "Backup" (
    "id" TEXT NOT NULL,
    "databaseId" TEXT NOT NULL,
    "etag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Backup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Backup" ADD CONSTRAINT "Backup_databaseId_fkey" FOREIGN KEY ("databaseId") REFERENCES "databases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
