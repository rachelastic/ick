-- CreateTable
CREATE TABLE "public"."Ick" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "severity" INTEGER NOT NULL,
    "sentiment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ick_pkey" PRIMARY KEY ("id")
);
