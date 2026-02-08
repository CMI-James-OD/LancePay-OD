import { z } from 'zod'

export const createEncryptedInvoiceSchema = z.object({
    amount: z.number().positive('Amount must be positive').max(100000, 'Amount exceeds maximum'),
    encryptedData: z.string().min(1, 'Encrypted data is required'),
    salt: z.string().min(16, 'Invalid salt'),
    clientEmail: z.string().email('Invalid email').optional(),
    dueDate: z
        .string()
        .optional()
        .refine(
            (val) => !val || !isNaN(new Date(val).getTime()),
            'Invalid date format'
        ),
})

export type CreateEncryptedInvoiceInput = z.infer<typeof createEncryptedInvoiceSchema>
