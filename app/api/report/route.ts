import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export async function GET() {
  try {
    const doc = new PDFDocument();

    // Collect PDF chunks into a buffer
    const chunks: Uint8Array[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    
    const bufferPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

    // Write content to PDF
    doc.fontSize(20).text("Sales Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text("This is an auto-generated sales report.");
    
    doc.end();

    const buffer = await bufferPromise;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=sales-report.pdf",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
