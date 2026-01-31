import { PrismaClient } from '@/lib/generated/prisma';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { quantityToAdd } = await req.json();

  if (typeof quantityToAdd !== 'number' || quantityToAdd <= 0) {
    return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
  }

  try {
    // Find the inventory record by its associated product ID
    const inventoryToUpdate = await prisma.inventory.findUnique({
      where: {
        // This assumes a one-to-one relationship where a product ID is unique to an inventory record.
        productId: id,
      },
      select: {
        id: true, // Only select the inventory ID to reduce payload size
        quantity: true,
      }
    });

    if (!inventoryToUpdate) {
      return NextResponse.json({ error: "Inventory record not found" }, { status: 404 });
    }

    // Now, update the inventory record using its actual unique ID
    const updatedInventory = await prisma.inventory.update({
      where: {
        id: inventoryToUpdate.id,
      },
      data: {
        quantity: {
          increment: quantityToAdd,
        },
      },
    });

    return NextResponse.json(updatedInventory, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
  }
}
