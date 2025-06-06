/*
  Warnings:

  - Changed the type of `role` on the `Message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "role",
ADD COLUMN     "role" "MessageRole" NOT NULL;

-- DropEnum
DROP TYPE "Role";
