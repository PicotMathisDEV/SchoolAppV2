-- CreateTable
CREATE TABLE "ResultAnswer" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionId" TEXT,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "ResultAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResultAnswer_resultId_idx" ON "ResultAnswer"("resultId");

-- AddForeignKey
ALTER TABLE "ResultAnswer" ADD CONSTRAINT "ResultAnswer_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultAnswer" ADD CONSTRAINT "ResultAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultAnswer" ADD CONSTRAINT "ResultAnswer_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "Option"("id") ON DELETE SET NULL ON UPDATE CASCADE;
