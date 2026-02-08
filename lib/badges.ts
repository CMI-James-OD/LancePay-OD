import { prisma } from "./db";
import type { Prisma } from "@prisma/client";

/**
 * Badge criteria types
 */
export interface BadgeCriteria {
  type: "revenue" | "invoices" | "zero_disputes" | "completion_rate" | "custom";
  minRevenue?: number; // Minimum total revenue in USD
  minInvoices?: number; // Minimum number of paid invoices
  maxDisputes?: number; // Maximum number of disputes allowed
  minCompletionRate?: number; // Minimum completion rate (0-100)
  customQuery?: string; // Custom SQL query for advanced criteria
}

/**
 * Pre-defined badge definitions for common achievements
 */
export const PREDEFINED_BADGES = [
  {
    name: "Top 1% Earner",
    description: "Earned over $100,000 in total revenue on LancePay",
    stellarAssetCode: "TOP1PCT",
    imageUrl: "https://your-cdn.com/badges/top-1-percent.png",
    criteriaJson: {
      type: "revenue",
      minRevenue: 100000,
    } as BadgeCriteria,
  },
  {
    name: "Zero Dispute Champion",
    description: "Completed 50+ invoices with zero disputes",
    stellarAssetCode: "NODISPUTE",
    imageUrl: "https://your-cdn.com/badges/zero-dispute.png",
    criteriaJson: {
      type: "zero_disputes",
      minInvoices: 50,
      maxDisputes: 0,
    } as BadgeCriteria,
  },
  {
    name: "Verified Professional",
    description: "Completed 10+ invoices successfully",
    stellarAssetCode: "VERIPRO",
    imageUrl: "https://your-cdn.com/badges/verified-pro.png",
    criteriaJson: {
      type: "invoices",
      minInvoices: 10,
    } as BadgeCriteria,
  },
  {
    name: "Rising Star",
    description: "Earned $10,000+ in your first 3 months",
    stellarAssetCode: "RISESTAR",
    imageUrl: "https://your-cdn.com/badges/rising-star.png",
    criteriaJson: {
      type: "revenue",
      minRevenue: 10000,
    } as BadgeCriteria,
  },
  {
    name: "Trusted Freelancer",
    description: "100% completion rate with 25+ invoices",
    stellarAssetCode: "TRUSTED",
    imageUrl: "https://your-cdn.com/badges/trusted.png",
    criteriaJson: {
      type: "completion_rate",
      minInvoices: 25,
      minCompletionRate: 100,
    } as BadgeCriteria,
  },
];

/**
 * Check if a user meets the criteria for a specific badge
 * @param userId User ID to check
 * @param criteria Badge criteria to evaluate
 * @returns boolean indicating if the user is eligible
 */
export async function checkBadgeEligibility(
  userId: string,
  criteria: BadgeCriteria,
): Promise<{ eligible: boolean; reason?: string }> {
  try {
    switch (criteria.type) {
      case "revenue":
        return await checkRevenueEligibility(userId, criteria.minRevenue!);

      case "invoices":
        return await checkInvoiceCountEligibility(userId, criteria.minInvoices!);

      case "zero_disputes":
        return await checkZeroDisputeEligibility(
          userId,
          criteria.minInvoices!,
          criteria.maxDisputes!,
        );

      case "completion_rate":
        return await checkCompletionRateEligibility(
          userId,
          criteria.minInvoices!,
          criteria.minCompletionRate!,
        );

      case "custom":
        // Custom criteria would require admin-defined logic
        return { eligible: false, reason: "Custom criteria evaluation not implemented" };

      default:
        return { eligible: false, reason: "Unknown criteria type" };
    }
  } catch (error) {
    console.error("Error checking badge eligibility:", error);
    return { eligible: false, reason: "Error checking eligibility" };
  }
}

/**
 * Check if user meets minimum revenue threshold
 */
async function checkRevenueEligibility(
  userId: string,
  minRevenue: number,
): Promise<{ eligible: boolean; reason?: string }> {
  const totalRevenue = await prisma.transaction.aggregate({
    where: {
      userId,
      type: "payment",
      status: "completed",
    },
    _sum: {
      amount: true,
    },
  });

  const revenue = totalRevenue._sum.amount
    ? parseFloat(totalRevenue._sum.amount.toString())
    : 0;

  if (revenue >= minRevenue) {
    return { eligible: true };
  }

  return {
    eligible: false,
    reason: `Requires $${minRevenue} total revenue. Current: $${revenue.toFixed(2)}`,
  };
}

/**
 * Check if user has minimum number of paid invoices
 */
async function checkInvoiceCountEligibility(
  userId: string,
  minInvoices: number,
): Promise<{ eligible: boolean; reason?: string }> {
  const invoiceCount = await prisma.invoice.count({
    where: {
      userId,
      status: "paid",
    },
  });

  if (invoiceCount >= minInvoices) {
    return { eligible: true };
  }

  return {
    eligible: false,
    reason: `Requires ${minInvoices} paid invoices. Current: ${invoiceCount}`,
  };
}

/**
 * Check if user has zero disputes with minimum invoices
 */
async function checkZeroDisputeEligibility(
  userId: string,
  minInvoices: number,
  maxDisputes: number,
): Promise<{ eligible: boolean; reason?: string }> {
  const invoiceCount = await prisma.invoice.count({
    where: {
      userId,
      status: "paid",
    },
  });

  if (invoiceCount < minInvoices) {
    return {
      eligible: false,
      reason: `Requires ${minInvoices} paid invoices. Current: ${invoiceCount}`,
    };
  }

  // Count disputes across user's invoices
  const disputeCount = await prisma.dispute.count({
    where: {
      invoice: {
        userId,
      },
    },
  });

  if (disputeCount <= maxDisputes) {
    return { eligible: true };
  }

  return {
    eligible: false,
    reason: `Maximum ${maxDisputes} disputes allowed. Current: ${disputeCount}`,
  };
}

/**
 * Check if user has minimum completion rate
 */
async function checkCompletionRateEligibility(
  userId: string,
  minInvoices: number,
  minCompletionRate: number,
): Promise<{ eligible: boolean; reason?: string }> {
  const totalInvoices = await prisma.invoice.count({
    where: {
      userId,
    },
  });

  if (totalInvoices < minInvoices) {
    return {
      eligible: false,
      reason: `Requires ${minInvoices} total invoices. Current: ${totalInvoices}`,
    };
  }

  const paidInvoices = await prisma.invoice.count({
    where: {
      userId,
      status: "paid",
    },
  });

  const completionRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

  if (completionRate >= minCompletionRate) {
    return { eligible: true };
  }

  return {
    eligible: false,
    reason: `Requires ${minCompletionRate}% completion rate. Current: ${completionRate.toFixed(1)}%`,
  };
}

/**
 * Get all badges with user's eligibility status
 * @param userId User ID to check
 * @returns Array of badges with eligibility information
 */
export async function getUserBadgeStatus(userId: string) {
  // Get all active badge definitions
  const badges = await prisma.badgeDefinition.findMany({
    where: {
      isActive: true,
    },
  });

  // Get user's earned badges
  const earnedBadges = await prisma.userBadge.findMany({
    where: {
      userId,
    },
    include: {
      badge: true,
    },
  });

  const earnedBadgeIds = new Set(earnedBadges.map((ub: any) => ub.badgeId));

  // Check eligibility for each badge
  const badgeStatuses = await Promise.all(
    badges.map(async (badge: any) => {
      const isEarned = earnedBadgeIds.has(badge.id);
      
      if (isEarned) {
        const userBadge = earnedBadges.find((ub: any) => ub.badgeId === badge.id);
        return {
          ...badge,
          earned: true,
          eligible: true,
          earnedAt: userBadge?.issuedAt,
          stellarTxHash: userBadge?.stellarTxHash,
        };
      }

      // Check eligibility
      const criteria = badge.criteriaJson as BadgeCriteria;
      const eligibility = await checkBadgeEligibility(userId, criteria);

      return {
        ...badge,
        earned: false,
        eligible: eligibility.eligible,
        reason: eligibility.reason,
      };
    }),
  );

  return badgeStatuses;
}

/**
 * Seed predefined badges into the database
 * This should be run once during setup or via a migration script
 */
export async function seedPredefinedBadges() {
  for (const badge of PREDEFINED_BADGES) {
    await prisma.badgeDefinition.upsert({
      where: {
        stellarAssetCode: badge.stellarAssetCode,
      },
      update: {
        name: badge.name,
        description: badge.description,
        imageUrl: badge.imageUrl,
        criteriaJson: badge.criteriaJson as unknown as Prisma.InputJsonValue,
      },
      create: {
        name: badge.name,
        description: badge.description,
        stellarAssetCode: badge.stellarAssetCode,
        imageUrl: badge.imageUrl,
        criteriaJson: badge.criteriaJson as unknown as Prisma.InputJsonValue,
      },
    });
  }

  console.log(`✅ Seeded ${PREDEFINED_BADGES.length} badge definitions`);
}
