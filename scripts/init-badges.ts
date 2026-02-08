/**
 * Script to initialize the badge system
 * 
 * This script:
 * 1. Seeds predefined badge definitions into the database
 * 2. Configures the badge issuer account on Stellar (optional)
 * 
 * Run: node --loader ts-node/esm scripts/init-badges.ts
 */

import { seedPredefinedBadges } from "../lib/badges";
import { configureBadgeIssuer } from "../lib/stellar";

async function main() {
  console.log("🚀 Initializing badge system...\n");

  try {
    // Seed badge definitions
    console.log("📦 Seeding badge definitions...");
    await seedPredefinedBadges();

    // Configure issuer account (if secret key is available)
    const issuerSecretKey = process.env.BADGE_ISSUER_SECRET_KEY;
    if (issuerSecretKey) {
      console.log("\n🔧 Configuring badge issuer account...");
      try {
        const txHash = await configureBadgeIssuer(issuerSecretKey);
        console.log(`✅ Badge issuer configured. TX: ${txHash}`);
      } catch (error: any) {
        if (error.message?.includes("op_already_exists")) {
          console.log("ℹ️  Badge issuer already configured");
        } else {
          console.error("⚠️  Warning: Could not configure issuer:", error.message);
        }
      }
    } else {
      console.log("\n⚠️  BADGE_ISSUER_SECRET_KEY not set. Skipping issuer configuration.");
      console.log("   Set this environment variable to enable badge minting.");
    }

    console.log("\n✅ Badge system initialization complete!\n");
    console.log("Next steps:");
    console.log("1. Set BADGE_ISSUER_SECRET_KEY in your .env file");
    console.log("2. Run: npm run migrate");
    console.log("3. Update badge image URLs in the database");
    console.log("4. Test badge claiming via API\n");
  } catch (error) {
    console.error("❌ Error initializing badge system:", error);
    process.exit(1);
  }
}

main();
