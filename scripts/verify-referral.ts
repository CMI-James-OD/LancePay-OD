import { prisma } from "../lib/db";
import {
  ensureReferralCode,
  createReferralEarning,
  getReferralStats,
} from "../lib/referral";
import { Decimal } from "@prisma/client/runtime/library";

async function verify() {
  console.log("--- Starting Referral Verification ---");

  // 1. Create User A (Referrer)
  const userA = await prisma.user.create({
    data: {
      privyId: `test-referrer-${Date.now()}`,
      email: `referrer-${Date.now()}@example.com`,
      name: "Referrer User",
    },
  });
  console.log(`Created Referrer: ${userA.email}`);

  // 2. Generate Referral Code for User A
  const referralCode = await ensureReferralCode(userA.id);
  console.log(`User A Referral Code: ${referralCode}`);

  // 3. Create User B (Referred) using User A's code
  const userB = await prisma.user.create({
    data: {
      privyId: `test-referred-${Date.now()}`,
      email: `referred-${Date.now()}@example.com`,
      name: "Referred User",
      referredById: userA.id,
    },
  });
  console.log(
    `Created Referred User: ${userB.email} (Referred by ${userA.id})`,
  );

  // 4. Create an Invoice for User B
  const invoice = await prisma.invoice.create({
    data: {
      userId: userB.id,
      invoiceNumber: `INV-${Date.now()}`,
      clientEmail: "client@example.com",
      description: "Test Referral Invoice",
      amount: new Decimal(100.0),
      currency: "USD",
      status: "paid",
      paymentLink: `https://lancepay.app/pay/INV-${Date.now()}`,
      paidAt: new Date(),
    },
  });
  console.log(`Created Paid Invoice for User B: ${invoice.invoiceNumber}`);

  // 5. Trigger Referral Earning
  await createReferralEarning({
    referrerId: userA.id,
    referredUserId: userB.id,
    invoiceId: invoice.id,
    invoiceAmount: Number(invoice.amount),
  });
  console.log(`Triggered Referral Earning for User A`);

  // 6. Verify Stats for User A
  const stats = await getReferralStats(userA.id);
  console.log("User A Referral Stats:", stats);

  if (stats.totalReferred === 1 && stats.totalEarnedUsdc > 0) {
    console.log("✅ Verification Successful!");
  } else {
    console.error("❌ Verification Failed: Stats mismatch");
  }

  // Cleanup
  console.log("Cleaning up test data...");
  await prisma.referralEarning.deleteMany({ where: { referrerId: userA.id } });
  await prisma.invoice.deleteMany({ where: { id: invoice.id } });
  await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
}

verify()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
