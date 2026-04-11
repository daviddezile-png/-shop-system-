"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Loader from "@/components/Loader";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Download, Eye } from "lucide-react";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  PDFDownloadLink,
} from "@react-pdf/renderer";

// ==================== PDF Document ====================
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    borderBottomWidth: 3,
    borderBottomColor: "#3b82f6",
    paddingBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1e40af",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e40af",
    color: "#fff",
    padding: 10,
    marginBottom: 5,
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    padding: 10,
    minHeight: 35,
  },
  tableCell: {
    flex: 1,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: "#1e40af",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 10,
    color: "#64748b",
  },
});

const SalesReportPDF = ({ data, startDate, endDate }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Sales Report</Text>
          <Text style={styles.subtitle}>
            {format(new Date(startDate), "dd MMM yyyy")} —{" "}
            {format(new Date(endDate), "dd MMM yyyy")}
          </Text>
        </View>
        <View style={{ textAlign: "right" }}>
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>BLESSED SHOP</Text>
          <Text>    Nansio-Ukerewe</Text>
        </View>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableCell, { flex: 2 }]}>Product Name</Text>
        <Text style={[styles.tableCell, { textAlign: "right" }]}>Total Income (TZS)</Text>
      </View>

      {/* Table Rows */}
      {Object.entries(data?.summary || {}).map(([product, amount]: any) => (
        <View key={product} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 2, textTransform: "capitalize" }]}>
            {product}
          </Text>
          <Text style={[styles.tableCell, { textAlign: "right" }]}>
            {Number(amount).toLocaleString()}
          </Text>
        </View>
      ))}

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1e40af" }}>
          GRAND TOTAL: {Number(data?.total || 0).toLocaleString()} TZS
        </Text>
      </View>

      <Text style={styles.footer}>
        Generated on {format(new Date(), "dd MMMM yyyy")} • Thank you 
      </Text>
    </Page>
  </Document>
);

// ==================== Main Component ====================
export default function ReportsPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      return toast.error("Please select both start and end dates");
    }

    try {
      setLoading(true);
      const res = await fetch(
        `/api/report/sales?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
      );
      const json = await res.json();

      if (res.ok) {
        setData(json);
        toast.success("Report loaded successfully");
      } else {
        toast.error(json.error || "Failed to load report");
      }
    } catch (e) {
      toast.error("Failed to load report");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (!data) {
      toast.error("Please generate report first");
      return;
    }
    setShowPreview(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-mono font-bold tracking-tight">Sales Reports</h2>
      </div>

      {/* Date Pickers & Buttons */}
      <div className="flex flex-wrap gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex-1 min-w-[240px]">
          <label className="text-sm font-medium mb-1.5 block">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd MMMM yyyy") : "Pick start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex-1 min-w-[240px]">
          <label className="text-sm font-medium mb-1.5 block">End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd MMMM yyyy") : "Pick end date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-end gap-3">
          <Button onClick={fetchReport} className="px-8">
            Generate Report
          </Button>

          {data && (
            <>
              <Button onClick={handlePreview} variant="outline" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview PDF
              </Button>

              <PDFDownloadLink
                document={
                  <SalesReportPDF
                    data={data}
                    startDate={startDate}
                    endDate={endDate}
                  />
                }
                fileName={`sales-report_${format(startDate!, "yyyy-MM-dd")}_to_${format(
                  endDate!,
                  "yyyy-MM-dd"
                )}.pdf`}
              >
                {({ loading }) => (
                  <Button disabled={loading} variant="default" className="gap-2 bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4" />
                    {loading ? "Generating..." : "Download PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            </>
          )}
        </div>
      </div>

      {/* Summary Table */}
      {data && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-mono font-semibold">Report Summary</h2>
            <p className="text-muted-foreground">
              {format(startDate!, "dd MMM yyyy")} — {format(endDate!, "dd MMM yyyy")}
            </p>
          </div>

          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-6 font-medium">Product Name</th>
                <th className="text-right p-6 font-medium">Total Income (TZS)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.summary || {}).map(([product, amount]: any) => (
                <tr key={product} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="p-6 capitalize font-medium">{product}</td>
                  <td className="p-6 text-right font-mono">
                    {Number(amount).toLocaleString()} TZS
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50">
              <tr>
                <td className="p-6 font-bold text-lg">GRAND TOTAL</td>
                <td className="p-6 text-right font-bold text-lg text-blue-600">
                  {Number(data.total || 0).toLocaleString()} TZS
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPreview && data && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg">Sales Report Preview</h3>
              <Button variant="ghost" onClick={() => setShowPreview(false)}>
                Close
              </Button>
            </div>

            <PDFViewer width="100%" height="100%" className="flex-1">
              <SalesReportPDF data={data} startDate={startDate} endDate={endDate} />
            </PDFViewer>
          </div>
        </div>
      )}
    </div>
  );
}