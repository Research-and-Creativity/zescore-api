-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'LECTURER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "boothNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "isVoteOnly" BOOLEAN NOT NULL DEFAULT false,
    "criteria1" INTEGER,
    "criteria2" INTEGER,
    "criteria3" INTEGER,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_teamName_key" ON "Team"("teamName");

-- CreateIndex
CREATE UNIQUE INDEX "Team_boothNumber_key" ON "Team"("boothNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_teamId_voterId_key" ON "Assessment"("teamId", "voterId");

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
