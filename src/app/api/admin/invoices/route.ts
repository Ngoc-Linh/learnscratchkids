import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { ApiError, handler, json, readBody, requireAdmin } from "@/lib/api";

const schema = z.object({
  studentId: z.string().uuid(),
  description: z.string().trim().min(2, "Vui lòng nhập nội dung học phí").max(120),
  amount: z.coerce.number().int().min(1).max(1_000_000_000),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => {
      const timestamp = Date.parse(`${value}T00:00:00Z`);
      return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
    }, "Ngày thanh toán không hợp lệ")
    .nullable()
    .optional(),
  receivedAmount: z.coerce.number().int().min(0).max(1_000_000_000).default(0),
  method: z.enum(["CASH", "TRANSFER"]).default("TRANSFER"),
  note: z.string().trim().max(250).optional(),
}).refine((data) => data.receivedAmount <= data.amount, {
  message: "Số tiền thu không được lớn hơn tổng học phí",
  path: ["receivedAmount"],
});

function reference(prefix: string) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${prefix}-${date}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export const POST = handler(async (req) => {
  await requireAdmin();
  const body = await readBody(req, schema);
  const student = await db.student.findUnique({ where: { id: body.studentId }, select: { id: true } });
  if (!student) throw new ApiError("Không tìm thấy học viên", 404);

  const invoice = await db.$transaction(async (tx) => {
    const created = await tx.tuitionInvoice.create({
      data: {
        number: reference("SK"),
        studentId: body.studentId,
        description: body.description,
        amount: body.amount,
        dueDate: body.dueDate ? new Date(`${body.dueDate}T00:00:00+07:00`) : null,
      },
    });
    if (body.receivedAmount > 0) {
      await tx.tuitionPayment.create({
        data: {
          receiptNumber: reference("PT"),
          invoiceId: created.id,
          amount: body.receivedAmount,
          method: body.method,
          note: body.note || null,
        },
      });
    }
    return tx.tuitionInvoice.findUniqueOrThrow({
      where: { id: created.id },
      include: {
        student: { select: { childName: true, parentName: true, phone: true, track: true } },
        payments: true,
      },
    });
  });

  return json({
    invoice: {
      ...invoice,
      paidAmount: invoice.payments.reduce((sum, payment) => sum + payment.amount, 0),
    },
  }, 201);
});
