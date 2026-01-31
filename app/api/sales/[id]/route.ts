import { PrismaClient } from "@/lib/generated/prisma";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

// Define the route handler for PUT requests (update a sale)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } } // Destructure params to get the id
) {
  const { id } = params;
  try {
    const { productId, quantity, paymentType } = await req.json();

    // Find the product to get its sellingPrice
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const totalPrice = product.sellingPrice * quantity;

    const updatedSale = await prisma.sale.update({
      where: { id },
      data: {
        productId,
        quantity: parseInt(quantity),
        totalPrice,
        paymentType,
      },
    });

    return NextResponse.json(updatedSale, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update sale" }, { status: 500 });
  }
}

// Define the route handler for DELETE requests (delete a sale)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } } // Destructure params to get the id
) {
  const { id } = params;

  try {
    await prisma.sale.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 }); // No content
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete sale" }, { status: 500 });
  }
}