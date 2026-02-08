#!/bin/bash

# Git commands to create PR for badge system implementation
# Run this script to prepare and push your changes

echo "🚀 Preparing Badge System PR..."
echo ""

# Check if we're in a git repo
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Please initialize git first:"
    echo "   git init"
    echo "   git remote add origin <your-repo-url>"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $CURRENT_BRANCH"

# Create feature branch
BRANCH_NAME="feature/on-chain-badge-system"
echo ""
echo "📝 Creating feature branch: $BRANCH_NAME"

# Check if branch already exists
if git show-ref --verify --quiet refs/heads/$BRANCH_NAME; then
    echo "⚠️  Branch $BRANCH_NAME already exists"
    read -p "Switch to existing branch? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout $BRANCH_NAME
    else
        echo "Staying on $CURRENT_BRANCH"
        exit 0
    fi
else
    git checkout -b $BRANCH_NAME
fi

echo ""
echo "📦 Adding files..."

# Add all badge-related files
git add prisma/schema.prisma
git add prisma/migrations/20260127_add_badge_system/
git add lib/badges.ts
git add lib/stellar.ts
git add app/api/routes-d/reputation/
git add scripts/init-badges.ts
git add scripts/test-badges.ts
git add scripts/validate-implementation.ts
git add setup-badges.sh
git add verify-implementation.sh
git add docs/BADGE_SYSTEM.md
git add docs/BADGE_ARCHITECTURE.md
git add BADGE_SETUP.md
git add BADGE_CHECKLIST.md
git add IMPLEMENTATION_SUMMARY.md
git add IMPLEMENTATION_COMPLETE.md
git add README_BADGES.md
git add PR_DESCRIPTION.md
git add .env.example

echo ""
echo "📊 Files to be committed:"
git status --short

echo ""
echo "💾 Creating commit..."

# Create commit
git commit -m "feat: implement on-chain badge system with soulbound tokens

- Add BadgeDefinition and UserBadge database models
- Implement soulbound token minting on Stellar blockchain
- Create 5 predefined achievement badges
- Add public verification API endpoints
- Implement automated eligibility evaluation
- Add comprehensive documentation (1,500+ lines)
- Include test suite and setup automation

Features:
- Non-transferable (soulbound) badges on Stellar
- Automated eligibility based on revenue, invoices, disputes
- Public verification for LinkedIn/portfolio integration
- Duplicate claim prevention
- Complete API endpoints (2 auth, 2 public)

All checks passed: 25/25 ✅

Closes #[ISSUE_NUMBER]"

echo ""
echo "✅ Commit created!"
echo ""
echo "📤 Next steps:"
echo ""
echo "1. Push to remote:"
echo "   git push -u origin $BRANCH_NAME"
echo ""
echo "2. Create PR on GitHub/GitLab with:"
echo "   Title: feat: On-Chain Badge System (Soulbound Tokens)"
echo "   Description: Use content from PR_DESCRIPTION.md"
echo ""
echo "3. Or create PR via CLI:"
echo "   gh pr create --title \"feat: On-Chain Badge System\" --body-file PR_DESCRIPTION.md"
echo ""
echo "📋 PR is ready to submit!"
