import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

export async function GET(req: NextRequest) {
  const prisma = new PrismaClient();
  try {
    // Get date parameters from URL
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    // Default to today if no dates provided
    const startOfDay = startDate ? new Date(startDate) : new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = endDate ? new Date(endDate) : new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: startOfDay, // Greater than or equal to the start of the day
          lte: endOfDay, // Less than or equal to the end of the day
        },
      },
      _sum: {
        totalPrice: true, // Sum the totalPrice field
      },
    });

    const PaidLoan = await prisma.loan.aggregate({
      where: {
        createdAt: { 
          gte: startOfDay,
          lte: endOfDay,
        },
        paymentStatus: "PAID"
      },
      _sum: {
        loanQuantity: true, // Sum the totalPrice field
      },
    });
    // Extract the total from the result, handling null case
    const total1 = sales._sum.totalPrice || 0;
    const total2 = PaidLoan._sum.loanQuantity || 0;
    const total = total1 + total2;
    return NextResponse.json({ total });
  } catch (err) {
    console.error("fetching error:", err);
    return NextResponse.json({ error: "Failed to track daily income" }, { status: 500 });
  } finally {
    await prisma.$disconnect(); // Disconnect Prisma client
  }
}