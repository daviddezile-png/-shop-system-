import { PrismaClient } from "@/lib/generated/prisma";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();


// Define the route handler for DELETE requests
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } } // Destructure params to get the id
) {
  const { id } = params;

  try {
    await prisma.user.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 }); // No content
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}