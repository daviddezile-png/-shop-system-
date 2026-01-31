import { PrismaClient } from "@/lib/generated/prisma";
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const productCount = await prisma.product.count();
    return NextResponse.json(productCount);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}