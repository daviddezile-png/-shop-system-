"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Loader from "@/components/Loader";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

interface SalesData {
  id: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  paymentType: string;
  createdAt: string;
  customerName?: string;
}

interface PaymentMethods {
  [key: string]: number;
}

interface ProductSummary {
  quantity: number;
  amount: number;
  price: number;
}

interface ReportData {
  total: number;
  totalTransactions: number;
  paymentMethods: PaymentMethods;
  summary: { [productName: string]: ProductSummary };
  topProducts: Array<{ name: string; amount: number }>;
}

const SalesReportPDF = ({
  data,
  startDate,
  endDate,
}: {
  data: ReportData;
  startDate: string;
  endDate: string;
}) => (
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
          <Text> Nansio-Ukerewe</Text>
          <Text style={{ fontSize: 10, color: "#64748b" }}>
            Tel: +255 758 012 513
          </Text>
        </View>
      </View>

      {/* Summary Statistics */}
      <View
        style={{
          marginBottom: 20,
          padding: 15,
          backgroundColor: "#f8fafc",
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 10 }}>
          Summary Statistics
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontSize: 12, color: "#64748b" }}>
              Total Transactions:
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              {data?.totalTransactions || 0}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 12, color: "#64748b" }}>
              Average Sale:
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              {data?.totalTransactions > 0
                ? Number(data?.total / data?.totalTransactions).toLocaleString()
                : 0}{" "}
              TZS
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 12, color: "#64748b" }}>
              Active Products:
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              {Object.keys(data?.summary || {}).length}
            </Text>
          </View>
        </View>
      </View>

      {/* Payment Methods Breakdown */}
      {data?.paymentMethods && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 10 }}>
            Payment Methods
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {Object.entries(data.paymentMethods).map(
              ([method, amount]: [string, number]) => (
                <View
                  key={method}
                  style={{
                    flex: 1,
                    padding: 8,
                    backgroundColor: "#f1f5f9",
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ fontSize: 11, textTransform: "capitalize" }}>
                    {method}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                    {Number(amount).toLocaleString()} TZS
                  </Text>
                </View>
              ),
            )}
          </View>
        </View>
      )}

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableCell, { flex: 2 }]}>Product Name</Text>
        <Text style={[styles.tableCell, { textAlign: "center" }]}>
          Quantity Sold
        </Text>
        <Text style={[styles.tableCell, { textAlign: "right" }]}>
          Total Income (TZS)
        </Text>
      </View>

      {/* Table Rows */}
      {Object.entries(data?.summary || {}).map(
        ([product, details]: [string, ProductSummary]) => (
          <View key={product} style={styles.tableRow}>
            <Text
              style={[
                styles.tableCell,
                { flex: 2, textTransform: "capitalize" },
              ]}
            >
              {product}
            </Text>
            <Text style={[styles.tableCell, { textAlign: "center" }]}>
              {details.quantity || 0}
            </Text>
            <Text style={[styles.tableCell, { textAlign: "right" }]}>
              {Number(
                typeof details === "number" ? details : details.amount || 0,
              ).toLocaleString()}
            </Text>
          </View>
        ),
      )}

      {/* Top Performing Products */}
      {data?.topProducts && data.topProducts.length > 0 && (
        <View
          style={{
            marginTop: 20,
            padding: 15,
            backgroundColor: "#fef3c7",
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 10 }}>
            Top Performing Products
          </Text>
          {data.topProducts
            .slice(0, 3)
            .map((product: { name: string; amount: number }, index: number) => (
              <Text key={index} style={{ fontSize: 12, marginBottom: 2 }}>
                {index + 1}. {product.name} -{" "}
                {Number(product.amount).toLocaleString()} TZS
              </Text>
            ))}
        </View>
      )}

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1e40af" }}>
          GRAND TOTAL: {Number(data?.total || 0).toLocaleString()} TZS
        </Text>
      </View>

      {/* Additional Information */}
      <View
        style={{
          marginTop: 20,
          padding: 10,
          backgroundColor: "#f8fafc",
          borderRadius: 6,
        }}
      >
        <Text style={{ fontSize: 11, color: "#64748b", marginBottom: 5 }}>
          Report Details:
        </Text>
        <Text style={{ fontSize: 10, color: "#64748b" }}>
          • Generated on {format(new Date(), "dd MMMM yyyy 'at' h:mm a")}
        </Text>
        <Text style={{ fontSize: 10, color: "#64748b" }}>
          • Report Period: {format(new Date(startDate), "dd MMM yyyy")} to{" "}
          {format(new Date(endDate), "dd MMM yyyy")}
        </Text>
        <Text style={{ fontSize: 10, color: "#64748b" }}>
          • Total Days:{" "}
          {Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
              (1000 * 60 * 60 * 24),
          )}{" "}
          days
        </Text>
      </View>

      <Text style={styles.footer}>## God bless you !</Text>
    </Page>
  </Document>
);

// ==================== Main Component ====================
export default function ReportsPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      return toast.error("Please select both start and end dates");
    }

    try {
      setLoading(true);
      const res = await fetch(
        `/api/report/sales?start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
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
    <div className="p-3 sm:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-mono font-bold tracking-tight">
          Sales Reports
        </h2>
      </div>

      {/* Date Pickers & Buttons - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8 bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-xl shadow-sm border dark:border-gray-700">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-1.5 block">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate
                  ? format(startDate, "dd MMM yyyy")
                  : "Pick start date"}
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

        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-1.5 block">End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd MMM yyyy") : "Pick end date"}
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

        <div className="flex flex-wrap items-end gap-2 sm:gap-3">
          <Button
            onClick={fetchReport}
            className="px-4 sm:px-8 flex-1 sm:flex-none"
          >
            Generate
          </Button>

          {data && (
            <>
              <Button
                onClick={handlePreview}
                variant="outline"
                className="gap-2 flex-1 sm:flex-none"
              >
                <Eye className="h-4 w-4" />
                <span className="sm:hidden">Preview</span>
              </Button>

              <PDFDownloadLink
                document={
                  <SalesReportPDF
                    data={data}
                    startDate={startDate?.toISOString() || ""}
                    endDate={endDate?.toISOString() || ""}
                  />
                }
                fileName={`sales-report_${format(startDate || new Date(), "yyyy-MM-dd")}_to_${format(
                  endDate || new Date(),
                  "yyyy-MM-dd",
                )}.pdf`}
              >
                {({ loading }) => (
                  <Button
                    disabled={loading}
                    variant="default"
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-mono font-semibold">Report Summary</h2>
            <p className="text-muted-foreground dark:text-gray-400">
              {format(startDate!, "dd MMM yyyy")} —{" "}
              {format(endDate!, "dd MMM yyyy")}
            </p>
          </div>

          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-gray-700">
              <tr>
                <th className="text-left p-6 font-medium">Product Name</th>
                <th className="text-center p-6 font-medium">Quantity Sold</th>
                <th className="text-right p-6 font-medium">
                  Total Income (TZS)
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(
                data.summary || ({} as { [key: string]: ProductSummary }),
              ).map(([product, details]: [string, ProductSummary]) => (
                <tr
                  key={product}
                  className="border-b dark:border-gray-700 last:border-0 hover:bg-slate-50 dark:hover:bg-gray-700"
                >
                  <td className="p-6 capitalize font-medium">{product}</td>
                  <td className="p-6 text-center font-mono">
                    {details.quantity || 0}
                  </td>
                  <td className="p-6 text-right font-mono">
                    {Number(
                      typeof details === "number"
                        ? details
                        : details.amount || 0,
                    ).toLocaleString()}{" "}
                    TZS
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 dark:bg-gray-700">
              <tr>
                <td className="p-6 font-bold text-lg">GRAND TOTAL</td>
                <td className="p-6 text-center font-bold text-lg">
                  {Object.values(
                    data.summary || ({} as { [key: string]: ProductSummary }),
                  ).reduce(
                    (sum: number, details: ProductSummary) =>
                      sum + (details.quantity || 0),
                    0,
                  )}
                </td>
                <td className="p-6 text-right font-bold text-lg text-blue-600 dark:text-blue-400">
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
          <div className="bg-white dark:bg-gray-800 w-full max-w-5xl h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="font-semibold text-lg">Sales Report Preview</h3>
              <Button variant="ghost" onClick={() => setShowPreview(false)}>
                Close
              </Button>
            </div>

            <PDFViewer width="100%" height="100%" className="flex-1">
              <SalesReportPDF
                data={data}
                startDate={startDate?.toISOString() || ""}
                endDate={endDate?.toISOString() || ""}
              />
            </PDFViewer>
          </div>
        </div>
      )}
    </div>
  );
}
