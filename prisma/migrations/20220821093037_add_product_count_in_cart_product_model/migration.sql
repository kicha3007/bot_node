/*
  Warnings:

  - Added the required column `productCount` to the `CartProductModel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CartProductModel" ADD COLUMN     "productCount" INTEGER NOT NULL;
