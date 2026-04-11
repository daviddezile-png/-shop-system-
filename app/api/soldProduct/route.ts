import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

export async function GET() {
  const prisma = new PrismaClient();
  try {
    // Get the start of the current day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const sales = await prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: startOfDay, // Greater than or equal to the start of the day
        },
      },
      _sum: {
        quantity: true, 
      },
    });

    const Loan = await prisma.loan.aggregate({
      where: {
        createdAt: { gte: startOfDay },
      },
      _sum: {
        quantity: true, 
      },
    });

    const total1 = sales._sum.quantity || 0;
    const total2 = Loan._sum.quantity || 0;
    const count = total1 + total2;
    return NextResponse.json({ count });
  } catch (err) {
    console.error("fetching error:", err);
    return NextResponse.json({ error: "Failed to track daily income" }, { status: 500 });
  } finally {
    await prisma.$disconnect(); // Disconnect Prisma client
  }
}