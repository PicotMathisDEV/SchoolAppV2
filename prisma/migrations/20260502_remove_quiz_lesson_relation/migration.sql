-- Remove unused lessonId field from Quiz table
ALTER TABLE "Quiz" DROP COLUMN IF EXISTS "lessonId";
