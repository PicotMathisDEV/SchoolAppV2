-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "image" TEXT;

-- CreateTable
CREATE TABLE "_ClasseToQuiz" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClasseToQuiz_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ClasseToQuiz_B_index" ON "_ClasseToQuiz"("B");

-- AddForeignKey
ALTER TABLE "_ClasseToQuiz" ADD CONSTRAINT "_ClasseToQuiz_A_fkey" FOREIGN KEY ("A") REFERENCES "Classe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClasseToQuiz" ADD CONSTRAINT "_ClasseToQuiz_B_fkey" FOREIGN KEY ("B") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
