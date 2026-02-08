# Badge System - Quick Start Guide

## 🚀 Setup Steps

### 1. Install Dependencies
Already installed in your project:
- `@stellar/stellar-sdk`
- `@prisma/client`

### 2. Run Database Migration
```bash
cd /home/jojo/Documents/Blockchain\ project/Lancepay/LancePay
npx prisma migrate dev --name add_badge_system
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Create Badge Issuer Account

Generate a new Stellar keypair for badge issuance:

```bash
node -e "const stellar = require('@stellar/stellar-sdk'); const pair = stellar.Keypair.random(); console.log('Public Key:', pair.publicKey()); console.log('Secret Key:', pair.secret());"
```

**IMPORTANT**: Save both keys securely!

### 5. Fund the Issuer Account

For **Testnet**:
1. Visit: https://laboratory.stellar.org/#account-creator?network=test
2. Paste your public key and click "Get test network lumens"

For **Mainnet**:
- Send at least 2 XLM to the issuer address

### 6. Add Environment Variable

Add to `.env`:
```env
# Badge Issuer (Stellar keypair for minting badges)
BADGE_ISSUER_SECRET_KEY=SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 7. Initialize Badge System

```bash
# Seed predefined badges and configure issuer
npx tsx scripts/init-badges.ts
```

This will create 5 badges:
- ✨ Top 1% Earner (TOP1PCT)
- 🏆 Zero Dispute Champion (NODISPUTE)  
- ✅ Verified Professional (VERIPRO)
- ⭐ Rising Star (RISESTAR)
- 🤝 Trusted Freelancer (TRUSTED)

### 8. Test the System

```bash
# Run test suite
npx tsx scripts/test-badges.ts
```

Or test via API:

```bash
# Get badges (requires auth)
curl -X GET http://localhost:3000/api/routes-d/reputation/badges \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"

# Claim a badge
curl -X POST http://localhost:3000/api/routes-d/reputation/badges \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"badgeId": "BADGE_ID"}'

# Verify badge (public, no auth)
curl http://localhost:3000/api/routes-d/reputation/badges/verify?userId=USER_ID&badgeId=BADGE_ID
```

## 📁 Files Created

### Database
- `prisma/schema.prisma` - Added BadgeDefinition and UserBadge models
- `prisma/migrations/20260127_add_badge_system/migration.sql` - Migration SQL

### Backend Logic
- `lib/badges.ts` - Badge criteria evaluation and eligibility checking
- `lib/stellar.ts` - Added soulbound token functions:
  - `issueSoulboundBadge()` - Mint and send non-transferable badges
  - `configureBadgeIssuer()` - Set up issuer account flags
  - `hasBadge()` - Verify badge ownership on-chain

### API Routes (in `app/api/routes-d/reputation/`)
- `badges/route.ts` - GET badges, POST claim badge
- `badges/verify/route.ts` - Public badge verification
- `profile/[userId]/route.ts` - Public badge profile

### Scripts
- `scripts/init-badges.ts` - Initialize badge system
- `scripts/test-badges.ts` - Test badge functionality

### Documentation
- `docs/BADGE_SYSTEM.md` - Complete API documentation

## 🎯 API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/routes-d/reputation/badges` | GET | ✅ | Get all badges with eligibility |
| `/api/routes-d/reputation/badges` | POST | ✅ | Claim a badge |
| `/api/routes-d/reputation/badges/verify` | GET | ❌ | Verify badge ownership (public) |
| `/api/routes-d/reputation/profile/[userId]` | GET | ❌ | Get user's badge profile (public) |

## 🧪 Testing Checklist

- [ ] Database migration successful
- [ ] Badge definitions seeded
- [ ] Issuer account configured
- [ ] User can view badges with eligibility
- [ ] Eligible user can claim badge
- [ ] Stellar transaction recorded
- [ ] Badge visible in wallet on Stellar Expert
- [ ] Ineligible user gets 403 Forbidden
- [ ] Duplicate claim returns 409 Conflict
- [ ] Badge cannot be transferred (soulbound)
- [ ] Public verification works
- [ ] Public profile displays badges

## 🔐 Security Notes

1. **Never commit** `BADGE_ISSUER_SECRET_KEY` to version control
2. Store badge issuer keys in a secure secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)
3. Badge issuance is **irreversible** - verify criteria carefully
4. Consider rate limiting on badge endpoints
5. Monitor badge minting for abuse

## 🌟 Badge Criteria

Modify `/lib/badges.ts` to customize:

```typescript
{
  name: "Your Badge",
  stellarAssetCode: "YOURBADGE",
  criteriaJson: {
    type: "revenue",      // or "invoices", "zero_disputes", "completion_rate"
    minRevenue: 50000,    // $50k
  }
}
```

## 📊 Monitoring Queries

```sql
-- Recent badge claims
SELECT u.email, bd.name, ub."issuedAt", ub."stellarTxHash"
FROM "UserBadge" ub
JOIN "User" u ON ub."userId" = u.id
JOIN "BadgeDefinition" bd ON ub."badgeId" = bd.id
ORDER BY ub."issuedAt" DESC
LIMIT 20;

-- Most popular badges
SELECT bd.name, COUNT(*) as holders
FROM "UserBadge" ub
JOIN "BadgeDefinition" bd ON ub."badgeId" = bd.id
GROUP BY bd.name
ORDER BY holders DESC;

-- Users eligible for badges they haven't claimed
-- (requires custom logic based on criteria)
```

## 🎨 Frontend Integration

Example React component:

```tsx
import { useState, useEffect } from 'react';

export function BadgeGallery() {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    fetch('/api/routes-d/reputation/badges', {
      headers: { Authorization: `Bearer ${authToken}` }
    })
      .then(res => res.json())
      .then(data => setBadges(data.badges));
  }, []);

  const claimBadge = async (badgeId) => {
    const res = await fetch('/api/routes-d/reputation/badges', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ badgeId })
    });
    
    if (res.ok) {
      alert('Badge claimed! Check your Stellar wallet.');
      // Refresh badges
    }
  };

  return (
    <div className="badge-grid">
      {badges.map(badge => (
        <div key={badge.id} className="badge-card">
          <img src={badge.imageUrl} alt={badge.name} />
          <h3>{badge.name}</h3>
          <p>{badge.description}</p>
          
          {badge.earned ? (
            <span className="earned">✓ Earned</span>
          ) : badge.eligible ? (
            <button onClick={() => claimBadge(badge.id)}>
              Claim Badge
            </button>
          ) : (
            <p className="ineligible">{badge.reason}</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

## 🔗 Useful Links

- **Stellar Laboratory**: https://laboratory.stellar.org
- **Stellar Expert** (Testnet): https://stellar.expert/explorer/testnet
- **Stellar Expert** (Mainnet): https://stellar.expert/explorer/public
- **Full Documentation**: See `docs/BADGE_SYSTEM.md`

## 🐛 Troubleshooting

**Migration fails**:
```bash
npx prisma migrate reset
npx prisma migrate dev
```

**Badge minting fails**:
- Check issuer has XLM balance
- Verify secret key is correct
- Ensure user has a wallet

**Badge not in wallet**:
- Check transaction on Stellar Expert
- Verify asset code matches
- Confirm network (testnet vs mainnet)

## 📞 Support

For issues or questions:
1. Check `docs/BADGE_SYSTEM.md`
2. Review error logs
3. Test on Stellar testnet first
4. Verify environment variables

---

**Next Steps**: Update badge image URLs to IPFS for permanent storage
