/*
  Warnings:

  - You are about to drop the column `classeId` on the `Lesson` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_classeId_fkey";

-- DropIndex
DROP INDEX "Lesson_classeId_idx";

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "classeId";

-- CreateTable
CREATE TABLE "_ClasseToLesson" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClasseToLesson_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ClasseToLesson_B_index" ON "_ClasseToLesson"("B");

-- AddForeignKey
ALTER TABLE "_ClasseToLesson" ADD CONSTRAINT "_ClasseToLesson_A_fkey" FOREIGN KEY ("A") REFERENCES "Classe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClasseToLesson" ADD CONSTRAINT "_ClasseToLesson_B_fkey" FOREIGN KEY ("B") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
