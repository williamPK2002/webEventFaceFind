-- CreateEnum
CREATE TYPE "RemovalRequestType" AS ENUM ('DELETE', 'TAKEDOWN', 'PRIVACY');

-- CreateEnum
CREATE TYPE "RemovalRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "saved_photos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "removal_requests" (
    "id" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestType" "RemovalRequestType" NOT NULL,
    "reason" TEXT,
    "status" "RemovalRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "removal_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "saved_photos_userId_photoId_key" ON "saved_photos"("userId", "photoId");

-- AddForeignKey
ALTER TABLE "saved_photos" ADD CONSTRAINT "saved_photos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_photos" ADD CONSTRAINT "saved_photos_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "photos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "removal_requests" ADD CONSTRAINT "removal_requests_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "photos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "removal_requests" ADD CONSTRAINT "removal_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
