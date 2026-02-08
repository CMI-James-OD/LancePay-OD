# On-Chain Badges (Soulbound Tokens) API

## Overview

The On-Chain Badge system allows LancePay to issue permanent, verifiable credentials to freelancers as non-transferable NFTs (Soulbound Tokens) on the Stellar network. These badges represent achievements such as "Top 1% Earner", "Zero Dispute Champion", or "Verified Professional".

## Architecture

### Database Models

**BadgeDefinition**: Defines available badges and their criteria
- `name`: Badge display name
- `description`: Badge description
- `criteriaJson`: JSON object defining eligibility requirements
- `stellarAssetCode`: Unique asset code on Stellar (max 12 chars)
- `imageUrl`: Badge artwork URL (recommended: IPFS)
- `isActive`: Whether the badge can be claimed

**UserBadge**: Tracks issued badges
- `userId`: Recipient user ID
- `badgeId`: Reference to BadgeDefinition
- `stellarTxHash`: Stellar transaction hash of the minting
- `issuedAt`: Timestamp of badge issuance

### Badge Criteria Types

Badges can have various eligibility criteria:

```typescript
{
  type: "revenue",
  minRevenue: 100000  // $100k minimum
}

{
  type: "invoices",
  minInvoices: 10  // 10+ paid invoices
}

{
  type: "zero_disputes",
  minInvoices: 50,
  maxDisputes: 0
}

{
  type: "completion_rate",
  minInvoices: 25,
  minCompletionRate: 100  // 100% completion
}
```

## API Endpoints

### 1. Get User's Badge Status

**Endpoint**: `GET /api/routes-d/reputation/badges`

**Headers**: 
- `Authorization: Bearer <token>`

**Response**:
```json
{
  "badges": [
    {
      "id": "uuid",
      "name": "Top 1% Earner",
      "description": "Earned over $100,000 in total revenue",
      "stellarAssetCode": "TOP1PCT",
      "imageUrl": "https://...",
      "earned": false,
      "eligible": true,
      "reason": null
    },
    {
      "id": "uuid",
      "name": "Verified Professional",
      "description": "Completed 10+ invoices successfully",
      "stellarAssetCode": "VERIPRO",
      "imageUrl": "https://...",
      "earned": true,
      "eligible": true,
      "earnedAt": "2026-01-15T10:30:00Z",
      "stellarTxHash": "abc123..."
    }
  ]
}
```

### 2. Claim a Badge

**Endpoint**: `POST /api/routes-d/reputation/badges`

**Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "badgeId": "uuid-of-badge"
}
```

**Success Response** (201):
```json
{
  "message": "Badge claimed successfully",
  "badge": {
    "id": "uuid",
    "userId": "uuid",
    "badgeId": "uuid",
    "stellarTxHash": "abc123...",
    "issuedAt": "2026-01-27T12:00:00Z",
    "badge": {
      "name": "Top 1% Earner",
      "stellarAssetCode": "TOP1PCT"
    }
  },
  "txHash": "abc123..."
}
```

**Error Responses**:
- `403 Forbidden`: Not eligible
  ```json
  {
    "error": "Not eligible for this badge",
    "reason": "Requires $100000 total revenue. Current: $54000.00"
  }
  ```
- `409 Conflict`: Already claimed
  ```json
  {
    "error": "Badge already claimed"
  }
  ```

### 3. Verify Badge Ownership (Public)

**Endpoint**: `GET /api/routes-d/reputation/badges/verify?userId={userId}&badgeId={badgeId}`

**No authentication required** - This is a public verification endpoint.

**Response**:
```json
{
  "verified": true,
  "badge": {
    "id": "uuid",
    "name": "Top 1% Earner",
    "description": "Earned over $100,000",
    "imageUrl": "https://...",
    "assetCode": "TOP1PCT"
  },
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "issuedAt": "2026-01-15T10:30:00Z",
  "stellarTxHash": "abc123...",
  "walletAddress": "GXXXXXXX...",
  "issuerPublicKey": "GYYYYYYY..."
}
```

### 4. Get Public Badge Profile

**Endpoint**: `GET /api/routes-d/reputation/profile/{userId}`

**No authentication required**

**Response**:
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "memberSince": "2025-06-01T00:00:00Z"
  },
  "badges": [
    {
      "id": "uuid",
      "name": "Top 1% Earner",
      "description": "...",
      "imageUrl": "...",
      "assetCode": "TOP1PCT",
      "earnedAt": "2026-01-15T10:30:00Z",
      "txHash": "abc123...",
      "verificationUrl": "https://app.lancepay.io/api/..."
    }
  ],
  "stats": {
    "totalRevenue": 150000,
    "completedInvoices": 75,
    "disputes": 0,
    "badgeCount": 3
  }
}
```

## Stellar Implementation

### Soulbound Token Mechanics

Badges are implemented as **non-transferable Stellar assets** using these mechanisms:

1. **AUTH_REQUIRED Flag**: Issuer must authorize all trustlines
2. **Limited Trustline**: Recipient's trustline is limited to 1 badge
3. **No Authorization for Secondary Holders**: Issuer only authorizes the original recipient

The `issueSoulboundBadge()` function in `lib/stellar.ts`:
1. Creates a trustline from recipient to issuer for the badge asset (limit: 1)
2. Sends 1 unit of the badge from issuer to recipient
3. Does not authorize any future transfers

### Badge Issuer Setup

1. Generate a dedicated Stellar keypair for badge issuance:
   ```bash
   # Generate keypair (save the secret securely)
   node -e "const stellar = require('@stellar/stellar-sdk'); const pair = stellar.Keypair.random(); console.log('Public:', pair.publicKey()); console.log('Secret:', pair.secret());"
   ```

2. Fund the issuer account with XLM for transaction fees

3. Configure the issuer account with proper flags:
   ```bash
   npm run init-badges
   ```

4. Add to `.env`:
   ```
   BADGE_ISSUER_SECRET_KEY=SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

## Setup Instructions

### 1. Database Migration

Run the migration to create badge tables:

```bash
npx prisma migrate dev
```

### 2. Seed Badge Definitions

```bash
npm run init-badges
```

This will create 5 predefined badges:
- **Top 1% Earner** (TOP1PCT)
- **Zero Dispute Champion** (NODISPUTE)
- **Verified Professional** (VERIPRO)
- **Rising Star** (RISESTAR)
- **Trusted Freelancer** (TRUSTED)

### 3. Environment Variables

Add to your `.env`:

```env
# Badge issuer account (Stellar keypair)
BADGE_ISSUER_SECRET_KEY=SXXXXXXXXXXXXXx

# Optional: IPFS gateway for badge images
BADGE_IMAGE_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

### 4. Upload Badge Images

Store badge artwork on IPFS and update the `imageUrl` field:

```sql
UPDATE "BadgeDefinition" 
SET "imageUrl" = 'https://ipfs.io/ipfs/QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
WHERE "stellarAssetCode" = 'TOP1PCT';
```

## Testing Guide

### Test 1: Eligibility Check (Should Fail)

**Scenario**: User with $0 revenue tries to claim "Top 1% Earner" badge

```bash
curl -X POST https://lancepay.io/api/routes-d/reputation/badges \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"badgeId": "top-earner-badge-id"}'
```

**Expected**: `403 Forbidden` with reason

### Test 2: Successful Badge Claim

**Scenario**: Eligible user claims badge

1. Create test data (10+ paid invoices):
   ```sql
   -- Run in your DB to make user eligible for "Verified Professional"
   UPDATE "Invoice" SET "status" = 'paid' 
   WHERE "userId" = 'your-user-id' LIMIT 10;
   ```

2. Claim badge:
   ```bash
   curl -X POST https://lancepay.io/api/routes-d/reputation/badges \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"badgeId": "verified-pro-badge-id"}'
   ```

3. Verify on Stellar:
   - Check wallet on [Stellar Expert](https://stellar.expert/explorer/testnet/account/YOUR_WALLET_ADDRESS)
   - Should see 1.0000000 of the badge asset

### Test 3: Duplicate Claim (Should Fail)

**Scenario**: Try to claim same badge twice

```bash
# Run claim request again
curl -X POST https://lancepay.io/api/routes-d/reputation/badges \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"badgeId": "verified-pro-badge-id"}'
```

**Expected**: `409 Conflict` - "Badge already claimed"

### Test 4: Soulbound Verification

**Scenario**: Verify badge cannot be transferred

1. Get the badge asset details from Stellar Expert
2. Try to send to another account using Stellar Laboratory or SDK
3. Transaction should fail because:
   - Trustline limit is 1 (no room for incoming transfers for recipient)
   - Issuer hasn't authorized the new holder's trustline

### Test 5: Public Verification

**Scenario**: Verify badge publicly without authentication

```bash
curl "https://lancepay.io/api/routes-d/reputation/badges/verify?userId=USER_ID&badgeId=BADGE_ID"
```

**Expected**: JSON with `verified: true` and badge details

## Frontend Integration Example

```typescript
// Fetch user's badges
async function getUserBadges() {
  const response = await fetch('/api/routes-d/reputation/badges', {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return response.json();
}

// Claim a badge
async function claimBadge(badgeId: string) {
  const response = await fetch('/api/routes-d/reputation/badges', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ badgeId }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.reason || error.error);
  }
  
  return response.json();
}

// Display on user profile
function BadgeDisplay({ badge }) {
  return (
    <div className="badge-card">
      <img src={badge.imageUrl} alt={badge.name} />
      <h3>{badge.name}</h3>
      <p>{badge.description}</p>
      {badge.earned ? (
        <div>
          <span>✓ Earned</span>
          <a href={badge.verificationUrl}>Verify on Stellar</a>
        </div>
      ) : badge.eligible ? (
        <button onClick={() => claimBadge(badge.id)}>Claim Badge</button>
      ) : (
        <p>Not eligible: {badge.reason}</p>
      )}
    </div>
  );
}
```

## LinkedIn/Portfolio Integration

Users can share badge verification links:

```
https://lancepay.io/api/routes-d/reputation/badges/verify?userId=xxx&badgeId=yyy
```

Or embed badges with public profile:

```
https://lancepay.io/reputation/profile/USER_ID
```

## Security Considerations

1. **Badge Issuer Key**: Store `BADGE_ISSUER_SECRET_KEY` securely (use secrets manager in production)
2. **Criteria Validation**: All eligibility checks run server-side
3. **Rate Limiting**: Consider adding rate limits to badge claiming endpoints
4. **Audit Trail**: All badge issuances are recorded with Stellar transaction hashes
5. **Immutability**: Once minted, badges cannot be revoked (by design)

## Advanced: Custom Badge Criteria

To add custom badge types, extend `lib/badges.ts`:

```typescript
// Add new criteria type
export interface CustomCriteria extends BadgeCriteria {
  type: "custom";
  customLogic: (userId: string) => Promise<boolean>;
}

// Add evaluation logic
case "custom":
  return await criteria.customLogic(userId);
```

## Monitoring

Monitor badge minting:

```sql
-- Recent badge claims
SELECT u.email, bd.name, ub."issuedAt", ub."stellarTxHash"
FROM "UserBadge" ub
JOIN "User" u ON ub."userId" = u.id
JOIN "BadgeDefinition" bd ON ub."badgeId" = bd.id
ORDER BY ub."issuedAt" DESC
LIMIT 10;

-- Badge distribution
SELECT bd.name, COUNT(*) as holders
FROM "UserBadge" ub
JOIN "BadgeDefinition" bd ON ub."badgeId" = bd.id
GROUP BY bd.name
ORDER BY holders DESC;
```

## Troubleshooting

**Badge minting fails**: 
- Check issuer account has XLM for fees
- Verify `BADGE_ISSUER_SECRET_KEY` is correct
- Ensure user has a wallet

**Badge not showing in wallet**:
- Check Stellar transaction on block explorer
- Verify asset code matches
- Confirm trustline was established

**Eligibility check errors**:
- Review database queries in `lib/badges.ts`
- Check user's transaction/invoice data
- Verify criteria JSON in BadgeDefinition

## Future Enhancements

- [ ] Badge metadata on IPFS (SEP-0001)
- [ ] Badge expiration/renewal mechanics
- [ ] Tiered badges (Bronze/Silver/Gold)
- [ ] Badge marketplace for premium achievements
- [ ] Integration with Stellar anchor services
- [ ] Batch badge issuance for events/milestones
