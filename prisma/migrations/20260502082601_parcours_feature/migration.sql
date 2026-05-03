-- CreateTable
CREATE TABLE "Parcours" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parcours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParcoursStep" (
    "id" TEXT NOT NULL,
    "parcoursId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "lessonId" TEXT,
    "quizId" TEXT,

    CONSTRAINT "ParcoursStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "lessonDone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StepCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ClasseToParcours" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClasseToParcours_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Parcours_teacherId_idx" ON "Parcours"("teacherId");

-- CreateIndex
CREATE INDEX "ParcoursStep_parcoursId_idx" ON "ParcoursStep"("parcoursId");

-- CreateIndex
CREATE INDEX "StepCompletion_userId_idx" ON "StepCompletion"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StepCompletion_userId_stepId_key" ON "StepCompletion"("userId", "stepId");

-- CreateIndex
CREATE INDEX "_ClasseToParcours_B_index" ON "_ClasseToParcours"("B");

-- AddForeignKey
ALTER TABLE "Parcours" ADD CONSTRAINT "Parcours_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcoursStep" ADD CONSTRAINT "ParcoursStep_parcoursId_fkey" FOREIGN KEY ("parcoursId") REFERENCES "Parcours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcoursStep" ADD CONSTRAINT "ParcoursStep_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcoursStep" ADD CONSTRAINT "ParcoursStep_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepCompletion" ADD CONSTRAINT "StepCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepCompletion" ADD CONSTRAINT "StepCompletion_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ParcoursStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClasseToParcours" ADD CONSTRAINT "_ClasseToParcours_A_fkey" FOREIGN KEY ("A") REFERENCES "Classe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClasseToParcours" ADD CONSTRAINT "_ClasseToParcours_B_fkey" FOREIGN KEY ("B") REFERENCES "Parcours"("id") ON DELETE CASCADE ON UPDATE CASCADE;
