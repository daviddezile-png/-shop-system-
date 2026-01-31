import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { startDate, endDate } = await req.json();

  try {
    const sales = await prisma.sale.groupBy({
      by: ["productId"],
      _sum: { totalPrice: true },
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });

    const products = await prisma.product.findMany({
      where: {
        id: { in: sales.map(s => s.productId) },
      },
      select: { id: true, name: true },
    });

    const data = sales.map(s => ({
      product: products.find(p => p.id === s.productId)?.name || "Unknown",
      income: s._sum.totalPrice ?? 0,
    }));

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}
