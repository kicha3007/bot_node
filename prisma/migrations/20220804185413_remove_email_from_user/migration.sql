/*
  Warnings:

  - You are about to drop the column `email` on the `UserModel` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `UserModel` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserModel_email_key";

-- AlterTable
ALTER TABLE "UserModel" DROP COLUMN "email",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "UserModel_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "UserModel_id_key" ON "UserModel"("id");
