#!/bin/bash

# Setup script for the Badge System
# This script runs all necessary setup steps

echo "🚀 Setting up Badge System for LancePay..."
echo ""

# Step 1: Generate Prisma Client
echo "📦 Step 1: Generating Prisma Client..."
npx prisma generate
if [ $? -eq 0 ]; then
    echo "✅ Prisma client generated"
else
    echo "❌ Failed to generate Prisma client"
    exit 1
fi
echo ""

# Step 2: Run migration
echo "🗄️  Step 2: Running database migration..."
npx prisma migrate dev --name add_badge_system
if [ $? -eq 0 ]; then
    echo "✅ Database migration complete"
else
    echo "❌ Migration failed"
    exit 1
fi
echo ""

# Step 3: Check for badge issuer key
echo "🔑 Step 3: Checking for BADGE_ISSUER_SECRET_KEY..."
if grep -q "BADGE_ISSUER_SECRET_KEY=" .env 2>/dev/null; then
    echo "✅ Badge issuer key found"
else
    echo "⚠️  BADGE_ISSUER_SECRET_KEY not found in .env"
    echo ""
    echo "Generating a new Stellar keypair for badge issuance..."
    node -e "const stellar = require('@stellar/stellar-sdk'); const pair = stellar.Keypair.random(); console.log('\n🔐 Badge Issuer Keys:\n'); console.log('Public Key:', pair.publicKey()); console.log('Secret Key:', pair.secret()); console.log('\n⚠️  SAVE THESE KEYS SECURELY!\n'); console.log('Add to .env:'); console.log('BADGE_ISSUER_SECRET_KEY=' + pair.secret() + '\n'); console.log('Fund this address on testnet:'); console.log('https://laboratory.stellar.org/#account-creator?network=test\n');"
    
    echo ""
    echo "⏸️  Setup paused. Please:"
    echo "   1. Add BADGE_ISSUER_SECRET_KEY to your .env file"
    echo "   2. Fund the issuer account (see link above)"
    echo "   3. Run this script again"
    exit 0
fi
echo ""

# Step 4: Initialize badge system
echo "🎯 Step 4: Initializing badge definitions..."
npx tsx scripts/init-badges.ts
if [ $? -eq 0 ]; then
    echo "✅ Badge system initialized"
else
    echo "❌ Badge initialization failed"
    exit 1
fi
echo ""

# Success!
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Badge System Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo "   1. Start your dev server: npm run dev"
echo "   2. Test the API endpoints (see BADGE_SETUP.md)"
echo "   3. Update badge image URLs to IPFS (optional)"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: BADGE_SETUP.md"
echo "   - Full Docs: docs/BADGE_SYSTEM.md"
echo "   - Implementation: IMPLEMENTATION_SUMMARY.md"
echo ""
echo "🧪 Run Tests:"
echo "   npx tsx scripts/test-badges.ts"
echo ""
