-- Add unique constraint on (parcoursId, order) in ParcoursStep
CREATE UNIQUE INDEX "ParcoursStep_parcoursId_order_key" ON "ParcoursStep"("parcoursId", "order");
