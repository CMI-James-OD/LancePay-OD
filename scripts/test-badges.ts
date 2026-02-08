/**
 * Test script for the Badge System
 * 
 * This script tests the complete badge flow:
 * 1. Check eligibility
 * 2. Claim a badge
 * 3. Verify on-chain ownership
 * 4. Test duplicate claim prevention
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface TestResult {
  test: string;
  passed: boolean;
  details?: any;
  error?: string;
}

const results: TestResult[] = [];

async function testBadgeFlow(authToken: string, userId?: string) {
  console.log("🧪 Testing Badge System...\n");

  try {
    // Test 1: Get all badges with eligibility status
    console.log("Test 1: Fetching badges with eligibility...");
    const getBadgesResponse = await fetch(`${BASE_URL}/api/routes-d/reputation/badges`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!getBadgesResponse.ok) {
      throw new Error(`Failed to fetch badges: ${getBadgesResponse.status}`);
    }

    const badgesData = await getBadgesResponse.json();
    console.log(`✅ Found ${badgesData.badges.length} badges`);
    
    results.push({
      test: "Get Badges",
      passed: true,
      details: `${badgesData.badges.length} badges retrieved`,
    });

    // Find an eligible but not earned badge
    const eligibleBadge = badgesData.badges.find(
      (b: any) => b.eligible && !b.earned
    );
    
    // Find an ineligible badge for negative test
    const ineligibleBadge = badgesData.badges.find(
      (b: any) => !b.eligible && !b.earned
    );

    // Test 2: Try to claim ineligible badge (should fail)
    if (ineligibleBadge) {
      console.log("\nTest 2: Attempting to claim ineligible badge...");
      const claimIneligibleResponse = await fetch(
        `${BASE_URL}/api/routes-d/reputation/badges`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ badgeId: ineligibleBadge.id }),
        }
      );

      if (claimIneligibleResponse.status === 403) {
        const errorData = await claimIneligibleResponse.json();
        console.log(`✅ Correctly rejected: ${errorData.reason}`);
        results.push({
          test: "Ineligible Badge Rejection",
          passed: true,
          details: errorData.reason,
        });
      } else {
        console.log("❌ Should have rejected ineligible badge claim");
        results.push({
          test: "Ineligible Badge Rejection",
          passed: false,
          error: "Did not return 403 Forbidden",
        });
      }
    }

    // Test 3: Claim eligible badge
    if (eligibleBadge) {
      console.log("\nTest 3: Claiming eligible badge...");
      console.log(`Badge: ${eligibleBadge.name}`);
      
      const claimResponse = await fetch(
        `${BASE_URL}/api/routes-d/reputation/badges`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ badgeId: eligibleBadge.id }),
        }
      );

      if (claimResponse.ok) {
        const claimData = await claimResponse.json();
        console.log(`✅ Badge claimed! TX: ${claimData.txHash}`);
        console.log(`   View on Stellar: https://stellar.expert/explorer/testnet/tx/${claimData.txHash}`);
        
        results.push({
          test: "Badge Claim",
          passed: true,
          details: {
            badge: eligibleBadge.name,
            txHash: claimData.txHash,
          },
        });

        // Test 4: Try to claim same badge again (should fail)
        console.log("\nTest 4: Attempting duplicate badge claim...");
        const duplicateResponse = await fetch(
          `${BASE_URL}/api/routes-d/reputation/badges`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ badgeId: eligibleBadge.id }),
          }
        );

        if (duplicateResponse.status === 409) {
          console.log("✅ Correctly rejected duplicate claim");
          results.push({
            test: "Duplicate Badge Prevention",
            passed: true,
          });
        } else {
          console.log("❌ Should have rejected duplicate claim");
          results.push({
            test: "Duplicate Badge Prevention",
            passed: false,
            error: "Did not return 409 Conflict",
          });
        }
      } else {
        const errorData = await claimResponse.json();
        console.log(`❌ Failed to claim badge: ${errorData.error}`);
        results.push({
          test: "Badge Claim",
          passed: false,
          error: errorData.error,
        });
      }
    } else {
      console.log("\n⚠️  No eligible badges found to claim");
      results.push({
        test: "Badge Claim",
        passed: false,
        error: "No eligible badges available",
      });
    }

    // Test 5: Public badge verification (if userId provided)
    if (userId && (eligibleBadge || badgesData.badges.find((b: any) => b.earned))) {
      console.log("\nTest 5: Public badge verification...");
      const earnedBadge = badgesData.badges.find((b: any) => b.earned) || eligibleBadge;
      
      const verifyResponse = await fetch(
        `${BASE_URL}/api/routes-d/reputation/badges/verify?userId=${userId}&badgeId=${earnedBadge.id}`
      );

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log(`✅ Verification endpoint works`);
        console.log(`   Verified: ${verifyData.verified}`);
        
        results.push({
          test: "Public Badge Verification",
          passed: true,
          details: verifyData,
        });
      } else {
        console.log("❌ Verification endpoint failed");
        results.push({
          test: "Public Badge Verification",
          passed: false,
        });
      }

      // Test 6: Public profile
      console.log("\nTest 6: Public badge profile...");
      const profileResponse = await fetch(
        `${BASE_URL}/api/routes-d/reputation/profile/${userId}`
      );

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log(`✅ Public profile loaded`);
        console.log(`   Badges: ${profileData.badges.length}`);
        console.log(`   Stats: ${profileData.stats.completedInvoices} invoices, $${profileData.stats.totalRevenue} revenue`);
        
        results.push({
          test: "Public Badge Profile",
          passed: true,
          details: profileData.stats,
        });
      } else {
        console.log("❌ Profile endpoint failed");
        results.push({
          test: "Public Badge Profile",
          passed: false,
        });
      }
    }

  } catch (error: any) {
    console.error("\n❌ Test suite failed:", error.message);
    results.push({
      test: "Overall Test Suite",
      passed: false,
      error: error.message,
    });
  }

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("TEST SUMMARY");
  console.log("=".repeat(50));
  
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  
  results.forEach((result) => {
    const icon = result.passed ? "✅" : "❌";
    console.log(`${icon} ${result.test}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log("\n" + "=".repeat(50));
  console.log(`Result: ${passed}/${total} tests passed`);
  console.log("=".repeat(50));
  
  return results;
}

// Export for use
if (require.main === module) {
  console.log("⚠️  Run this script by calling testBadgeFlow() with your auth token");
  console.log("\nExample:");
  console.log('  const results = await testBadgeFlow("your-auth-token", "user-id");');
}

export { testBadgeFlow };
