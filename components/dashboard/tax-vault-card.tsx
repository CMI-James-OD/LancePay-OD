'use client'

import { ShieldCheck, Settings } from 'lucide-react'
import Link from 'next/link'

interface TaxVaultCardProps {
  taxPercentage: number
  taxVaultBalance: number
  totalBalance: number
  isLoading: boolean
}

export function TaxVaultCard({
  taxPercentage,
  taxVaultBalance,
  totalBalance,
  isLoading,
}: TaxVaultCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-brand-border p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
        <div className="flex gap-4">
          <div className="flex-1 h-20 bg-gray-200 rounded-xl" />
          <div className="flex-1 h-20 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  if (taxPercentage === 0) return null

  const safeToSpend = Math.max(0, totalBalance - taxVaultBalance)

  return (
    <div className="bg-white rounded-2xl border border-brand-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-gray" />
          <h3 className="text-lg font-semibold text-brand-black">Tax Vault</h3>
          <span className="text-xs bg-brand-light text-brand-gray px-2 py-0.5 rounded-full">
            {taxPercentage}% per payout
          </span>
        </div>
        <Link
          href="/dashboard/settings"
          className="text-xs text-brand-gray hover:text-brand-black flex items-center gap-1"
        >
          <Settings className="w-3.5 h-3.5" />
          Configure
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Safe to Spend */}
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-xs text-green-700 font-medium mb-1">Safe to Spend</p>
          <p className="text-xl font-bold text-green-800">
            ${safeToSpend.toFixed(2)}
          </p>
          <p className="text-xs text-green-600 mt-0.5">USDC available</p>
        </div>

        {/* Tax Vault */}
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-xs text-amber-700 font-medium mb-1">Tax Vault</p>
          <p className="text-xl font-bold text-amber-800">
            ${taxVaultBalance.toFixed(2)}
          </p>
          <p className="text-xs text-amber-600 mt-0.5">Set aside for taxes</p>
        </div>
      </div>

      {/* Visual split bar */}
      {totalBalance > 0 && (
        <div className="mt-4">
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden flex">
            <div
              className="h-full bg-green-400 transition-all duration-500"
              style={{ width: `${(safeToSpend / totalBalance) * 100}%` }}
            />
            <div
              className="h-full bg-amber-400 transition-all duration-500"
              style={{ width: `${(taxVaultBalance / totalBalance) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-green-600">Spendable</span>
            <span className="text-xs text-amber-600">Tax Vault</span>
          </div>
        </div>
      )}
    </div>
  )
}
