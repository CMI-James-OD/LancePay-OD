# Fix: KYC Submission Stellar Address Spoofing Vulnerability

## Summary

Fixes a high-severity security vulnerability in the KYC submission endpoint where an attacker could submit KYC data for another user's Stellar address by supplying an arbitrary `x-stellar-address` header.

## Problem

The original route trusted the `x-stellar-address` header directly from the request without verifying it against the authenticated user's actual wallet in the database.

**Before (vulnerable):**
```typescript
const stellarAddress = req.headers.get("x-stellar-address"); // untrusted!
const authToken = req.headers.get("x-sep10-token");

if (!stellarAddress || !authToken) { ... }

const result = await submitKYCData(stellarAddress, authToken, kycData);
```

## Fix

Added proper session authentication via `getAuthContext`. The `stellarAddress` is now always looked up from the authenticated user's wallet in the database — the header is no longer used for identity.

**After (secure):**
```typescript
const auth = await getAuthContext(req);
if ("error" in auth) return 401;

// Derive stellarAddress from authenticated user's wallet — never trust headers
const wallet = await prisma.wallet.findUnique({
  where: { userId: auth.user.id },
  select: { stellarAddress: true },
});

const stellarAddress = wallet.stellarAddress;
```

## Impact

- **Severity:** High
- **Type:** Identity spoofing / unauthorized KYC submission
- **Affected file:** `app/api/routes-d/kyc/submit/route.ts`

## Why This Approach

Consistent with the dispute spoofing fix — security-sensitive identity values must never be derived from user-controlled input. The wallet address is a server-side fact retrieved from the database after authentication, making spoofing impossible.

## Changes

- Added `getAuthContext` for proper session authentication
- Added `prisma.wallet` lookup to retrieve the authenticated user's Stellar address
- Removed reliance on `x-stellar-address` header for identity
- Returns `401` if unauthenticated, `404` if no wallet found
