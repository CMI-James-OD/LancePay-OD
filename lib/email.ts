import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder')

interface PaymentEmailParams {
  to: string
  freelancerName: string
  clientName: string
  invoiceNumber: string
  amount: number
  currency: string
}

export async function sendPaymentReceivedEmail(params: PaymentEmailParams) {
  const { to, freelancerName, clientName, invoiceNumber, amount, currency } = params

  try {
    const { error } = await resend.emails.send({
      from: 'LancePay <notifications@lancepay.app>',
      to: [to],
      subject: `💰 Payment Received - ${invoiceNumber}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #111;">Hey ${freelancerName}! 🎉</h2>
          <p>You received a payment for invoice <strong>${invoiceNumber}</strong>.</p>
          <div style="background: #10b981; color: white; padding: 24px; border-radius: 12px; text-align: center; margin: 20px 0;">
            <div style="font-size: 32px; font-weight: bold;">$${amount.toFixed(2)}</div>
            <div>${currency}</div>
          </div>
          <p style="color: #666;">From: ${clientName}</p>
          <p style="color: #666; font-size: 12px;">LancePay - Get paid globally, withdraw locally</p>
        </div>
      `,
    })

    if (error) console.error('Email error:', error)
    return { success: !error }
  } catch (error) {
    console.error('Email send failed:', error)
    return { success: false }
  }
}


export async function sendEmail(params: { to: string; subject: string; template?: string; html?: string }) {
  const { to, subject, template, html } = params
  const htmlContent = html || template || ''

  try {
    const { error } = await resend.emails.send({
      from: 'LancePay <notifications@lancepay.app>',
      to: [to],
      subject,
      html: htmlContent,
    })

    if (error) console.error('Email error:', error)
    return { success: !error }
  } catch (error) {
    console.error('Email send failed:', error)
    return { success: false }
  }
}

// Invoice created email
export async function sendInvoiceCreatedEmail(params: {
  to: string
  clientName?: string
  freelancerName?: string
  invoiceNumber: string
  description?: string
  amount: number
  currency: string
  paymentLink: string
  dueDate?: Date | null
}) {
  const dueDateStr = params.dueDate ? new Date(params.dueDate).toLocaleDateString() : null
  return sendEmail({
    to: params.to,
    subject: `Invoice ${params.invoiceNumber} from LancePay`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2>Invoice ${params.invoiceNumber}</h2>
        <p>Hi ${params.clientName || 'there'},</p>
        <p>You have received an invoice for <strong>$${params.amount.toFixed(2)} ${params.currency}</strong>.</p>
        ${params.description ? `<p><strong>Description:</strong> ${params.description}</p>` : ''}
        ${dueDateStr ? `<p><strong>Due Date:</strong> ${dueDateStr}</p>` : ''}
        <a href="${params.paymentLink}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Pay Now</a>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">LancePay - Get paid globally, withdraw locally</p>
      </div>
    `,
  })
}


// Escrow released email
export async function sendEscrowReleasedEmail(params: {
  to: string
  freelancerName?: string
  invoiceNumber: string
  amount?: number
  clientEmail?: string
  notes?: string
}) {
  return sendEmail({
    to: params.to,
    subject: `✅ Escrow Released - ${params.invoiceNumber}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2>Escrow Released! 🎉</h2>
        <p>Hi ${params.freelancerName || 'there'},</p>
        <p>The escrow for invoice <strong>${params.invoiceNumber}</strong> has been released.</p>
        ${params.amount ? `
        <div style="background: #10b981; color: white; padding: 24px; border-radius: 12px; text-align: center; margin: 20px 0;">
          <div style="font-size: 32px; font-weight: bold;">$${params.amount.toFixed(2)}</div>
          <div>USDC</div>
        </div>` : ''}
        ${params.clientEmail ? `<p><strong>Released by:</strong> ${params.clientEmail}</p>` : ''}
        ${params.notes ? `<p><strong>Notes:</strong> ${params.notes}</p>` : ''}
        <p style="color: #666; font-size: 12px; margin-top: 20px;">LancePay - Get paid globally, withdraw locally</p>
      </div>
    `,
  })
}


// Escrow disputed email
export async function sendEscrowDisputedEmail(params: {
  to: string
  name?: string
  invoiceNumber: string
  reason: string
  clientEmail?: string
  requestedAction?: string
}) {
  return sendEmail({
    to: params.to,
    subject: `⚠️ Escrow Disputed - ${params.invoiceNumber}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2>Escrow Dispute Filed</h2>
        <p>Hi ${params.name || 'there'},</p>
        <p>A dispute has been filed for invoice <strong>${params.invoiceNumber}</strong>.</p>
        ${params.clientEmail ? `<p><strong>Client:</strong> ${params.clientEmail}</p>` : ''}
        <p><strong>Reason:</strong> ${params.reason}</p>
        ${params.requestedAction ? `<p><strong>Requested action:</strong> ${params.requestedAction}</p>` : ''}
        <p style="color: #666; font-size: 12px;">LancePay - Get paid globally, withdraw locally</p>
      </div>
    `,
  })
}

// Dispute created email
export async function sendDisputeCreatedEmail(params: {
  to: string
  name: string
  invoiceNumber: string
  reason: string
}) {
  return sendEscrowDisputedEmail(params)
}

export async function sendDisputeResolvedEmail(params: {
  to: string
  name?: string
  invoiceNumber: string
  resolution: string
  action?: string
  refundAmount?: number
  currency?: string
}) {
  const refundText = params.action === 'refund_partial' && params.refundAmount
    ? `<p><strong>Refund Amount:</strong> $${params.refundAmount.toFixed(2)} ${params.currency || 'USD'}</p>`
    : ''
  
  return sendEmail({
    to: params.to,
    subject: `✅ Dispute Resolved - ${params.invoiceNumber}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2>Dispute Resolved</h2>
        <p>Hi ${params.name || 'there'},</p>
        <p>The dispute for invoice <strong>${params.invoiceNumber}</strong> has been resolved.</p>
        <p><strong>Resolution:</strong> ${params.resolution}</p>
        ${params.action ? `<p><strong>Action:</strong> ${params.action}</p>` : ''}
        ${refundText}
        <p style="color: #666; font-size: 12px;">LancePay - Get paid globally, withdraw locally</p>
      </div>
    `,
  })
}

// Dispute responded email
export async function sendDisputeRespondedEmail(params: {
  to: string
  name: string
  invoiceNumber: string
  response: string
}) {
  return sendEmail({
    to: params.to,
    subject: `💬 Dispute Response - ${params.invoiceNumber}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2>Dispute Response</h2>
        <p>Hi ${params.name},</p>
        <p>A response has been made to the dispute for invoice <strong>${params.invoiceNumber}</strong>.</p>
        <p><strong>Response:</strong> ${params.response}</p>
        <p style="color: #666; font-size: 12px;">LancePay - Get paid globally, withdraw locally</p>
      </div>
    `,
  })
}

// Dispute initiated email
export async function sendDisputeInitiatedEmail(params: {
  to: string
  name?: string
  invoiceNumber: string
  reason: string
  initiatedBy?: string
  requestedAction?: string
}) {
  return sendEmail({
    to: params.to,
    subject: `⚠️ Dispute Filed - ${params.invoiceNumber}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2>Dispute Filed</h2>
        <p>Hi ${params.name || 'there'},</p>
        <p>A dispute has been filed for invoice <strong>${params.invoiceNumber}</strong>.</p>
        ${params.initiatedBy ? `<p><strong>Filed by:</strong> ${params.initiatedBy}</p>` : ''}
        <p><strong>Reason:</strong> ${params.reason}</p>
        ${params.requestedAction ? `<p><strong>Requested action:</strong> ${params.requestedAction}</p>` : ''}
        <p style="color: #666; font-size: 12px;">LancePay - Get paid globally, withdraw locally</p>
      </div>
    `,
  })
}

// Dispute message email
export async function sendDisputeMessageEmail(params: {
  to: string
  name?: string
  invoiceNumber: string
  message: string
  senderType?: string
}) {
  return sendEmail({
    to: params.to,
    subject: `💬 New Dispute Message - ${params.invoiceNumber}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2>New Dispute Message</h2>
        <p>Hi ${params.name || 'there'},</p>
        <p>A new message has been posted to the dispute for invoice <strong>${params.invoiceNumber}</strong>.</p>
        ${params.senderType ? `<p><strong>From:</strong> ${params.senderType}</p>` : ''}
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;">${params.message}</p>
        </div>
        <p style="color: #666; font-size: 12px;">LancePay - Get paid globally, withdraw locally</p>
      </div>
    `,
  })
}
