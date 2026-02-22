const DEFAULT_PLATFORM_FEE_RATE = 0.005 // 0.5%
const DEFAULT_WITHDRAWAL_FEE_RATE = 0.005 // 0.5%

function parseFeeRate(value: string | undefined, fallback: number): number {
  if (!value) return fallback

  const parsed = Number.parseFloat(value)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback

  return parsed
}

/**
 * Centralized report fee rates.
 *
 * These defaults preserve current behavior and can be overridden at runtime via env vars.
 */
export const PLATFORM_FEE_RATE = parseFeeRate(process.env.REPORT_PLATFORM_FEE_RATE, DEFAULT_PLATFORM_FEE_RATE)
export const WITHDRAWAL_FEE_RATE = parseFeeRate(process.env.REPORT_WITHDRAWAL_FEE_RATE, DEFAULT_WITHDRAWAL_FEE_RATE)
