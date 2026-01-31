// app/api/sales/trends/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { startOfMonth, endOfMonth, getDate } from "date-fns";

export async function GET(req: NextRequest) {
    const prisma = new PrismaClient();
  try {
    const url = new URL(req.url);
    const month = url.searchParams.get("month"); // expected "YYYY-MM"
    if (!month) {
      return NextResponse.json({ error: "Missing month param (YYYY-MM)" }, { status: 400 });
    }

    // Month boundaries
    const start = startOfMonth(new Date(`${month}-01`));
    const end = endOfMonth(start);

    // Fetch sales within month
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        totalPrice: true,
        createdAt: true,
      },
    });

    // Initialize buckets
    const buckets = [
      { weekLabel: "Week 1", income: 0 },
      { weekLabel: "Week 2", income: 0 },
      { weekLabel: "Week 3", income: 0 },
      { weekLabel: "Week 4", income: 0 },
    ];

    // Group sales by week number (1–4)
    for (const s of sales) {
      const day = getDate(new Date(s.createdAt));
      let weekNum = 4; // default last bucket
      if (day <= 7) weekNum = 1;
      else if (day <= 14) weekNum = 2;
      else if (day <= 21) weekNum = 3;
      // else stays 4

      buckets[weekNum - 1].income += s.totalPrice ?? 0;
    }

    return NextResponse.json(buckets);
  } catch (err) {
    console.error("sales trends error:", err);
    return NextResponse.json({ error: "Failed to compute weekly sales" }, { status: 500 });
  }
}
