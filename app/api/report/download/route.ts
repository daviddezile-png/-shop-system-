import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// ... previous imports and prisma setup

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  try {
    const sales = await prisma.sale.findMany({
      include: { product: true, soldBy: { select: { name: true } } },
      where: {
        createdAt: {
          gte: start ? new Date(start) : undefined,
          lte: end ? new Date(end) : undefined,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const fontPath = path.join(process.cwd(), "public/fonts/Roboto-Regular.ttf");
    if (!fs.existsSync(fontPath)) throw new Error("Font not found at " + fontPath);

    const doc = new PDFDocument({ font: fontPath, bufferPages: true });
    doc.font(fontPath);

    const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // --- Build PDF ---
      doc.fontSize(20).text("Sales Report", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, { align: "center" });
      doc.moveDown();

      // Table header
      const headers = ["Product", "Qty", "Total", "Payment", "Sold By", "Date"];
      const columnWidths = [100, 80, 80, 80, 80, 150];
      let x = doc.page.margins.left;
      let y = doc.y;
      headers.forEach((h, i) => {
        doc.text(h, x, y, { width: columnWidths[i], bold: true });
        x += columnWidths[i];
      });
      y += 20;

      // Table rows
      sales.forEach((s) => {
        x = doc.page.margins.left;
        const row = [
          s.product.name,
          s.quantity.toString()+' '+ s.product.scale ,
          s.totalPrice.toFixed(2),
          s.paymentType,
          s.soldBy?.name ?? "N/A",
          s.createdAt.toLocaleDateString(),
        ];
        row.forEach((text, i) => {
          doc.text(text, x, y, { width: columnWidths[i] });
          x += columnWidths[i];
        });
        x = 200;
        y += 20;
        if (y > doc.page.height - 50) {
          doc.addPage();
          y = doc.page.margins.top;
        }
      });
     
      // Total
      const total = sales.reduce((sum, s) => sum + Number(s.totalPrice), 0);
      doc.moveDown();
       
      doc.fontSize(12).text(`Total Sales: ${total.toFixed(2)} TZS`, { align: "center", width:120 });
      
      doc.end(); // resolves the Promise
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=sales-report.pdf",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate PDF", message: (err as any).message }, { status: 500 });
  }
}
