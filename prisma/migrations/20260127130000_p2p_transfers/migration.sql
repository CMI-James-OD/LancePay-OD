-- Add P2P transfer fields to Transaction table
ALTER TABLE "Transaction" 
ADD COLUMN "sender_id" TEXT,
ADD COLUMN "recipient_id" TEXT,
ADD COLUMN "memo" TEXT;

-- CreateIndex
CREATE INDEX "Transaction_sender_id_idx" ON "Transaction"("sender_id");
CREATE INDEX "Transaction_recipient_id_idx" ON "Transaction"("recipient_id");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
