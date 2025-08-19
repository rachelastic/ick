/*
  Warnings:

  - Added the required column `updatedAt` to the `Ick` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Ick" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'general',
ADD COLUMN     "downvotes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ip_hash" TEXT,
ADD COLUMN     "opportunity_score" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "reasoning" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "upvotes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "user_id" TEXT,
ADD COLUMN     "user_type" TEXT NOT NULL DEFAULT 'venter',
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Ick_createdAt_idx" ON "public"."Ick"("createdAt");

-- CreateIndex
CREATE INDEX "Ick_category_idx" ON "public"."Ick"("category");

-- CreateIndex
CREATE INDEX "Ick_sentiment_idx" ON "public"."Ick"("sentiment");

-- CreateIndex
CREATE INDEX "Ick_severity_idx" ON "public"."Ick"("severity");

-- CreateIndex
CREATE INDEX "Ick_opportunity_score_idx" ON "public"."Ick"("opportunity_score");
