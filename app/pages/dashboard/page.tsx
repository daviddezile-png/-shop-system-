"use client";
import SalesByProduct from "@/components/SalesByProduct";
import SalesTrends from "@/components/SalesTrendLineChart";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  BadgeCheck,
  CreditCard,
  StoreIcon,
  Trash2,
  Wallet2,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import Loader from "@/components/Loader";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0); // Ensure total is a number
  const [soldProducts, setSoldProducts] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Date filter state
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(), // Today
  );
  const [dateFilterOpen, setDateFilterOpen] = useState(false);

  // Refresh function
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const startOfDay = startDate
        ? new Date(startDate).setHours(0, 0, 0, 0)
        : new Date(new Date().setDate(new Date().getDate() - 30)).setHours(
            0,
            0,
            0,
            0,
          );
      const endOfDay = endDate
        ? new Date(endDate).setHours(23, 59, 59, 999)
        : new Date().setHours(23, 59, 59, 999);

      // Convert to proper Date objects for toISOString
      const startISO = new Date(startOfDay).toISOString();
      const endISO = new Date(endOfDay).toISOString();

      // Fetch data in parallel for better performance
      const [productsRes, loansRes, incomeRes, soldRes] = await Promise.all([
        fetch("/api/products/list"),
        fetch(`/api/loans/list?startDate=${startISO}&endDate=${endISO}`),
        fetch(`/api/totalIncome?startDate=${startISO}&endDate=${endISO}`),
        fetch(`/api/soldProduct?startDate=${startISO}&endDate=${endISO}`),
      ]);

      // Update state with new data
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }

      if (loansRes.ok) {
        const loansData = await loansRes.json();
        setLoans(loansData);
      }

      if (incomeRes.ok) {
        const incomeData = await incomeRes.json();
        setTotal(incomeData.total);
      }

      if (soldRes.ok) {
        const soldData = await soldRes.json();
        setSoldProducts(soldData.count);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    refreshData();
  }, [startDate, endDate]);

  const totalProduct = products.length;
  const totalLoans = loans.length;
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }
  return (
    <div className="w-full p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="font-extrabold text-xl font-mono">Dashboard</h2>

        {/* Date Filter */}
        <Popover open={dateFilterOpen} onOpenChange={setDateFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Calendar className="mr-2 h-4 w-4" />
              {startDate && endDate
                ? `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd")}`
                : "Filter by Date Range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="end">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Start Date
                </label>
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  className="rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  End Date
                </label>
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  className="rounded-md"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStartDate(
                      new Date(new Date().setDate(new Date().getDate() - 30)),
                    );
                    setEndDate(new Date());
                    setDateFilterOpen(false);
                  }}
                >
                  Last 30 Days
                </Button>
                <Button size="sm" onClick={() => setDateFilterOpen(false)}>
                  Apply
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshData}
                  disabled={isRefreshing}
                  className="ml-2"
                >
                  {isRefreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Refresh"
                  )}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Stats Cards - Mobile Responsive Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-green-500 dark:bg-green-600 min-h-[100px] text-white cursor-pointer hover:bg-green-600 dark:hover:bg-green-700 transition-colors">
          <a href="/pages/products" className="block h-full">
            <CardContent className="pt-4">
              <CardAction className="mb-2">
                {isRefreshing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <StoreIcon className="h-5 w-5" />
                )}
              </CardAction>
              <CardTitle className="text-2xl sm:text-3xl">
                {totalProduct}
              </CardTitle>
              <CardDescription className="text-sm text-green-100">
                Registered Products
              </CardDescription>
            </CardContent>
          </a>
        </Card>
        <Card className="bg-lime-500 dark:bg-lime-600 min-h-[100px] text-white cursor-pointer hover:bg-lime-600 dark:hover:bg-lime-700 transition-colors">
          <a href="/pages/sales" className="block h-full">
            <CardContent className="pt-4">
              <CardAction className="mb-2">
                {isRefreshing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <BadgeCheck className="h-5 w-5" />
                )}
              </CardAction>
              <CardTitle className="text-2xl sm:text-3xl">
                {soldProducts}
              </CardTitle>
              <CardDescription className="text-sm text-lime-100">
                Products Sold
              </CardDescription>
            </CardContent>
          </a>
        </Card>
        <Card className="bg-yellow-500 dark:bg-yellow-600 min-h-[100px] text-white cursor-pointer hover:bg-yellow-600 dark:hover:bg-yellow-700 transition-colors">
          <a href="/pages/loans" className="block h-full">
            <CardContent className="pt-4">
              <CardAction className="mb-2">
                {isRefreshing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CreditCard className="h-5 w-5" />
                )}
              </CardAction>
              <CardTitle className="text-2xl sm:text-3xl">
                {totalLoans}
              </CardTitle>
              <CardDescription className="text-sm text-yellow-100">
                Total Loans
              </CardDescription>
            </CardContent>
          </a>
        </Card>
        <Card className="bg-orange-500 dark:bg-orange-600 min-h-[100px] text-white cursor-pointer hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors">
          <a href="/pages/report" className="block h-full">
            <CardContent className="pt-4">
              <CardAction className="mb-2">
                {isRefreshing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Wallet2 className="h-5 w-5" />
                )}
              </CardAction>
              <CardTitle className="text-xl sm:text-2xl">
                {Number(total).toLocaleString()}
                <span className="text-sm">.Tsh</span>
              </CardTitle>
              <CardDescription className="text-sm text-orange-100">
                Total Income
              </CardDescription>
            </CardContent>
          </a>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 p-2 sm:p-6">
        <div className="bg-white h-[450px] dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 w-full border dark:border-gray-700">
          <h2 className="font-bold mb-2 text-sm sm:text-base">
            Sales vs Products (Filter by Date)
          </h2>
          <div className="h-[200px] sm:h-[300px]">
            <SalesByProduct />
          </div>
        </div>
        <div className="bg-white h-[450px] dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 w-full border dark:border-gray-700">
          <h2 className="font-bold mb-2 text-sm sm:text-base">Sales Trends</h2>
          <div className="h-[200px] sm:h-[300px]">
            <SalesTrends />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
