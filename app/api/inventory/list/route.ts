import { PrismaClient } from '@/lib/generated/prisma';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const inventories = await prisma.inventory.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            scale: true,
          },
        },
      },
    });

    const formattedInventories = inventories.map(item => ({
      id: item.product.id,
      name: item.product.name,
      scale: item.product.scale,
      availableQuantity: item.quantity,
    }));

    return NextResponse.json(formattedInventories, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}