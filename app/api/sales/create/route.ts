import { PrismaClient } from "@/lib/generated/prisma";
import { NextResponse, NextRequest } from "next/server";
 // Your NextAuth.js configuration

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  

  

  

  try {
       const { productId, quantity, paymentType, soldById } = await req.json();

    // 1. Find the product to get its selling price.
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 2. Find the corresponding inventory record for the product.
    const inventory = await prisma.inventory.findUnique({
      where: { productId: productId },
    });

    if (!inventory || inventory.quantity < quantity) {
      return NextResponse.json({ error: "Insufficient stock available" }, { status: 400 });
    }

    // 3. Use a Prisma transaction to ensure both operations succeed or fail together.
    const [newSale, updatedInventory] = await prisma.$transaction([
      // a. Create the new sale record.
      prisma.sale.create({
        data: {
          product: { connect: { id: productId } },
          quantity: parseInt(quantity),
          totalPrice: product.sellingPrice * parseInt(quantity),
          paymentType,
          soldBy: {
            connect: {
              id: soldById,
            },
          },
        },
      }),

      // b. Decrement the product's available quantity in the Inventory table.
      prisma.inventory.update({
        where: { productId: productId },
        data: {
          quantity: {
            decrement: parseInt(quantity),
          },
        },
      }),
    ]);

    return NextResponse.json(newSale, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 });
  }
}