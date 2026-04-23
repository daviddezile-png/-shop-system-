import { PrismaClient } from '@/lib/generated/prisma';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// In Next.js 15, params is a Promise that must be awaited
export async function PUT(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } 
) {
  // 1. Await the params to get the id
  const { id } = await params;
  
  const { quantity } = await req.json();

  if (typeof quantity !== 'number' || quantity < 0) {
    return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
  }

  try {
    // Find the inventory record by its associated product ID
    const inventoryToUpdate = await prisma.inventory.findUnique({
      where: {
        // Using the awaited id here
        productId: id,
      },
      select: {
        id: true, 
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
        quantity: quantity, // Set the quantity directly instead of incrementing
      },
    });

    return NextResponse.json(updatedInventory, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
  }
}