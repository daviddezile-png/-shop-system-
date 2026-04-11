import { PrismaClient } from "@/lib/generated/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const user = await prisma.user.upsert({
      where: { username: "admin" },
      update: {}, // If user exists, do nothing
      create: {
        id: "admin-id-001",
        username: "admin",
        password: hashedPassword,
        name: "System Administrator",
        email: "admin@example.com",
        role: "ADMIN",
      },
    });

    return NextResponse.json({ message: "Admin account is ready!", username: user.username });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}