'use client'

import { useState, useEffect, use } from 'react'
import { CheckCircle, XCircle, Loader2, CreditCard, Wallet, ShieldAlert, Lock } from 'lucide-react'
import { useMoonPayWidget } from '@/components/payments/MoonPayWidget'
import { decryptInvoiceData, extractKeyFromHash } from '@/lib/client-crypto'

interface EncryptedInvoiceData {
    invoiceNumber: string
    amount: number
    currency: string
    status: string
    dueDate: string | null
    paidAt: string | null
    encryptedPayload: string
    decryptionSalt: string
    freelancerName: string
    walletAddress: string | null
}

interface DecryptedContent {
    clientName?: string
    description?: string
    items?: Array<{ name: string; amount: number }>
    notes?: string
}

type PageStatus = 'loading' | 'decrypting' | 'ready' | 'paying' | 'success' | 'error' | 'decrypt-failed'

export default function ConfidentialPaymentPage({ params }: { params: Promise<{ invoiceId: string }> }) {
    const { invoiceId } = use(params)
    const [invoiceData, setInvoiceData] = useState<EncryptedInvoiceData | null>(null)
    const [decryptedContent, setDecryptedContent] = useState<DecryptedContent | null>(null)
    const [status, setStatus] = useState<PageStatus>('loading')
    const [error, setError] = useState('')
    const { openWidget } = useMoonPayWidget()

    useEffect(() => {
        async function loadAndDecrypt() {
            try {
                // Fetch encrypted invoice data
                const res = await fetch(`/api/routes-d/privacy/encrypted-invoice/${invoiceId}`)
                if (!res.ok) {
                    throw new Error('Invoice not found')
                }

                const data: EncryptedInvoiceData = await res.json()
                setInvoiceData(data)

                // Check if already paid
                if (data.status === 'paid') {
                    setStatus('success')
                    return
                }

                // Extract key from URL hash
                setStatus('decrypting')
                const key = extractKeyFromHash()

                if (!key) {
                    setStatus('decrypt-failed')
                    setError('No decryption key provided. Please use the complete payment link.')
                    return
                }

                if (!data.encryptedPayload || !data.decryptionSalt) {
                    setStatus('error')
                    setError('Invalid invoice data')
                    return
                }

                // Decrypt the payload
                const decrypted = await decryptInvoiceData(
                    data.encryptedPayload,
                    data.decryptionSalt,
                    key
                )

                setDecryptedContent(decrypted as DecryptedContent)
                setStatus('ready')
            } catch (err) {
                if (err instanceof Error && err.message.includes('Decryption failed')) {
                    setStatus('decrypt-failed')
                    setError('Invalid decryption key. Please check your payment link.')
                } else {
                    setStatus('error')
                    setError(err instanceof Error ? err.message : 'Failed to load invoice')
                }
            }
        }

        loadAndDecrypt()
    }, [invoiceId])

    const handlePay = async () => {
        if (!invoiceData?.walletAddress) {
            setStatus('error')
            setError('Freelancer wallet not configured')
            return
        }

        setStatus('paying')

        try {
            await openWidget({
                walletAddress: invoiceData.walletAddress,
                amount: invoiceData.amount,
                currencyCode: 'usdc_base',
                invoiceId: invoiceId,
            })
            setStatus('ready')
        } catch {
            setStatus('error')
            setError('Payment failed. Please try again.')
        }
    }

    // Loading state
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    // Decryption failed state
    if (status === 'decrypt-failed') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Decryption Failed</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <p className="text-sm text-gray-500">
                        This is a confidential invoice. You need the complete payment link
                        including the secret key to view its contents.
                    </p>
                </div>
            </div>
        )
    }

    // Error state
    if (status === 'error') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        )
    }

    // Success state
    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                    <p className="text-gray-600 mb-4">
                        Thank you for your payment of ${invoiceData?.amount?.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">Invoice #{invoiceId}</p>
                </div>
            </div>
        )
    }

    // Decrypting state
    if (status === 'decrypting') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Decrypting Invoice...</h1>
                    <p className="text-gray-600">Securely loading your payment details</p>
                </div>
            </div>
        )
    }

    // Ready state - show decrypted invoice
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Confidential Payment</h1>
                    <p className="text-gray-600">from {invoiceData?.freelancerName}</p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                        <Lock className="w-3 h-3" />
                        End-to-End Encrypted
                    </div>
                </div>

                <div className="border-t border-b border-gray-200 py-4 mb-6">
                    {decryptedContent?.clientName && (
                        <p className="text-sm text-gray-500 mb-1">
                            To: {decryptedContent.clientName}
                        </p>
                    )}

                    <p className="text-gray-700 mb-3">
                        {decryptedContent?.description || 'Confidential invoice'}
                    </p>

                    {decryptedContent?.items && decryptedContent.items.length > 0 && (
                        <div className="space-y-2 mb-4">
                            {decryptedContent.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{item.name}</span>
                                    <span className="text-gray-900 font-medium">${item.amount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-gray-500">Total</span>
                        <span className="text-3xl font-bold text-gray-900">
                            ${invoiceData?.amount?.toFixed(2)}
                        </span>
                    </div>

                    {invoiceData?.dueDate && (
                        <p className="text-sm text-gray-500 mt-2">
                            Due: {new Date(invoiceData.dueDate).toLocaleDateString()}
                        </p>
                    )}

                    {decryptedContent?.notes && (
                        <p className="text-sm text-gray-500 mt-3 italic">
                            {decryptedContent.notes}
                        </p>
                    )}
                </div>

                <p className="text-xs text-gray-500 text-center mb-4">Invoice #{invoiceId}</p>

                <button
                    onClick={handlePay}
                    disabled={status === 'paying'}
                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {status === 'paying' ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Opening payment...
                        </>
                    ) : (
                        <>
                            <CreditCard className="w-5 h-5" />
                            Pay ${invoiceData?.amount?.toFixed(2)}
                        </>
                    )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Wallet className="w-4 h-4" />
                    <span>Powered by MoonPay • Secure payment</span>
                </div>
            </div>
        </div>
    )
}
