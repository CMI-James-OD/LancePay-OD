-- CreateTable
CREATE TABLE "bulk_invoice_jobs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total_count" INTEGER NOT NULL,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "results" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "bulk_invoice_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bulk_invoice_jobs_user_id_created_at_idx" ON "bulk_invoice_jobs"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "bulk_invoice_jobs" ADD CONSTRAINT "bulk_invoice_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

