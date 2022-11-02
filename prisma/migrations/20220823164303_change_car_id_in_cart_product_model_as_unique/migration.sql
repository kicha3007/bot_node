/*
  Warnings:

  - A unique constraint covering the columns `[cartId]` on the table `CartProductModel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CartProductModel_cartId_key" ON "CartProductModel"("cartId");
