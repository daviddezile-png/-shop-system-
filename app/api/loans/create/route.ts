import { PrismaClient } from "@/lib/generated/prisma";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { productId, quantity, paymentType, customerName, phone, createdById } = await req.json();

    // 1. Find the product to get its selling price.
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 2. Find the corresponding inventory record for the product and check for sufficient stock.
    const inventory = await prisma.inventory.findUnique({
      where: { productId: productId },
    });

    if (!inventory || inventory.quantity < parseInt(quantity)) {
      return NextResponse.json({ error: "Insufficient stock available for loan" }, { status: 400 });
    }

    // 3. Calculate the total loan quantity based on the product's selling price.
    const loanQuantity = product.sellingPrice * parseFloat(quantity);
    
    // 4. Use a Prisma transaction to ensure both operations succeed or fail together.
    const [newLoan, updatedInventory] = await prisma.$transaction([
      // a. Create the new loan record, linking it to the product and the user who created it.
      prisma.loan.create({
        data: {
          // Connect to the product using its ID
          product: { connect: { id: productId } },
          quantity: parseInt(quantity),
          loanQuantity,
          paymentType,
          customerName,
          phone,
          // Connect to the user who created this loan
          createdBy: {
            connect: {
              id: createdById,
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

    return NextResponse.json(newLoan, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create loan" }, { status: 500 });
  }
}
