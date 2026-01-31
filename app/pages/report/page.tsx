"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Loader from '@/components/Loader'
import { TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Table } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
export default function ReportsPage() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [data, setData] = useState<any>(null);
   const [loading,setLoading] = useState(false);
  // Fetch summary report (JSON)
  const fetchReport = async () => {
    if (!start || !end) return toast.error("Please select both start and end dates");

    try {
      setLoading(true);
      const res = await fetch(`/api/report/sales?start=${start}&end=${end}`);
      const json = await res.json();
      if (res.ok) setData(json);
      else toast.error(json.error || "Failed to load report");
    } catch (e) {
      toast.error("Failed to load report");
      console.error(e);
    }
    finally{setLoading(false)}
  };

  // Download PDF report
  const downloadReport = async () => {
    if (!start || !end) return toast.error("Please select both start and end dates");

    try {
      const res = await fetch(`/api/report/download?start=${start}&end=${end}`);
      if (!res.ok) return toast.error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sales-report_${start}_to_${end}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast.error("Failed to download report");
    }
    finally
    {setLoading(false)}
  };
 if (loading) {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader />
    </div>
  );
}
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Sales Reports</h1>

      <div className="flex gap-2 mb-4">
     <div className="flex gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {start ? start.toDateString() : "Pick a start date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={start}
              onSelect={setStart}

            />
          </PopoverContent>
        </Popover>
      </div>
       <div className="flex gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {end ? end.toDateString() : "Pick End date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={end}
              onSelect={setEnd}

            />
          </PopoverContent>
        </Popover>
      </div>

        <Button onClick={fetchReport}>Generate Summary</Button>
        <Button onClick={downloadReport} variant="secondary">
          Download PDF
        </Button>
      </div>

      {data && (
        <div className="space-y-2 mt-4">
          <h2 className="text-lg font-semibold text-center p-4">REPORT SUMMARY</h2>
          <table className="w-full">
            
              <TableHead>
                <TableRow>Product Name</TableRow>
                
              </TableHead> 
               <TableHead>
                <TableRow>Total income</TableRow>
                
              </TableHead> 
            
            <TableBody>
               {Object.entries(data.summary).map(([product, amount]) => (
              <TableRow key={product}>
               <TableCell className="capitalize">{product}</TableCell> 
               <TableCell>{Number(amount).toLocaleString()} TZS</TableCell> 
              </TableRow>
            ))}
            </TableBody>
            
          </table>
          <p className="font-bold mt-5 text-center">
              TOTAL : {Number(data.total).toLocaleString()} TZS
              </p>
        </div>
      )}
    </div>
  );
}
