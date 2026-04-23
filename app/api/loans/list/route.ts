import { PaymentStatus, PaymentType, PrismaClient } from "@/lib/generated/prisma";
import { NextResponse, NextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const whereClause: {
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        whereClause.createdAt = {
          gte: start,
          lte: end,
        };
      }
    }

    const loans = await prisma.loan.findMany({
      where: whereClause,
      include:{
        product:{
            select:{
                name:true,
            },   
        },
        createdBy:{
            select:{
                name:true,
            },
        },
        
      },
    });
   
    const formattedaloans = loans.map(loan => ({
      id: loan.id,
      productName: loan.product.name,
      quantity: loan.quantity,
      customerName:loan.customerName,
      phone:loan.phone,
      loanQuantity:loan.loanQuantity,
      paymentType:loan.paymentType,
      paymentStatus:loan.paymentStatus,
      createdBy: loan.createdBy.name,
      createdAt: loan.createdAt,
    })
)

    // The loan data is already in a flat structure, so we can return it directly.
    return NextResponse.json(formattedaloans, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 });
  }
}
