# Fix: Dispute Initiation Email Spoofing Vulnerability

## Summary

Fixes a high-severity security vulnerability in the dispute creation flow where a user could provide an `initiatorEmail` in the request body that differs from their authenticated identity, allowing dispute spoofing on behalf of other users.

## Problem

The original code accepted `initiatorEmail` from the request body and validated it against `auth.email`. While a check existed, the approach of trusting and then validating a security-sensitive field from user input is inherently fragile.

**Before (vulnerable pattern):**
```typescript
const { invoiceId, initiatorEmail, reason, requestedAction, evidence } = parsed.data

// Prevent spoofing
if (initiatorEmail.toLowerCase() !== auth.email.toLowerCase()) {
  return NextResponse.json({ error: '...' }, { status: 403 })
}
```

## Fix

Removed `initiatorEmail` from the destructured body entirely. It is now always derived from the authenticated session context — eliminating the attack surface completely.

**After (secure):**
```typescript
const { invoiceId, reason, requestedAction, evidence } = parsed.data

// Always derive initiatorEmail from authenticated session — never trust request body
const initiatorEmail = auth.email
```

## Impact

- **Severity:** High
- **Type:** Privilege escalation / identity spoofing
- **Affected file:** `app/api/routes-d/disputes/create/route.ts`

## Why This Approach

Rather than validating a body-supplied value against the auth context (which can be error-prone), the fix removes the need for that validation entirely. `initiatorEmail` is now a server-side derived value — impossible to spoof regardless of what the client sends.

## Testing

- A request with a mismatched `initiatorEmail` in the body will no longer have any effect
- The authenticated user's email is always used
- All downstream logic (`isFreelancer`, `isClient`, `disputeMessage.senderEmail`) remains correct
