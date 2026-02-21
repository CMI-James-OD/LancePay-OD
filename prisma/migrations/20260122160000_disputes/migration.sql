-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "initiated_by" TEXT NOT NULL,
    "initiator_email" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "requested_action" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "resolution" TEXT,
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "disputes_invoice_id_key" ON "disputes"("invoice_id");

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "dispute_messages" (
    "id" TEXT NOT NULL,
    "dispute_id" TEXT NOT NULL,
    "sender_type" TEXT NOT NULL,
    "sender_email" TEXT,
    "message" TEXT NOT NULL,
    "attachments" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispute_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dispute_messages_dispute_id_created_at_idx" ON "dispute_messages"("dispute_id", "created_at");

-- AddForeignKey
ALTER TABLE "dispute_messages" ADD CONSTRAINT "dispute_messages_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

