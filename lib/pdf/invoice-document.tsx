import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { InvoiceLineItem } from '@/types/database';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  title: { fontSize: 18, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  header: { borderBottomWidth: 1, marginBottom: 12, paddingBottom: 8 },
});

interface Props {
  businessName: string;
  gstin?: string | null;
  invoiceNumber: string;
  issueDate: string;
  customerName: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  isInterState: boolean;
}

export function InvoicePDFDocument({
  businessName,
  gstin,
  invoiceNumber,
  issueDate,
  customerName,
  lineItems,
  subtotal,
  cgst,
  sgst,
  igst,
  total,
  isInterState,
}: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>TAX INVOICE</Text>
        <View style={styles.header}>
          <Text>{businessName}</Text>
          {gstin ? <Text>GSTIN: {gstin}</Text> : null}
          <Text>Invoice: {invoiceNumber}</Text>
          <Text>Date: {issueDate}</Text>
        </View>
        <Text>Bill To: {customerName}</Text>
        <View style={{ marginTop: 16 }}>
          {lineItems.map((item, i) => (
            <View key={i} style={styles.row}>
              <Text>{item.description}</Text>
              <Text>
                {item.quantity} × ₹{item.unit_price_inr} @ {item.gst_rate}%
              </Text>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 24 }}>
          <View style={styles.row}>
            <Text>Subtotal</Text>
            <Text>₹{subtotal.toFixed(2)}</Text>
          </View>
          {isInterState ? (
            <View style={styles.row}>
              <Text>IGST</Text>
              <Text>₹{igst.toFixed(2)}</Text>
            </View>
          ) : (
            <>
              <View style={styles.row}>
                <Text>CGST</Text>
                <Text>₹{cgst.toFixed(2)}</Text>
              </View>
              <View style={styles.row}>
                <Text>SGST</Text>
                <Text>₹{sgst.toFixed(2)}</Text>
              </View>
            </>
          )}
          <View style={[styles.row, { fontWeight: 'bold', marginTop: 8 }]}>
            <Text>Total</Text>
            <Text>₹{total.toFixed(2)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
