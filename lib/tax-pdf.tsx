import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  brand: { fontSize: 18, fontWeight: 700 },
  title: { fontSize: 18, fontWeight: 700, textAlign: "right" },
  sub: { fontSize: 10, color: "#6b7280", marginTop: 2 },
  section: { marginTop: 14 },
  sectionTitle: {
    fontSize: 10,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: { color: "#374151" },
  value: { fontWeight: 700 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 6,
  },
  th: { fontSize: 9, color: "#6b7280" },
  tr: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  td: { fontSize: 10 },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#9ca3af",
  },
});

export interface TaxAnnualSummary {
  totalIncome: number;
  totalFees: number;
  netIncome: number;
  invoiceCount: number;
  clientCount: number;
}

export interface TaxAnnualReport {
  year: number;
  freelancer: { name: string; email: string };
  summary: TaxAnnualSummary;
  monthlyBreakdown: Array<{ month: string; income: number; invoices: number }>;
  clientBreakdown: Array<{
    clientEmail: string;
    totalPaid: number;
    invoiceCount: number;
  }>;
}

export function TaxReportPDF({ report }: { report: TaxAnnualReport }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>LancePay</Text>
            <Text style={styles.sub}>Annual Tax Report</Text>
          </View>
          <View>
            <Text style={styles.title}>{report.year}</Text>
            <Text style={styles.sub}>{report.freelancer.email}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total income</Text>
            <Text style={styles.value}>
              ${report.summary.totalIncome.toFixed(2)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total fees</Text>
            <Text style={styles.value}>
              ${report.summary.totalFees.toFixed(2)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Net income</Text>
            <Text style={styles.value}>
              ${report.summary.netIncome.toFixed(2)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Invoices</Text>
            <Text style={styles.value}>{report.summary.invoiceCount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Clients</Text>
            <Text style={styles.value}>{report.summary.clientCount}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly breakdown</Text>
          <View style={styles.tableHeader}>
            <View style={{ flex: 2 }}>
              <Text style={styles.th}>Month</Text>
            </View>
            <View style={{ flex: 2, textAlign: "right" }}>
              <Text style={styles.th}>Income</Text>
            </View>
            <View style={{ flex: 1, textAlign: "right" }}>
              <Text style={styles.th}>Invoices</Text>
            </View>
          </View>
          {report.monthlyBreakdown.slice(0, 12).map((m) => (
            <View key={m.month} style={styles.tr}>
              <View style={{ flex: 2 }}>
                <Text style={styles.td}>{m.month}</Text>
              </View>
              <View style={{ flex: 2, textAlign: "right" }}>
                <Text style={styles.td}>${m.income.toFixed(2)}</Text>
              </View>
              <View style={{ flex: 1, textAlign: "right" }}>
                <Text style={styles.td}>{m.invoices}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top clients</Text>
          <View style={styles.tableHeader}>
            <View style={{ flex: 3 }}>
              <Text style={styles.th}>Client</Text>
            </View>
            <View style={{ flex: 2, textAlign: "right" }}>
              <Text style={styles.th}>Total paid</Text>
            </View>
            <View style={{ flex: 1, textAlign: "right" }}>
              <Text style={styles.th}>Invoices</Text>
            </View>
          </View>
          {report.clientBreakdown.slice(0, 10).map((c) => (
            <View key={c.clientEmail} style={styles.tr}>
              <View style={{ flex: 3 }}>
                <Text style={styles.td}>{c.clientEmail}</Text>
              </View>
              <View style={{ flex: 2, textAlign: "right" }}>
                <Text style={styles.td}>${c.totalPaid.toFixed(2)}</Text>
              </View>
              <View style={{ flex: 1, textAlign: "right" }}>
                <Text style={styles.td}>{c.invoiceCount}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Generated by LancePay • {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
}
