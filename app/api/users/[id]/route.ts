import { PrismaClient } from "@/lib/generated/prisma";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

// Define the route handler for PUT requests (update user)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await the params
  const { id } = await params;

  try {
    const body = await req.json();
    
    // Validate required fields
    const { username, role, name, email, phone } = body;
    
    if (!username || !role || !name || !email || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username,
        role,
        name,
        email,
        phone,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
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
    await prisma.user.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 }); // No content
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}