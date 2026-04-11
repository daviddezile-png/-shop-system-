import { PrismaClient } from "@/lib/generated/prisma";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

// Define the route handler for PUT requests (update)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Updated to Promise
) {
  // Await the params
  const { id } = await params;

  try {
    const { name, buyingPrice, sellingPrice, category, scale } = await req.json();
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        buyingPrice: parseFloat(buyingPrice),
        sellingPrice: parseFloat(sellingPrice),
        category,
        scale,
      },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// Define the route handler for DELETE requests
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Updated to Promise
) {
  // Await the params
  const { id } = await params;

  try {
    // Find the product and include its inventory
    const product = await prisma.product.findUnique({
      where: { id },
      include: { inventory: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // If product has inventory with quantity > 0, block deletion
    if (product.inventory && product.inventory.quantity > 0) {
      return NextResponse.json(
        { error: "Cannot delete product. Available quantity is greater than 0." },
        { status: 400 }
      );
    }

    // Always delete inventory first (if it exists), then product
    await prisma.$transaction([
      prisma.inventory.deleteMany({
        where: { productId: id },
      }),
      prisma.sale.deleteMany({
        where: { productId: id },
      }),
      prisma.product.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json(
      { message: "Product and inventory deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete error:", error);

    if (error.code === "P2003") {
      // Foreign key violation
      return NextResponse.json(
        { error: "Cannot delete product. It is still referenced in other records." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete product and inventory." },
      { status: 500 }
    );
  }
}