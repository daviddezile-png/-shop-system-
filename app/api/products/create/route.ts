import { PrismaClient } from "@/lib/generated/prisma";
import { NextRequest, NextResponse } from 'next/server';
const prisma = new PrismaClient();


  export async function POST(req: NextRequest) {
  try {
    const { name, buyingPrice, sellingPrice, category, scale } = await req.json();

    // Use a transaction to ensure both product and inventory are created or none are.
    const [newProduct, newInventory] = await prisma.$transaction([
      // Create the new product
      prisma.product.create({
        data: {
          name,
          buyingPrice: parseFloat(buyingPrice),
          sellingPrice: parseFloat(sellingPrice),
          category,
          scale,
        },
      }),
      // Create a corresponding inventory record with quantity 0
      prisma.inventory.create({
        data: {
          quantity: 0.0,
          product: {
            connect: {
              name: name,
            },
          },
        },
      }),
    ]);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create product and inventory" }, { status: 500 });
  }
}