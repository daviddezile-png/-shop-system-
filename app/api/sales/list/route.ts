import { PrismaClient } from "@/lib/generated/prisma";
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      // Use the 'include' option to fetch related data
      include: {
        product: {
          select: {
            name: true, // Only select the name from the product
          },
        },
        soldBy: {
          select: {
            name: true, // Only select the name from the user
          },
        },
      },
    });

    // Map the fetched data to a flatter structure for the client
    const formattedSales = sales.map(sale => ({
      id: sale.id,
      productName: sale.product.name,
      quantity: sale.quantity,
      totalPrice: sale.totalPrice,
      paymentType: sale.paymentType,
      soldBy: sale.soldBy.name,
      createdAt: sale.createdAt,
    }));

    return NextResponse.json(formattedSales, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}