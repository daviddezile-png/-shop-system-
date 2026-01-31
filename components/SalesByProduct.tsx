'use client'
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import Loader from '@/components/Loader'
export default function SalesByProduct() {
  const [data, setData] = useState<any[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true)
  const fetchData = async () => {
    if (!date) return;
    const res = await fetch("/api/sales/by-date", {
      method: "POST",
      body: JSON.stringify({
        startDate: new Date(date.setHours(0,0,0,0)),
        endDate: new Date(date.setHours(23,59,59,999)),
      }),
    });
    const result = await res.json();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {date ? date.toDateString() : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}

            />
          </PopoverContent>
        </Popover>
      </div>
       <div className="h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-full"><Loader/></div>
        ) : (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}  layout="vertical">
          <XAxis type="number" dataKey="income" />
          <YAxis type="category" dataKey="product" />
          <Tooltip />
          <Bar dataKey="income" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>)
}
    </div>
    </div>
  );
}

