import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    color: '#374151',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  companyInfo: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  periodText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    backgroundColor: '#f3f4f6',
    padding: 8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  rowLabel: {
    fontSize: 10,
    color: '#374151',
  },
  rowAmount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
  },
  subTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#9ca3af',
  },
  subTotalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
  },
  subTotalAmount: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
  },
  netProfitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#eff6ff',
    marginTop: 20,
    borderRadius: 4,
  },
  netProfitLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  netProfitAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  logo: {
    width: 100,
    height: 'auto',
    marginBottom: 10,
  }
})

interface FinancialStatementData {
  period: string
  generatedAt: string
  currency: string
  summary: {
    totalIncome: number
    platformFees: number
    withdrawalFees: number
    netProfit: number
  }
  topClients: Array<{ name: string; revenue: number }>
}

interface BrandingData {
  logoUrl?: string | null
  primaryColor?: string
  footerText?: string | null
}

export const FinancialStatementPDF = ({ data, branding }: { data: FinancialStatementData, branding?: BrandingData }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.currency,
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            {branding?.logoUrl ? (
              /* eslint-disable-next-line jsx-a11y/alt-text */
              <Image src={branding.logoUrl} style={styles.logo} />
            ) : (
                <Text style={styles.companyName}>LancePay</Text>
            )}
            <Text style={{ color: '#6b7280' }}>Financial Statement</Text>
          </View>
          <View>
            <Text style={styles.reportTitle}>Profit & Loss</Text>
            <Text style={styles.periodText}>{data.period}</Text>
          </View>
        </View>

        {/* Revenue Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Revenue</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Gross Revenue (Sales)</Text>
            <Text style={styles.rowAmount}>{formatCurrency(data.summary.totalIncome)}</Text>
          </View>
          <View style={styles.subTotalRow}>
            <Text style={styles.subTotalLabel}>Total Revenue</Text>
            <Text style={styles.subTotalAmount}>{formatCurrency(data.summary.totalIncome)}</Text>
          </View>
        </View>

        {/* Cost of Sales Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Cost of Sales (Fees)</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Platform & Network Fees</Text>
            <Text style={styles.rowAmount}>{formatCurrency(data.summary.platformFees)}</Text>
          </View>
          <View style={styles.subTotalRow}>
            <Text style={styles.subTotalLabel}>Total Cost of Sales</Text>
            <Text style={styles.subTotalAmount}>{formatCurrency(data.summary.platformFees)}</Text>
          </View>
        </View>

        {/* Gross Profit Calculation */}
        <View style={[styles.row, { marginTop: 10, borderBottomWidth: 0 }]}>
           <Text style={styles.subTotalLabel}>Gross Profit</Text>
           <Text style={styles.subTotalAmount}>
             {formatCurrency(data.summary.totalIncome - data.summary.platformFees)}
           </Text>
        </View>

        {/* Operating Expenses Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Operating Expenses</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Withdrawal Costs</Text>
            <Text style={styles.rowAmount}>{formatCurrency(data.summary.withdrawalFees)}</Text>
          </View>
          <View style={styles.subTotalRow}>
            <Text style={styles.subTotalLabel}>Total Expenses</Text>
            <Text style={styles.subTotalAmount}>{formatCurrency(data.summary.withdrawalFees)}</Text>
          </View>
        </View>

        {/* Net Profit */}
        <View style={styles.netProfitRow}>
          <Text style={styles.netProfitLabel}>NET PROFIT</Text>
          <Text style={styles.netProfitAmount}>{formatCurrency(data.summary.netProfit)}</Text>
        </View>

          {/* Top Clients Section - Optional */}
          {data.topClients.length > 0 && (
              <View style={[styles.section, { marginTop: 40 }]}>
                  <Text style={[styles.sectionHeader, { backgroundColor: 'transparent', paddingLeft: 0, color: '#4b5563' }]}>
                      Top Clients / Sources
                  </Text>
                  {data.topClients.map((client, index) => (
                      <View key={index} style={styles.row}>
                          <Text style={styles.rowLabel}>{client.name}</Text>
                          <Text style={styles.rowAmount}>{formatCurrency(client.revenue)}</Text>
                      </View>
                  ))}
              </View>
          )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This report was generated automatically by LancePay on {data.generatedAt}.</Text>
          <Text>For questions, please contact support.</Text>
           {branding?.footerText && (
            <Text style={{ marginTop: 4 }}>{branding.footerText}</Text>
          )}
        </View>
      </Page>
    </Document>
  )
}
