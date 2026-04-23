"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import Loader from "@/components/Loader";

export default function WeeklySalesTrends() {
  const [monthDate, setMonthDate] = useState<Date | undefined>(new Date());
  const [data, setData] = useState<{ weekLabel: string; income: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!monthDate) {
      setData([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const monthStr = format(monthDate, "yyyy-MM");
        const res = await fetch(
          `/api/sales/trends?month=${encodeURIComponent(monthStr)}`,
        );
        const json = await res.json();

        if (!res.ok) {
          console.error("API error:", json);
          toast.error(json?.error || "Failed to load sales trends");
          setData([]);
          setLoading(false);
          return;
        }

        // Ensure we have an array — Recharts requires an array
        if (!Array.isArray(json)) {
          console.warn("Expected array from API, got:", json);
          setData([]);
          setLoading(false);
          return;
        }

        // Ensure each item has the expected shape and numbers parsed
        const safe = json.map((it: any) => ({
          weekLabel: String(it.weekLabel ?? "Week"),
          income: Number(it.income ?? 0),
        }));

        setData(safe);
      } catch (err) {
        console.error("fetch error:", err);
        toast.error("Failed to load sales trends");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [monthDate]);

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {monthDate ? format(monthDate, "MMMM yyyy") : "Pick month"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            {/* Calendar will allow month selection; user can pick any date in target month */}
            <Calendar
              mode="single"
              selected={monthDate ?? undefined}
              onSelect={setMonthDate}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="h-[300px] w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={Array.isArray(data) ? data : []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="weekLabel" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#2563eb"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
