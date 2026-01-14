-- Add updatedAt with default to backfill existing rows
ALTER TABLE "Feedback" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Remove default for future rows (Prisma manages updatedAt)
ALTER TABLE "Feedback" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- Replace non-unique index with unique constraint on userId
DROP INDEX "Feedback_userId_idx";
CREATE UNIQUE INDEX "Feedback_userId_key" ON "Feedback"("userId");
