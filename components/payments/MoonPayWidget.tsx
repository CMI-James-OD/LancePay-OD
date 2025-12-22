'use client'

import { useCallback } from 'react'

interface MoonPayWidgetProps {
  walletAddress: string
  amount: number
  currencyCode?: string
  onSuccess?: () => void
  onClose?: () => void
}

export function useMoonPayWidget() {
  const openWidget = useCallback(async ({
    walletAddress,
    amount,
    currencyCode = 'usdc_base',
    onSuccess,
    onClose
  }: MoonPayWidgetProps) => {
    // Dynamically import MoonPay SDK (client-side only)
    const { loadMoonPay } = await import('@moonpay/moonpay-js')
    
    const moonPay = await loadMoonPay()
    if (!moonPay) {
      throw new Error('Failed to load MoonPay SDK')
    }
    
    // Build the MoonPay URL with parameters
    const apiKey = process.env.NEXT_PUBLIC_MOONPAY_API_KEY
    const baseUrl = 'https://buy-sandbox.moonpay.com' // Use 'https://buy.moonpay.com' for production
    
    const params = new URLSearchParams({
      apiKey: apiKey || '',
      currencyCode: currencyCode,
      baseCurrencyCode: 'usd',
      baseCurrencyAmount: String(amount),
      walletAddress: walletAddress,
      theme: 'dark',
    })
    
    const moonPayUrl = `${baseUrl}?${params.toString()}`
    
    // Open MoonPay in a popup window
    const popup = window.open(
      moonPayUrl,
      'MoonPay',
      'width=500,height=700,scrollbars=yes,resizable=yes'
    )
    
    // Poll to check if popup is closed
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed)
        onClose?.()
      }
    }, 500)
    
    return { popup }
  }, [])

  return { openWidget }
}
