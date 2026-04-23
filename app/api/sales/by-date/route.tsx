import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { startDate, endDate } = await req.json();

  try {
    // Validate and parse dates
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 },
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 },
      );
    }

    // Ensure end date is after start date
    if (end < start) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 },
      );
    }

    const sales = await prisma.sale.groupBy({
      by: ["productId"],
      _sum: { totalPrice: true },
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    const products = await prisma.product.findMany({
      where: {
        id: { in: sales.map((s) => s.productId) },
      },
      select: { id: true, name: true },
    });

    const data = sales.map((s) => ({
      product: products.find((p) => p.id === s.productId)?.name || "Unknown",
      income: s._sum.totalPrice ?? 0,
    }));

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 },
    );
  }
}
