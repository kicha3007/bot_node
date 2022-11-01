/*
  Warnings:

  - You are about to drop the column `city` on the `ContactModel` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `productCount` to the `CartProductModel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CartProductModel" ADD COLUMN     "productCount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ContactModel" DROP COLUMN "city";

-- DropTable
DROP TABLE "User";
