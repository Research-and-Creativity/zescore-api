/*
  Warnings:

  - Added the required column `password` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT;
