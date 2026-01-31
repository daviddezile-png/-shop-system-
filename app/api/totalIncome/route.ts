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
        totalPrice: true, // Sum the totalPrice field
      },
    });

    // Extract the total from the result, handling null case
    const total = sales._sum.totalPrice || 0;

    return NextResponse.json({ total });
  } catch (err) {
    console.error("fetching error:", err);
    return NextResponse.json({ error: "Failed to track daily income" }, { status: 500 });
  } finally {
    await prisma.$disconnect(); // Disconnect Prisma client
  }
}