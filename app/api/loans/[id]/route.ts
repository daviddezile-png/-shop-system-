import { PrismaClient } from "@/lib/generated/prisma";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

// Define the route handler for PUT requests (update a loan)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Updated to Promise
) {
  // Await the params
  const { id } = await params;

  try {
    const { 
      paymentStatus, 
      customerName, 
      phone, 
      quantity, 
      paymentType,
      productId 
    } = await req.json();

    const updatedLoan = await prisma.loan.update({
      where: { id },
      data: {
        ...(paymentStatus !== undefined && { paymentStatus }),
        ...(customerName !== undefined && { customerName }),
        ...(phone !== undefined && { phone }),
        ...(quantity !== undefined && { quantity: parseInt(quantity) }),
        ...(paymentType !== undefined && { paymentType }),
      },
    });

    return NextResponse.json(updatedLoan, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update loan" }, { status: 500 });
  }
}

// Define the route handler for DELETE requests (delete a loan)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Updated to Promise
) {
  // Await the params
  const { id } = await params;

  try {
    await prisma.loan.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 }); // No content
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete loan" }, { status: 500 });
  }
}