import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { ApiError, handler, json, readBody, requireAdmin } from "@/lib/api";

const schema = z.object({
  amount: z.coerce.number().int().min(1).max(1_000_000_000),
  method: z.enum(["CASH", "TRANSFER"]),
  note: z.string().trim().max(250).optional(),
});

function receiptNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `PT-${date}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export const POST = handler(async (req, ctx: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const body = await readBody(req, schema);

  const payment = await db.$transaction(async (tx) => {
    const invoice = await tx.tuitionInvoice.findUnique({
      where: { id },
      include: { payments: { select: { amount: true } } },
    });
    if (!invoice) throw new ApiError("Không tìm thấy hóa đơn", 404);
    const paid = invoice.payments.reduce((sum, item) => sum + item.amount, 0);
    if (body.amount > invoice.amount - paid) {
      throw new ApiError("Số tiền thu vượt quá công nợ còn lại", 422);
    }
    return tx.tuitionPayment.create({
      data: {
        receiptNumber: receiptNumber(),
        invoiceId: id,
        amount: body.amount,
        method: body.method,
        note: body.note || null,
      },
      include: {
        invoice: {
          include: {
            student: { select: { childName: true, parentName: true, phone: true, track: true } },
          },
        },
      },
    });
  }, { isolationLevel: "Serializable" });

  return json({ payment }, 201);
});
