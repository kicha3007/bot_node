/*
  Warnings:

  - Added the required column `price` to the `ProductModel` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CartModel" DROP CONSTRAINT "CartModel_userId_fkey";

-- DropForeignKey
ALTER TABLE "CartProductModel" DROP CONSTRAINT "CartProductModel_cartId_fkey";

-- DropForeignKey
ALTER TABLE "CartProductModel" DROP CONSTRAINT "CartProductModel_productId_fkey";

-- DropForeignKey
ALTER TABLE "ContactModel" DROP CONSTRAINT "ContactModel_userId_fkey";

-- AlterTable
ALTER TABLE "CartModel" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "CartProductModel" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ContactModel" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ProductModel" ADD COLUMN     "price" INTEGER NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UserModel" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "CartModel" ADD CONSTRAINT "CartModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartProductModel" ADD CONSTRAINT "CartProductModel_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "CartModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartProductModel" ADD CONSTRAINT "CartProductModel_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ProductModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactModel" ADD CONSTRAINT "ContactModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
