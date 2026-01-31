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

    // Summarize
    const summary = sales.reduce((acc, s) => {
      const key = s.product.name;
      acc[key] = (acc[key] || 0) + s.totalPrice;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({ summary, total: sales.reduce((t, s) => t + s.totalPrice, 0) });
  } catch (err) {
    console.error("report error:", err);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
