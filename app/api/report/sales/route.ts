// app/api/reports/sales/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

export async function GET(req: NextRequest) {
    const prisma = new PrismaClient();
  try {
    const url = new URL(req.url);
    const start = url.searchParams.get("start"); // "2025-09-01"
    const end = url.searchParams.get("end");     // "2025-09-30"

    if (!start || !end) {
      return NextResponse.json({ error: "Missing date range" }, { status: 400 });
    }

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
      include: {
        product: true, // so we can report product names
      },
    });

    // Enhanced summary with quantities
    const summary = sales.reduce((acc, s) => {
      const key = s.product.name;
      if (!acc[key]) {
        acc[key] = { amount: 0, quantity: 0 };
      }
      acc[key].amount += s.totalPrice;
      acc[key].quantity += s.quantity;
      return acc;
    }, {} as Record<string, { amount: number; quantity: number }>);

    // Payment methods breakdown
    const paymentMethods = sales.reduce((acc, s) => {
      const method = s.paymentType || 'Unknown';
      acc[method] = (acc[method] || 0) + s.totalPrice;
      return acc;
    }, {} as Record<string, number>);

    // Top performing products
    const topProducts = Object.entries(summary)
      .map(([name, data]) => ({ name, amount: data.amount, quantity: data.quantity }))
      .sort((a, b) => b.amount - a.amount);

    // Calculate total transactions and average sale
    const totalTransactions = sales.length;
    const totalIncome = sales.reduce((t, s) => t + s.totalPrice, 0);
    const averageSale = totalTransactions > 0 ? totalIncome / totalTransactions : 0;

    // Additional statistics
    const totalQuantitySold = sales.reduce((t, s) => t + s.quantity, 0);

    return NextResponse.json({ 
      summary, 
      total: totalIncome,
      totalTransactions,
      averageSale,
      paymentMethods,
      topProducts,
      totalQuantitySold,
      reportPeriod: {
        start,
        end,
        totalDays: Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (err) {
    console.error("report error:", err);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
