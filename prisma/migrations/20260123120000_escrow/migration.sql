-- Add escrow columns to Invoice
ALTER TABLE "Invoice"
ADD COLUMN "escrowEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "escrowStatus" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN "escrowReleaseConditions" TEXT,
ADD COLUMN "escrowReleasedAt" TIMESTAMP(3),
ADD COLUMN "escrowDisputedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "escrow_events" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "actor_type" TEXT,
    "actor_email" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escrow_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "escrow_events_invoice_id_created_at_idx" ON "escrow_events"("invoice_id", "created_at");

-- AddForeignKey
ALTER TABLE "escrow_events" ADD CONSTRAINT "escrow_events_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

